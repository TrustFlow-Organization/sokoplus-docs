const API_BASE =
  (import.meta.env.VITE_DOCS_API_URL as string | undefined) ??
  '/api/docs'

export interface DocsSession {
  token: string
  role: 'admin' | 'superAdmin'
  name: string
  email: string
  exp?: number
  local?: boolean
}

export interface TokenRecord {
  id: string
  name: string
  email: string
  status: string
  tokenPreview: string
  createdAt: string
  expiresAt: string
  usedAt: string | null
  revokedAt: string | null
  createdByEmail: string
}

export interface ArticleMeta {
  slug: string
  lang: string
  title: string
  description: string | null
  group: string | null
  sortOrder: number
  visibility: 'admin' | 'superAdmin'
  updatedAt: string
}

export interface Article extends ArticleMeta {
  content: string
}

interface ApiError extends Error {
  status: number
}

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem('docs.session')
    if (!raw) return null
    const s = JSON.parse(raw) as DocsSession
    return s.token || null
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = (await res.json().catch(() => ({}))) as { message?: string }
  if (!res.ok) {
    const err = new Error(data.message ?? `Request failed (${res.status})`) as ApiError
    err.status = res.status
    throw err
  }
  return data as T
}

export const docsApi = {
  async login(email: string, password: string): Promise<{ token: string; role: string; message: string }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async redeem(
    name: string,
    email: string,
    token: string,
  ): Promise<{ token: string; role: string; name: string; email: string; expiresAt: string }> {
    return request('/auth/redeem', {
      method: 'POST',
      body: JSON.stringify({ name, email, token }),
    })
  },

  async getMe(): Promise<{ role: string; email: string; name: string; exp: number }> {
    return request('/auth/me')
  },

  async logout(): Promise<void> {
    await request('/auth/logout', { method: 'POST' })
  },

  async createToken(
    name: string,
    email: string,
    expiresInMinutes?: number,
  ): Promise<{
    token: string
    id: string
    email: string
    name: string
    expiresAt: string
    ttlMinutes: number
  }> {
    return request('/tokens', {
      method: 'POST',
      body: JSON.stringify({ name, email, expiresInMinutes }),
    })
  },

  async listTokens(): Promise<{ tokens: TokenRecord[] }> {
    return request('/tokens')
  },

  async revokeToken(id: string): Promise<{ message: string }> {
    return request(`/tokens/${id}/revoke`, { method: 'POST' })
  },

  async listArticles(): Promise<{ articles: ArticleMeta[] }> {
    return request('/articles')
  },

  async getArticle(lang: string, slug: string): Promise<{ article: Article }> {
    return request(`/articles/${lang}/${slug}`)
  },
}
