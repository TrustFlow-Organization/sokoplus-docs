import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { GATED_PAGES } from './helpers'

interface SearchItem {
  id: string
  lang: string
  section: string
  slug: string
  title: string
}

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url))
const SITE_URL = 'https://docs.sokopluss.co.tz'
const LANGS = ['en', 'sw'] as const
const EXPECTED_INDEX_ENTRIES = 52
const EXPECTED_SITEMAP_URLS = 107

function readIndex(lang: (typeof LANGS)[number]): SearchItem[] {
  return JSON.parse(
    readFileSync(`${PUBLIC_DIR}/search-index.${lang}.json`, 'utf8'),
  ) as SearchItem[]
}

function readSitemapUrls(): string[] {
  const sitemap = readFileSync(`${PUBLIC_DIR}/sitemap.xml`, 'utf8')
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
}

const indexes = {
  en: readIndex('en'),
  sw: readIndex('sw'),
}
const sitemapUrls = readSitemapUrls()

test('search indexes contain the expected entries and exclude every gated page', () => {
  for (const lang of LANGS) {
    const items = indexes[lang]
    expect(items, `${lang} search index entries`).toHaveLength(EXPECTED_INDEX_ENTRIES)

    const indexedPages = new Set(items.map((item) => `${item.section}/${item.slug}`))
    const indexedSlugs = new Set(items.map((item) => item.slug))

    for (const gated of GATED_PAGES) {
      expect(
        indexedPages.has(`${gated.section}/${gated.slug}`),
        `${lang} index should not include ${gated.section}/${gated.slug}`,
      ).toBe(false)
      expect(indexedSlugs.has(gated.slug), `${lang} index should not include ${gated.slug}`).toBe(
        false,
      )
    }
  }
})

test('sitemap contains the expected URLs and excludes every gated page', () => {
  const expectedFromIndexes = 3 + indexes.en.length + indexes.sw.length

  expect(sitemapUrls, 'sitemap URL entries').toHaveLength(EXPECTED_SITEMAP_URLS)
  expect(sitemapUrls).toHaveLength(expectedFromIndexes)
  expect(new Set(sitemapUrls).size).toBe(sitemapUrls.length)

  for (const lang of LANGS) {
    for (const gated of GATED_PAGES) {
      const gatedUrl = `${SITE_URL}/${lang}/${gated.section}/${gated.slug}`
      expect(sitemapUrls, `${lang} sitemap should not include ${gated.slug}`).not.toContain(
        gatedUrl,
      )
    }
  }

  expect(sitemapUrls).toContain(`${SITE_URL}/en/developers/introduction`)
  expect(sitemapUrls).toContain(`${SITE_URL}/sw/developers/introduction`)
})
