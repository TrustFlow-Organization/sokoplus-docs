import { expect, test } from '@playwright/test'
import {
  ADMIN_ACCOUNT,
  GATED_PAGES,
  SUPERADMIN_ACCOUNT,
  docsPath,
  login,
  readStoredSession,
  seedSession,
} from './helpers'

test('wrong admin password shows an error and stays on the login page', async ({ page }) => {
  await page.goto('/login?lang=en')
  await page.locator('#login-email').fill(ADMIN_ACCOUNT.email)
  await page.locator('#login-password').fill('definitely-not-the-password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('alert')).toHaveText('Login failed. Please try again.')
  await expect(page).toHaveURL(/\/login\?lang=en$/)
  expect(await readStoredSession(page)).toBeNull()
})

test('admin login opens admin docs but is redirected away from super-admin docs', async ({
  page,
}) => {
  await login(page, ADMIN_ACCOUNT)
  await expect(page).toHaveURL(/\/en\/developers$/)

  await page.goto(docsPath('developers', 'api-admin'))
  await expect(
    page.getByRole('heading', { level: 1, name: 'Admin', exact: true }),
  ).toBeVisible()

  for (const slug of ['api-superadmin', 'deployment']) {
    await page.goto(docsPath('developers', slug))
    await expect(page).toHaveURL(/\/en\/developers$/)
  }
})

test('super-admin login opens super-admin pages and admin pages', async ({ page }) => {
  await login(page, SUPERADMIN_ACCOUNT)
  await expect(page).toHaveURL(/\/en\/developers$/)

  const pages = [
    { section: 'developers' as const, slug: 'api-superadmin', title: 'Super admin API' },
    { section: 'developers' as const, slug: 'deployment', title: 'Deployment' },
    { section: 'developers' as const, slug: 'api-admin', title: 'Admin' },
    { section: 'help' as const, slug: 'admin-notes', title: 'Internal notes' },
  ]

  for (const target of pages) {
    await page.goto(docsPath(target.section, target.slug))
    await expect(
      page.getByRole('heading', { level: 1, name: target.title, exact: true }),
    ).toBeVisible()
  }
})

test('guest direct access to every gated page redirects to login with next', async ({ page }) => {
  for (const gated of GATED_PAGES) {
    const target = docsPath(gated.section, gated.slug)
    await page.goto(target)
    await page.waitForURL((url) => url.pathname === '/login')

    const url = new URL(page.url())
    expect(url.searchParams.get('lang')).toBe('en')
    expect(url.searchParams.get('next')).toBe(target)
  }
})

test('stale local-developer-session is cleared and redirects to login', async ({ page }) => {
  await seedSession(page, {
    token: 'local-developer-session',
    role: 'admin',
    name: 'Admin',
    email: ADMIN_ACCOUNT.email,
    local: true,
  })

  const target = docsPath('developers', 'api-admin')
  await page.goto(target)
  await page.waitForURL((url) => url.pathname === '/login')

  const url = new URL(page.url())
  expect(url.searchParams.get('next')).toBe(target)
  expect(await readStoredSession(page)).toBeNull()
})

test('changing only the stored role does not grant super-admin access', async ({ page }) => {
  await seedSession(page, {
    token: ADMIN_ACCOUNT.token,
    role: 'superAdmin',
    name: ADMIN_ACCOUNT.name,
    email: ADMIN_ACCOUNT.email,
    local: true,
  })

  for (const slug of ['api-superadmin', 'deployment']) {
    await page.goto(docsPath('developers', slug))
    await expect(page).toHaveURL(/\/en\/developers$/)
  }

  await page.goto(docsPath('developers', 'api-admin'))
  await expect(
    page.getByRole('heading', { level: 1, name: 'Admin', exact: true }),
  ).toBeVisible()
})
