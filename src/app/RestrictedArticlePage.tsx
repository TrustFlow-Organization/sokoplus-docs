import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, KeyRound, Loader2, Lock, ShieldAlert } from 'lucide-react'
import { docsApi, type Article } from '@/lib/docsApi'
import { clearSession, useDocsSession } from '@/lib/docsAuth'
import { isLocalSession } from '@/lib/developerAuth'
import { RequireDocs } from '@/components/ui/AuthGate'
import { MarkdownArticle } from '@/components/mdx/MarkdownArticle'
import { usePageMeta } from '@/lib/seo'
import { isLang, DEFAULT_LANG, type Lang } from '@/i18n'

type Status = 'loading' | 'ready' | 'forbidden' | 'error' | 'local'

export function RestrictedArticlePage() {
  const { lang: langParam, slug } = useParams<{ lang?: string; slug: string }>()
  const lang: Lang = isLang(langParam) ? langParam : DEFAULT_LANG
  const { t } = useTranslation('auth')
  const session = useDocsSession()
  const [status, setStatus] = useState<Status>('loading')
  const [article, setArticle] = useState<Article | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isLocalSession(session)) {
      setArticle(null)
      setMessage('')
      setStatus('local')
      return
    }
    let cancelled = false
    setStatus('loading')
    setArticle(null)
    docsApi
      .getArticle(lang, slug ?? '')
      .then((res) => {
        if (cancelled) return
        setArticle(res.article)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        const statusCode = (err as { status?: number }).status
        if (statusCode === 401) {
          clearSession()
          return
        }
        setMessage(err instanceof Error ? err.message : String(err))
        setStatus(statusCode === 403 ? 'forbidden' : 'error')
      })
    return () => {
      cancelled = true
    }
  }, [lang, slug, session])

  usePageMeta({
    title: article ? `${article.title} | SokoPlus Docs` : 'Restricted | SokoPlus Docs',
    description: article?.description ?? undefined,
    lang,
    canonicalPath: `/${lang}/developers/${slug}`,
  })

  if (status === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    )
  }

  if (status === 'local') {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-black">{t('localArticleTitle')}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{t('localArticleRestricted')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to={`/${lang}/redeem?next=${encodeURIComponent(`/${lang}/developers/${slug}`)}`}
            className="inline-flex rounded-lg bg-btn px-4 py-2 text-sm font-bold text-white hover:bg-btn-hover"
          >
            {t('redeemAccess')}
          </Link>
          <Link
            to={`/${lang}/developers`}
            className="inline-flex rounded-lg border border-line px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
          >
            {t('backToDocs')}
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'forbidden') {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-black">{t('superadminRequired')}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{message}</p>
        <Link
          to={`/${lang}/developers`}
          className="mt-6 inline-flex rounded-lg bg-btn px-4 py-2 text-sm font-bold text-white hover:bg-btn-hover"
        >
          {t('backToDocs')}
        </Link>
      </div>
    )
  }

  if (!article || status === 'error') {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-error/15 text-error">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-black">{t('articleUnavailable')}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{message || t('articleNotFound')}</p>
        <Link
          to={`/${lang}/developers`}
          className="mt-6 inline-flex rounded-lg bg-btn px-4 py-2 text-sm font-bold text-white hover:bg-btn-hover"
        >
          {t('backToDocs')}
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <Link
          to={`/${lang}/developers`}
          className="text-sm font-semibold text-on-surface-variant hover:text-brand"
        >
          ← {t('developers', { ns: 'developers' })}
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{article.title}</h1>
        {article.description && (
          <p className="mt-3 text-base text-on-surface-variant sm:text-lg">{article.description}</p>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-sm text-on-surface-muted">
          <Lock className="h-4 w-4" />
          {article.visibility === 'superAdmin'
            ? t('restrictedSuperadmin', { ns: 'auth' })
            : t('restrictedAdmin', { ns: 'auth' })}
          {article.updatedAt && (
            <>
              <span className="mx-1">·</span>
              <Calendar className="h-4 w-4" />
              {new Date(article.updatedAt).toLocaleDateString(lang)}
            </>
          )}
        </p>
      </header>

      <MarkdownArticle content={article.content} />
    </article>
  )
}

export function RestrictedArticlePageGate() {
  return (
    <RequireDocs>
      <RestrictedArticlePage />
    </RequireDocs>
  )
}
