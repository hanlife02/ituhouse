from __future__ import annotations

import secrets
import string
from datetime import timedelta
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, get_password_hash, require_roles, verify_password
from .config import get_settings
from .database import get_db
from .initialization import run_initialization
from .email_service import send_verification_email
from .models import AboutSection, Comment, EmailVerificationCode, Post, User, UserRole
from .schemas import (
    AboutSectionResponse,
    AboutSectionUpdate,
    CommentCreate,
    CommentResponse,
    EmailCodeRequest,
    LoginRequest,
    PaginatedPosts,
    PostCreate,
    PostResponse,
    RegisterRequest,
    RoleUpdateRequest,
    TokenResponse,
    UserResponse,
)
from .timezone import now

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    description="Backend service for 小兔书 · ituhouse.",
    version="0.1.0",
)

cors_origins = settings.cors_allow_origins or ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in cors_origins else cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    run_initialization()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _generate_code(length: int = 6) -> str:
    digits = string.digits
    return "".join(secrets.choice(digits) for _ in range(length))


@app.post("/auth/request-code", status_code=status.HTTP_202_ACCEPTED)
def request_email_code(payload: EmailCodeRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    normalized_email = payload.email.strip().lower()
    code = _generate_code()
    expires_at = now() + timedelta(minutes=15)
    entity = EmailVerificationCode(
        email=normalized_email,
        code=code,
        expires_at=expires_at,
    )
    db.add(entity)
    db.commit()
    email_sent = send_verification_email(
        to_email=normalized_email,
        code=code,
        app_name=settings.app_name,
    )
    is_production = settings.environment.lower() == "production"
    if not email_sent and is_production:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send verification email")
    response: dict[str, str] = {"message": "Verification code generated"}
    if not is_production:
        response["code"] = code
    return response


@app.post("/auth/register", response_model=UserResponse)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    normalized_email = payload.email.strip().lower()
    current_time = now()
    code_entry = (
        db.query(EmailVerificationCode)
        .filter(
            func.lower(EmailVerificationCode.email) == normalized_email,
            EmailVerificationCode.code == payload.verification_code,
            EmailVerificationCode.used.is_(False),
            EmailVerificationCode.expires_at > current_time,
        )
        .order_by(EmailVerificationCode.created_at.desc())
        .first()
    )
    if not code_entry:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")

    existing_email = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="email already registered")

    existing_username = db.query(User).filter(User.username == payload.username).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="username already registered")

    user = User(
        username=payload.username,
        email=normalized_email,
        hashed_password=get_password_hash(payload.password),
        role=UserRole.USER,
        preferred_locale=payload.preferred_locale or settings.default_locale,
        preferred_theme=payload.preferred_theme or settings.default_theme,
        email_verified=True,
    )
    db.add(user)
    code_entry.used = True
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    identifier = payload.identifier.strip()
    query = db.query(User).filter(
        (func.lower(User.email) == func.lower(identifier)) | (User.username == identifier)
    )
    user = query.one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive")
    token = create_access_token(subject=str(user.id), role=user.role)
    return TokenResponse(access_token=token)


@app.get("/auth/me", response_model=UserResponse)
def current_user_profile(current_user: User = Depends(get_current_user)) -> UserResponse:
    return current_user


@app.get("/posts", response_model=PaginatedPosts)
def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=20),
    db: Session = Depends(get_db),
) -> PaginatedPosts:
    total = db.query(func.count(Post.id)).scalar() or 0
    items = (
        db.query(Post)
        .order_by(Post.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    has_more = page * page_size < total
    return PaginatedPosts(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        has_more=has_more,
    )


@app.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    current_user: User = Depends(require_roles(UserRole.USER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> PostResponse:
    post = Post(
        title=payload.title,
        content=payload.content,
        image_url=payload.image_url,
        author_id=current_user.id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@app.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: UUID, db: Session = Depends(get_db)) -> PostResponse:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@app.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
def get_comments(post_id: UUID, db: Session = Depends(get_db)) -> list[CommentResponse]:
    comments = (
        db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    )
    return comments


@app.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: UUID,
    payload: CommentCreate,
    current_user: User = Depends(require_roles(UserRole.USER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> CommentResponse:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    comment = Comment(content=payload.content, author_id=current_user.id, post_id=post_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@app.get("/about/sections", response_model=list[AboutSectionResponse])
def get_about_sections(db: Session = Depends(get_db)) -> list[AboutSectionResponse]:
    return db.query(AboutSection).order_by(AboutSection.id.asc()).all()


@app.put("/about/sections/{slug}", response_model=AboutSectionResponse)
def update_about_section(
    slug: str,
    payload: AboutSectionUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> AboutSectionResponse:
    section = db.query(AboutSection).filter(AboutSection.slug == slug).one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    if payload.title:
        section.title = payload.title
    section.body_markdown = payload.body_markdown
    section.updated_by = current_user.id
    section.updated_at = now()
    db.commit()
    db.refresh(section)
    return section


@app.patch("/admin/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: UUID,
    payload: RoleUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.SUPERADMIN)),
    db: Session = Depends(get_db),
) -> UserResponse:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role == UserRole.SUPERADMIN and payload.role != UserRole.SUPERADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot demote super admin")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user
