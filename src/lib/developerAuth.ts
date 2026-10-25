import { setSession } from '@/lib/docsAuth'
import type { DocsSession } from '@/lib/docsApi'

export const DEVELOPER_EMAIL = 'developer@sokopluss.co.tz'
export const DEVELOPER_SESSION_TOKEN = 'local-developer-session'

const DEVELOPER_PASSWORD = 'Dev@sokoplus'

export function signInDeveloper(email: string, password: string): boolean {
  if (email.trim().toLowerCase() !== DEVELOPER_EMAIL) return false
  if (password !== DEVELOPER_PASSWORD) return false

  setSession({
    token: DEVELOPER_SESSION_TOKEN,
    role: 'superAdmin',
    name: 'Developer',
    email: DEVELOPER_EMAIL,
    local: true,
  })
  return true
}

export function isLocalSession(session: DocsSession | null): boolean {
  return session?.local === true || session?.token === DEVELOPER_SESSION_TOKEN
}
