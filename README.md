# SokoPlus Docs & Help Centre

Official documentation and help centre for the [SokoPlus](https://sokopluss.co.tz) platform. Bilingual (English + Swahili) static docs for buyers, vendors, service providers and delivery partners, plus a full developer API reference.

## Overview

- **Help Centre** (`/en/help`, `/sw/help`) — 31 guides per language covering account setup, ordering, payments, delivery, escrow, trust & safety and FAQ.
- **Developer docs** (`/en/developers`, `/sw/developers`) — 34 pages per language covering the REST API, authentication, payments/webhooks, data model and deployment.
- **Restricted admin docs** — developer API/admin, internal operations, permissions, feature-flag, deployment and environment pages, plus the admin help group, built from static MDX and gated in the frontend by a local developer login.

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | React 19 + Vite 8 (SPA) |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Content | MDX (frontmatter via `gray-matter`) rendered with `react-markdown` + custom MDX components |
| Syntax highlighting | Shiki (`@shikijs/rehype`, `github-light` theme) |
| i18n | i18next + react-i18next (EN / SW) |
| Search | Fuse.js against a build-time generated JSON index |
| Language | TypeScript (strict) |
| Package manager | pnpm |

## Getting Started

```bash
# install dependencies
pnpm install

# start the dev server (http://localhost:3001)
pnpm dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 3001 |
| `pnpm build` | Type-check + production build to `dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run ESLint |
| `pnpm check` | Run TypeScript type-check (`tsc --noEmit`) |
| `pnpm format` | Format the repo with Prettier |

## Environment Variables

The site is fully static and has no runtime backend dependency. No environment variables are required.

## Project Structure

```
src/
  app/            # Route pages (Home, Docs, Article, Section, Login)
  components/
    mdx/          # MDX rendering + custom components (Callout, Tabs, CodeBlock, Badge, Kbd)
    ui/           # TopBar, Sidebar, SearchBox, Footer, LanguageSwitcher, AuthGate, Logo, Button
  content/
    en/           # English MDX content (help/ + developers/)
    sw/           # Swahili MDX content (help/ + developers/)
  i18n/           # i18next init + locale JSON resources (en/, sw/)
  lib/            # content registry, nav, search, SEO, session/auth helpers
  main.tsx        # App entry
  router.tsx      # Route definitions
  styles.css      # Global styles / Tailwind entry
plugins/
  docs-static.mjs # Vite plugin: builds search-index.{en,sw}.json + sitemap.xml at build time
public/           # Static assets (favicon, icons, manifest, robots.txt, generated indexes)
```

## Content Authoring

Docs live in `src/content/<lang>/<section>/<slug>.mdx` as MDX with YAML frontmatter.

```yaml
---
title: Introduction
description: An overview of the SokoPlus platform API.
group: overview
order: 1
updated: 2026-08-03
---
```

- **`title`** (required) — heading shown in the sidebar, index and article header.
- **`description`** — summary used on cards, search results and SEO meta.
- **`group`** — sidebar/section group. Groups are defined per section in `src/lib/nav.ts` (`SECTION_GROUPS`).
- **`order`** — sort position within a group (ascending, then alphabetical).
- **`updated`** — "last updated" date shown on the article page.
- **`visibility`** — optional `admin` or `superAdmin`; gates the article behind the local developer login and excludes it from search and sitemap generation.

Custom MDX components available in articles: `<Callout type="note|tip|warning|danger">`, `<Tabs>`/`<Tab label>`, `<CodeBlock title>`, `<Badge color>`, `<Kbd>`. See `src/components/mdx/MdxComponents.tsx`.

Every article should have a matching file in both `en` and `sw`. Navigation labels and UI strings are translated in `src/i18n/locales/{en,sw}/*.json`.

## Build-Time Generated Files

A custom Vite plugin (`plugins/docs-static.mjs`) runs on `closeBundle` and writes into `public/`:

- `search-index.{en,sw}.json` — Fuse.js search index generated from MDX frontmatter + plain-text content.
- `sitemap.xml` — sitemap for `https://docs.sokopluss.co.tz`.

## Restricted Docs & Local Login

Restricted articles are static MDX with a `visibility` frontmatter field, so the docs site needs no backend API. The frontend gate is a UX boundary, not a security boundary: do not put real secrets in these pages.

- Sign in at `/login` with one of the local accounts defined in `src/lib/developerAuth.ts`.
  - Admin: `developer@sokopluss.co.tz` / `Dev@sokoplus` — admin-gated pages only.
  - Super admin: `superadmin@sokopluss.co.tz` / `Super@sokoplus` — admin and super-admin pages.
- Sessions are stored in `localStorage` (`docs.session`).
- Restricted pages are excluded from the generated search index and sitemap.
- The sidebar and section index only show articles the current session can read; `superAdmin`-only pages stay hidden from plain `admin` sessions.
- These credentials are compiled into the static bundle. They separate normal UI access only; they do not prevent someone from editing client state or reading bundled MDX.

## Deployment

Configured for Vercel in `vercel.json`:

```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The SPA rewrite sends all routes to `index.html`; `search-index.*.json` is cached for 1 hour.

## License

Proprietary. © SokoPlus. Not open source.
