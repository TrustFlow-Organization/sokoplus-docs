import type { ComponentType } from 'react'
import type { Lang } from '@/i18n'

export type Section = 'help' | 'developers'

export interface ArticleFrontmatter {
  title: string
  description?: string
  group?: string
  order?: number
  updated?: string
  sidebar?: boolean
  visibility?: 'admin' | 'superAdmin'
}

export interface ContentModule {
  default: ComponentType
  frontmatter: ArticleFrontmatter
}

export interface Article {
  id: string
  lang: Lang
  section: Section
  slug: string
  title: string
  description: string
  group: string
  order: number
  updated?: string
  visibility?: 'admin' | 'superAdmin'
  Component: ComponentType
}

const raw = import.meta.glob<ContentModule>('../content/**/*.mdx', { eager: true })

const articles: Article[] = Object.entries(raw).map(([path, mod]) => {
  const normalized = path.replace('../content/', '').replace(/\\/g, '/')
  const [lang, section, file] = normalized.split('/')
  const slug = file.replace(/\.mdx$/, '')
  const fm = mod.frontmatter ?? {}
  return {
    id: `${lang}-${section}-${slug}`,
    lang: lang as Lang,
    section: section as Section,
    slug,
    title: fm.title ?? slug,
    description: fm.description ?? '',
    group: fm.group ?? '',
    order: typeof fm.order === 'number' ? fm.order : 999,
    updated: fm.updated,
    visibility: fm.visibility,
    Component: mod.default,
  }
})

export function getArticles(opts?: {
  lang?: Lang
  section?: Section
  group?: string
}): Article[] {
  return articles
    .filter((a) => {
      if (opts?.lang && a.lang !== opts.lang) return false
      if (opts?.section && a.section !== opts.section) return false
      if (opts?.group && a.group !== opts.group) return false
      return true
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function getGroups(section: Section, lang: Lang): string[] {
  const groups = new Set<string>()
  for (const a of getArticles({ section, lang })) {
    if (a.group) groups.add(a.group)
  }
  return [...groups]
}

export function getArticle(
  section: Section,
  lang: Lang,
  slug: string,
): Article | undefined {
  return getArticles({ section, lang }).find((a) => a.slug === slug)
}

export function getPrevNext(
  section: Section,
  lang: Lang,
  slug: string,
  filter?: (article: Article) => boolean,
): { prev?: Article; next?: Article } {
  const list = getArticles({ section, lang }).filter(filter ?? (() => true))
  const idx = list.findIndex((a) => a.slug === slug)
  if (idx === -1) return {}
  return { prev: list[idx - 1], next: list[idx + 1] }
}
