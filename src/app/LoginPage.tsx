import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KeyRound, Lock, Mail } from 'lucide-react'
import { signInDeveloper } from '@/lib/developerAuth'
import { usePageMeta } from '@/lib/seo'
import { isLang, DEFAULT_LANG, type Lang } from '@/i18n'

export function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const langParam = searchParams.get('lang') ?? undefined
  const lang: Lang = isLang(langParam) ? langParam : DEFAULT_LANG
  const next = searchParams.get('next') || `/${lang}/developers`

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  usePageMeta({
    title: `${t('loginTitle')} | SokoPlus Docs`,
    description: t('loginDescription'),
    lang,
    canonicalPath: `/login?lang=${lang}`,
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!signInDeveloper(email, password)) {
      setError(t('loginFailed'))
      return
    }
    navigate(next, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="glass-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-black tracking-tight">{t('loginTitle')}</h1>
            <p className="text-sm text-on-surface-variant">{t('superadminOnly')}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-semibold">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-muted" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-dim py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-semibold">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-muted" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-dim py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm font-semibold text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-btn px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-btn-hover"
          >
            <Lock className="h-4 w-4" />
            {t('signIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
