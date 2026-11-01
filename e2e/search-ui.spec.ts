import { expect, test, type Page } from '@playwright/test'
import { ADMIN_ACCOUNT, GATED_PAGES, login } from './helpers'

const GATED_TITLES = new Set(GATED_PAGES.map((gated) => gated.title))
const QUERIES = ['admin', 'deployment', 'permissions', 'environment', 'notes', 'flags']

async function searchResultTitles(page: Page, query: string): Promise<string[]> {
  const input = page.locator('header input[type="search"]').first()
  await input.fill(query)

  const panel = page.locator('header div.absolute.top-full')
  await expect(panel).toBeVisible()
  await expect(panel.getByText('Loading…')).toHaveCount(0)

  return panel.locator('ul li a > span:first-child').allTextContents()
}

test('guest search results never surface gated titles', async ({ page }) => {
  await page.goto('/en/developers')
  await expect(page.locator('header input[type="search"]').first()).toBeVisible()

  for (const query of QUERIES) {
    const titles = await searchResultTitles(page, query)
    expect(
      titles.filter((title) => GATED_TITLES.has(title)),
      `gated titles leaked for query "${query}"`,
    ).toEqual([])
  }
})

test('admin search results never surface gated titles', async ({ page }) => {
  await login(page, ADMIN_ACCOUNT)
  await expect(page).toHaveURL(/\/en\/developers$/)

  for (const query of QUERIES) {
    const titles = await searchResultTitles(page, query)
    expect(
      titles.filter((title) => GATED_TITLES.has(title)),
      `gated titles leaked for query "${query}"`,
    ).toEqual([])
  }
})
