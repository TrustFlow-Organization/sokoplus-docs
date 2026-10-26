import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, ShieldCheck, Truck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import type { Lang } from '@/i18n'

export function Footer({ lang }: { lang: Lang }) {
  const { t } = useTranslation('footer')

  return (
    <footer className="border-t border-line bg-surface-dim">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-on-surface-variant">
            {t('tagline')}
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold">{t('quickLinks')}</p>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li>
              <Link to={`/${lang}/help`} className="transition-colors hover:text-brand">
                {t('helpCentre')}
              </Link>
            </li>
            <li>
              <Link to={`/${lang}/developers`} className="transition-colors hover:text-brand">
                {t('developers')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold">{t('languages')}</p>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li>
              <Link to={`/${lang}`} className="hover:text-brand">
                {t('english')}
              </Link>
            </li>
            <li>
              <Link to={`/sw`} className="hover:text-brand">
                {t('swahili')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <ShieldCheck className="h-4 w-4 text-brand" /> Verified sellers
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Truck className="h-4 w-4 text-brand" /> Nationwide delivery
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Heart className="h-4 w-4 text-brand" /> Built for East Africa
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-1.5 border-t border-line py-5 text-center text-xs text-on-surface-muted">
        <p>
          © {new Date().getFullYear()} SokoPlus. {t('copyright')}
        </p>
        <Link
          to={`/login?lang=${lang}`}
          className="text-on-surface-muted/80 transition-colors hover:text-on-surface-variant"
        >
          {t('docsAdmin')}
        </Link>
      </div>
    </footer>
  )
}
