import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getArticles } from '@/lib/content'
import { SECTION_GROUPS } from '@/lib/nav'
import { cn } from '@/lib/cn'
import { canReadVisibility, useDocsSession } from '@/lib/docsAuth'
import { Lock } from 'lucide-react'
import type { Section } from '@/lib/content'
import type { Lang } from '@/i18n'

export function Sidebar({
  section,
  lang,
  onNavigate,
}: {
  section: Section
  lang: Lang
  onNavigate?: () => void
}) {
  const { t } = useTranslation(section === 'help' ? 'help' : 'developers')
  const session = useDocsSession()

  return (
    <nav aria-label={t('title')} className="space-y-6">
      <Link
        to={`/${lang}/${section}`}
        onClick={onNavigate}
        className="block rounded-lg px-3 py-2 text-sm font-bold text-brand hover:bg-brand-soft"
      >
        {t('title')}
      </Link>
      {SECTION_GROUPS[section].map((group) => {
        const articles = getArticles({ section, lang, group: group.key }).filter((a) => canReadVisibility(a.visibility, session))
        if (articles.length === 0) return null
        return (
          <div key={group.key}>
            <p className="px-3 pb-2 text-[0.7rem] font-bold uppercase tracking-wider text-on-surface-muted">
              {t(`groups.${group.key}`)}
            </p>
            <ul className="ml-3 space-y-0.5 border-l border-line">
              {articles.map((article) => (
                <li key={article.slug}>
                  <NavLink
                    to={`/${lang}/${section}/${article.slug}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        '-ml-px block border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors',
                        isActive
                          ? 'border-brand font-semibold text-brand'
                          : 'border-transparent text-on-surface-variant hover:border-line-strong hover:text-on-surface',
                      )
                    }
                  >
                    <span className="flex items-center gap-1.5">
                      {article.visibility && <Lock className="h-3 w-3 shrink-0" />}
                      {article.title}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
