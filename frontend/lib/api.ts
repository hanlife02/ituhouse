const API_BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:8000"

type ApiFetchOptions = RequestInit & {
  token?: string
}

function buildHeaders(token?: string, initHeaders?: HeadersInit, body?: unknown): HeadersInit {
  const headers = new Headers(initHeaders || {})
  const shouldSetContentType = !(body instanceof FormData)
  if (shouldSetContentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  return headers
}

export async function apiFetch<TResponse>(path: string, options: ApiFetchOptions = {}): Promise<TResponse> {
  const { token, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders(token, rest.headers, rest.body),
  })

  const text = await response.text()
  const data = text ? safeParseJSON(text) : null

  if (!response.ok) {
    const detail = typeof data === "object" && data !== null ? (data as any).detail || (data as any).message : null
    throw new Error(detail || response.statusText || "请求失败")
  }

  return data as TResponse
}

function safeParseJSON(payload: string) {
  try {
    return JSON.parse(payload)
  } catch {
    return payload
  }
}

export function normalizePaginatedPosts(payload: unknown) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 1,
      page_size: payload.length,
      total: payload.length,
      has_more: false,
    }
  }

  if (typeof payload === "object" && payload !== null) {
    const candidate = payload as {
      items?: unknown
      page?: unknown
      page_size?: unknown
      total?: unknown
      has_more?: unknown
    }

    if (Array.isArray(candidate.items)) {
      return {
        items: candidate.items,
        page: typeof candidate.page === "number" ? candidate.page : 1,
        page_size: typeof candidate.page_size === "number" ? candidate.page_size : candidate.items.length,
        total: typeof candidate.total === "number" ? candidate.total : candidate.items.length,
        has_more: typeof candidate.has_more === "boolean" ? candidate.has_more : false,
      }
    }
  }

  throw new Error("帖子接口返回格式不正确，请检查 NEXT_PUBLIC_URL 是否指向后端服务")
}
