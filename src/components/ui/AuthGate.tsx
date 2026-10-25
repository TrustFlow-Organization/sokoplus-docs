import type { ReactNode } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useDocsSession } from '@/lib/docsAuth'
import { isLang, DEFAULT_LANG } from '@/i18n'

export function RequireDocs({
  children,
  superAdmin = false,
}: {
  children: ReactNode
  superAdmin?: boolean
}) {
  const session = useDocsSession()
  const location = useLocation()
  const { lang: langParam } = useParams<{ lang?: string }>()
  const lang = isLang(langParam) ? langParam : DEFAULT_LANG
  const target = `${location.pathname}${location.search}`

  if (!session) {
    return (
      <Navigate
        to={`/login?lang=${lang}&next=${encodeURIComponent(target)}`}
        replace
      />
    )
  }

  if (superAdmin && session.role !== 'superAdmin') {
    return <Navigate to={`/${lang}/developers`} replace />
  }

  return <>{children}</>
}
