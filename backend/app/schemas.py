from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from .models import UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int
    role: UserRole


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole
    preferred_locale: str
    preferred_theme: str
    email_verified: bool
    is_active: bool
    created_at: datetime


class UserResponse(UserBase):
    id: UUID

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    email: EmailStr
    verification_code: str = Field(min_length=6, max_length=6)
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)
    preferred_locale: str | None = None
    preferred_theme: str | None = None


class LoginRequest(BaseModel):
    identifier: str
    password: str


class EmailCodeRequest(BaseModel):
    email: EmailStr


class PostBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None


class PostCreate(PostBase):
    pass


class PostResponse(PostBase):
    id: UUID
    author_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    author_id: UUID
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedPosts(BaseModel):
    items: list[PostResponse]
    page: int
    page_size: int
    total: int
    has_more: bool


class AboutSectionResponse(BaseModel):
    id: int
    slug: str
    title: str
    body_markdown: str
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class AboutSectionUpdate(BaseModel):
    body_markdown: str
    title: Optional[str] = None


class RoleUpdateRequest(BaseModel):
    role: UserRole
