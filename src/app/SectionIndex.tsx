import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { getArticles } from '@/lib/content'
import { SECTION_GROUPS } from '@/lib/nav'
import { getSectionIcon } from '@/lib/sectionIcons'
import { canReadVisibility, useDocsSession } from '@/lib/docsAuth'
import { usePageMeta } from '@/lib/seo'
import { isLang, DEFAULT_LANG, type Lang } from '@/i18n'
import type { Section } from '@/lib/content'

export function SectionIndex({ section }: { section: Section }) {
  const { lang: langParam } = useParams()
  const lang: Lang = isLang(langParam) ? langParam : DEFAULT_LANG
  const { t } = useTranslation(section === 'help' ? 'help' : 'developers')
  const session = useDocsSession()

  usePageMeta({
    title: `${t('title')} | SokoPlus Docs`,
    description: t('subtitle'),
    lang,
    canonicalPath: `/${lang}/${section}`,
    alternatePaths: [
      { lang: 'en', path: `/en/${section}` },
      { lang: 'sw', path: `/sw/${section}` },
    ],
  })

  const groups = SECTION_GROUPS[section]
    .map((g) => ({
      key: g.key,
      icon: getSectionIcon(section, g.key),
      articles: getArticles({ section, lang, group: g.key }).filter((a) => canReadVisibility(a.visibility, session)),
    }))
    .filter((g) => g.articles.length > 0)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('title')}</h1>
      <p className="mt-3 text-base leading-relaxed text-on-surface-variant sm:text-lg">
        {t('subtitle')}
      </p>

      <div className="mt-10 space-y-10">
        {groups.map((group) => {
          const Icon: LucideIcon = group.icon
          return (
            <section key={group.key}>
              <div className="flex items-center gap-2.5 border-b border-line pb-2">
                <Icon className="h-5 w-5 text-brand" />
                <h2 className="text-xl font-black">{t(`groups.${group.key}`)}</h2>
                <span className="ml-auto rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-bold text-on-surface-variant">
                  {group.articles.length}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {group.articles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      to={`/${lang}/${section}/${a.slug}`}
                      className="group flex items-start justify-between gap-4 rounded-xl border border-line px-5 py-4 transition-colors hover:border-brand/40 hover:bg-brand-soft/40"
                    >
                      <div>
                        <p className="font-bold">{a.title}</p>
                        {a.description && (
                          <p className="mt-1 text-sm text-on-surface-variant">{a.description}</p>
                        )}
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-on-surface-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}