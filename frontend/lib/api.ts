const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_URL ||
  "http://localhost:8000"

type ApiFetchOptions = RequestInit & {
  token?: string
}

function buildHeaders(token?: string, initHeaders?: HeadersInit): HeadersInit {
  const headers = new Headers(initHeaders || {})
  if (!headers.has("Content-Type")) {
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
    headers: buildHeaders(token, rest.headers),
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
