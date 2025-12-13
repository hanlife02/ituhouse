export type UserRole = "visitor" | "user" | "admin" | "super_admin"

export type TokenResponse = {
  access_token: string
  token_type?: string
}

export type User = {
  id: string
  username: string
  email: string
  role: UserRole
  preferred_locale: string
  preferred_theme: string
  email_verified: boolean
  is_active: boolean
  created_at: string
}

export type Post = {
  id: string
  title: string
  content: string
  image_url?: string | null
  author_id: string
  created_at: string
  updated_at: string
}

export type Comment = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
}

export type PaginatedPosts = {
  items: Post[]
  page: number
  page_size: number
  total: number
  has_more: boolean
}

export type AboutSection = {
  id: number
  slug: string
  title: string
  body_markdown: string
  updated_at?: string | null
}

export type ImageUploadResponse = {
  url: string
  filename: string
  size: number
}
