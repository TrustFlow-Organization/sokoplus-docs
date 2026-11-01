import type { Page } from '@playwright/test'

export const SESSION_KEY = 'docs.session'

export const ADMIN_ACCOUNT = {
  email: 'developer@sokopluss.co.tz',
  password: 'Dev@sokoplus',
  token: 'local-admin-session',
  role: 'admin' as const,
  name: 'Admin',
}

export const SUPERADMIN_ACCOUNT = {
  email: 'superadmin@sokopluss.co.tz',
  password: 'Super@sokoplus',
  token: 'local-superadmin-session',
  role: 'superAdmin' as const,
  name: 'Super Admin',
}

export interface GatedPage {
  section: 'developers' | 'help'
  slug: string
  title: string
}

export const GATED_PAGES: GatedPage[] = [
  { section: 'developers', slug: 'api-admin', title: 'Admin' },
  { section: 'developers', slug: 'api-superadmin', title: 'Super admin API' },
  { section: 'developers', slug: 'deployment', title: 'Deployment' },
  { section: 'developers', slug: 'environment-variables', title: 'Environment variables' },
  { section: 'developers', slug: 'roles-permissions', title: 'Roles & permissions' },
  { section: 'developers', slug: 'permissions', title: 'Permissions & roles' },
  {
    section: 'developers',
    slug: 'ecommerce-controls',
    title: 'Feature flags (ecommerce controls)',
  },
  { section: 'developers', slug: 'api-notes', title: 'Notes' },
  { section: 'developers', slug: 'api-tasks', title: 'Admin tasks' },
  { section: 'developers', slug: 'api-flags', title: 'Flags' },
  { section: 'help', slug: 'admin-notes', title: 'Internal notes' },
  { section: 'help', slug: 'admin-permissions', title: 'Who can do what — admin permissions' },
  { section: 'help', slug: 'flagging-and-tasks', title: 'Flags and admin tasks' },
  { section: 'help', slug: 'messages-and-customercare', title: 'Messages and CustomerCare' },
]

export const GATED_SLUGS = [...new Set(GATED_PAGES.map((page) => page.slug))]

export interface StoredSession {
  token: string
  role: 'admin' | 'superAdmin'
  name: string
  email: string
  exp?: number
  local?: boolean
}

export function docsPath(
  section: GatedPage['section'],
  slug: string,
  lang = 'en',
): string {
  return `/${lang}/${section}/${slug}`
}

export async function login(
  page: Page,
  account: { email: string; password: string },
  next = '/en/developers',
): Promise<void> {
  await page.goto(`/login?lang=en&next=${encodeURIComponent(next)}`)
  await page.locator('#login-email').fill(account.email)
  await page.locator('#login-password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL((url) => url.pathname === new URL(next, 'http://localhost').pathname)
}

export async function seedSession(page: Page, session: StoredSession): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value))
    },
    { key: SESSION_KEY, value: session },
  )
}

export async function readStoredSession(page: Page): Promise<StoredSession | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  }, SESSION_KEY)
}
