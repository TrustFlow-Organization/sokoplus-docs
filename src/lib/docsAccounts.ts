export type DocsRole = 'admin' | 'superAdmin'

export interface LocalAccount {
  email: string
  password: string
  token: string
  role: DocsRole
  name: string
}

export const LOCAL_ACCOUNTS: LocalAccount[] = [
  {
    email: 'developer@sokopluss.co.tz',
    password: 'Dev@sokoplus',
    token: 'local-admin-session',
    role: 'admin',
    name: 'Admin',
  },
  {
    email: 'superadmin@sokopluss.co.tz',
    password: 'Super@sokoplus',
    token: 'local-superadmin-session',
    role: 'superAdmin',
    name: 'Super Admin',
  },
]

export const ADMIN_EMAIL = 'developer@sokopluss.co.tz'
export const SUPERADMIN_EMAIL = 'superadmin@sokopluss.co.tz'

export function findLocalAccountByToken(token: string | null | undefined): LocalAccount | undefined {
  return LOCAL_ACCOUNTS.find((account) => account.token === token)
}
