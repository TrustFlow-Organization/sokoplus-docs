import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { HomePage } from '@/app/HomePage'
import { DocsLayout } from '@/app/DocsLayout'
import { SectionIndex } from '@/app/SectionIndex'
import { ArticlePage } from '@/app/ArticlePage'
import { NotFoundPage } from '@/app/NotFoundPage'
import { LoginPage } from '@/app/LoginPage'
import { RequireDocs } from '@/components/ui/AuthGate'
import { getArticle } from '@/lib/content'
import { isLang, DEFAULT_LANG } from '@/i18n'
import type { Section } from '@/lib/content'

function SectionArticle({ section }: { section: Section }) {
  const { lang: langParam, slug = '' } = useParams<{ lang?: string; slug?: string }>()
  const lang = isLang(langParam) ? langParam : DEFAULT_LANG
  const article = getArticle(section, lang, slug)

  if (!article?.visibility) return <ArticlePage section={section} />

  return (
    <RequireDocs superAdmin={article.visibility === 'superAdmin'}>
      <ArticlePage section={section} />
    </RequireDocs>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/en" replace /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: ':lang',
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'help',
            element: <DocsLayout section="help" />,
            children: [
              { index: true, element: <SectionIndex section="help" /> },
              { path: ':slug', element: <SectionArticle section="help" /> },
            ],
          },
          {
            path: 'developers',
            element: <DocsLayout section="developers" />,
            children: [
              { index: true, element: <SectionIndex section="developers" /> },
              { path: ':slug', element: <SectionArticle section="developers" /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
