import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MDXProvider } from '@mdx-js/react'
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, Home, Lock } from 'lucide-react'
import { getArticle, getPrevNext } from '@/lib/content'
import { canReadVisibility, useDocsSession } from '@/lib/docsAuth'
import { mdxComponents } from '@/components/mdx'
import { usePageMeta } from '@/lib/seo'
import { cn } from '@/lib/cn'
import { isLang, DEFAULT_LANG, type Lang } from '@/i18n'
import type { Section } from '@/lib/content'

interface TocItem {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function useOnThisPage(section: Section) {
  const { t } = useTranslation(section === 'help' ? 'help' : 'developers')
  const proseRef = useRef<HTMLDivElement>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const root = proseRef.current
    if (!root) return
    const seen = new Map<string, number>()
    const items: TocItem[] = []
    root.querySelectorAll<HTMLElement>('.doc-prose h2, .doc-prose h3').forEach((el) => {
      const key = slugify(el.textContent ?? '') || 'section'
      const count = seen.get(key) ?? 0
      seen.set(key, count + 1)
      const id = count === 0 ? key : `${key}-${count + 1}`
      el.id = id
      items.push({ id, text: el.textContent ?? '', level: Number(el.tagName[1]) })
    })
    setToc(items)
    setActive(items[0]?.id ?? '')
  }, [])

  useEffect(() => {
    if (toc.length === 0) return
    const headings = toc
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          const el = visible[0].target as HTMLElement
          setActive(el.id)
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [toc])

  if (toc.length === 0) return null
  return { toc, active, proseRef, label: t('onThisPage') }
}

export function ArticlePage({ section }: { section: Section }) {
  const { lang: langParam, slug } = useParams<{ lang?: string; slug: string }>()
  const lang: Lang = isLang(langParam) ? langParam : DEFAULT_LANG
  const { t } = useTranslation(['common', section === 'help' ? 'help' : 'developers', 'auth'])
  const session = useDocsSession()

  const article = getArticle(section, lang, slug ?? '')
  const { prev, next } = getPrevNext(section, lang, slug ?? '', (item) => canReadVisibility(item.visibility, session))
  const toc = useOnThisPage(section)

  usePageMeta({
    title: article ? `${article.title} | SokoPlus Docs` : 'Not found | SokoPlus Docs',
    description: article?.description,
    lang,
    canonicalPath: `/${lang}/${section}/${slug}`,
    alternatePaths: [
      { lang: 'en', path: `/en/${section}/${slug}` },
      { lang: 'sw', path: `/sw/${section}/${slug}` },
    ],
  })

  if (!article) {
    return <Navigate to={`/${lang}/${section}`} replace />
  }

  const Article = article.Component
  const sectionTitle = section === 'help' ? t('help:title') : t('developers:title')

  return (
    <div className="xl:flex xl:items-start xl:justify-center xl:gap-14">
      <article className="w-full min-w-0 max-w-3xl">
        <header className="mb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            <Link
              to={`/${lang}`}
              className="inline-flex items-center gap-1 text-on-surface-variant transition-colors hover:text-brand"
            >
              <Home className="h-3.5 w-3.5" />
              {t('common:home')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-on-surface-muted" />
            <Link
              to={`/${lang}/${section}`}
              className="text-on-surface-variant transition-colors hover:text-brand"
            >
              {sectionTitle}
            </Link>
          </nav>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{article.title}</h1>
          {article.description && (
            <p className="mt-3 text-base leading-relaxed text-on-surface-variant sm:text-lg">
              {article.description}
            </p>
          )}
          {(article.visibility || article.updated) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {article.visibility && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-semibold text-warning">
                  <Lock className="h-4 w-4" />
                  {article.visibility === 'superAdmin'
                    ? t('auth:restrictedSuperadmin')
                    : t('auth:restrictedAdmin')}
                </span>
              )}
              {article.updated && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-sm text-on-surface-variant">
                  <Calendar className="h-4 w-4 text-brand" />
                  {t('common:updatedOn')} {article.updated}
                </span>
              )}
            </div>
          )}
        </header>

        <div ref={toc?.proseRef ?? undefined}>
          <MDXProvider components={mdxComponents}>
            <div className="doc-prose">
              <Article />
            </div>
          </MDXProvider>
        </div>

        <nav className="mt-12 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          {prev ? (
            <Link
              to={`/${lang}/${section}/${prev.slug}`}
              className="glass-card glass-card-hover flex items-center gap-3 p-4"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-on-surface-muted" />
              <span>
                <span className="block text-xs font-bold uppercase tracking-wider text-on-surface-muted">
                  {t('common:prev')}
                </span>
                <span className="mt-0.5 block font-bold">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/${lang}/${section}/${next.slug}`}
              className="glass-card glass-card-hover flex items-center justify-end gap-3 p-4 text-right"
            >
              <span>
                <span className="block text-xs font-bold uppercase tracking-wider text-on-surface-muted">
                  {t('common:next')}
                </span>
                <span className="mt-0.5 block font-bold">{next.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-on-surface-muted" />
            </Link>
          )}
        </nav>
      </article>

      {toc && toc.toc.length > 0 && (
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-60 shrink-0 overflow-y-auto pb-8 xl:block">
          <p className="px-3 pb-2 text-[0.7rem] font-bold uppercase tracking-wider text-on-surface-muted">
            {toc.label}
          </p>
          <nav aria-label={toc.label}>
            {toc.toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn('toc-link', item.level === 3 && 'is-3', toc.active === item.id && 'toc-link-active')}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  )
}