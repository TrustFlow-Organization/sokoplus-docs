import { setSession, type DocsSession } from '@/lib/docsAuth'
import { LOCAL_ACCOUNTS, findLocalAccountByToken } from '@/lib/docsAccounts'

export { ADMIN_EMAIL, SUPERADMIN_EMAIL } from '@/lib/docsAccounts'

export function signInDeveloper(email: string, password: string): boolean {
  const normalized = email.trim().toLowerCase()
  const account = LOCAL_ACCOUNTS.find(
    (candidate) => candidate.email === normalized && candidate.password === password,
  )
  if (!account) return false

  setSession({
    token: account.token,
    role: account.role,
    name: account.name,
    email: account.email,
    local: true,
  })
  return true
}

export function isLocalSession(session: DocsSession | null): boolean {
  return (
    session?.local === true ||
    findLocalAccountByToken(session?.token) !== undefined
  )
}
