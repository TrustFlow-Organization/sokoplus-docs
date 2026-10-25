# currentplan1 — Docs (`sokoplus-docs`) execution detail

Companion to the master plan (`sokoplus-site/currentplan1.md`). Custom Vite + MDX SPA, EN + SW, sections `help` and `developers`. Content: `src/content/<lang>/<section>/<slug>.mdx`; frontmatter `title (required), description, group, order, updated, sidebar`; groups in `src/lib/nav.ts`.

Every new page ships in **both** `en/` and `sw/`.

---

## Phase 1 — Permissions & roles

**help/**
- `roles-explained.mdx` (update) — add the capability model in plain language, what each admin can do, and how a superAdmin delegates.
- `admin-permissions.mdx` (new) — "Who can do what": role defaults, per-admin overrides, region scope.

**developers/**
- `permissions.mdx` (new) — capability strings, resolution order (deny-wins), `GRANTABLE`, `auditedAction`, reason policy.
- `api-admin.mdx` (restricted, backend-seeded) — document `permissions/role/:role`, `permissions/:adminId`, `grant-matrix`, `regions/assign`, approve-with-reason.
- `data-model.mdx` (update) — `RolePermission`, `AdminAction`, `AdminNote`, `EntityFlag`, `AdminTask`, `Conversation.kind`, `ConversationParticipant`.

## Phase 2 — Management primitives

**help/**
- `admin-notes.mdx` (new) — follow-up notes on users/businesses.
- `flagging-and-tasks.mdx` (new) — how to flag, assign a task, and work the task lifecycle.

**developers/**
- `api-notes.mdx`, `api-flags.mdx`, `api-tasks.mdx` (new) — endpoints, payloads, status transitions, note-on-transition rule.

## Phase 3 — Chat

**help/**
- `messages-and-customercare.mdx` (new) — per-admin, company, region chat; how CustomerCare looks to customers vs admins.

**developers/**
- `api-conversations.mdx` (new) — `kind`, participants, masking, socket rooms.

## Phase 4/5 — Vendors / providers

- `becoming-a-vendor.mdx`, `managing-products.mdx` (update) — reflect new capabilities, notes, flags, tasks, reactivation reason.
- `becoming-a-provider.mdx`, `managing-services.mdx` (update) — same for providers.
- `api-products.mdx`, `api-services.mdx`, `api-orders.mdx` (update) — capability + audit notes.

## Phase 6 — Consolidation

- Update backend-seeded restricted pages (`roles-permissions`, `api-admin`, `deployment`, `environment-variables`) via `prisma/seedDocsContent.ts` in `sokoplus-backend` so the restricted docs match the static ones.
- Sweep existing `developer` pages for stale permission-key names; replace with capabilities where relevant.

---

## Authoring conventions

- Frontmatter example:

```yaml
---
title: Platform roles explained
description: A plain-language guide to every role on SokoPlus.
group: getting-started
order: 4
updated: 2026-10-17
---
```

- Group must exist in `src/lib/nav.ts` (`SECTION_GROUPS`), or add it there.
- Both `en/` and `sw/` are required for every page.
- Build check before finishing:

```
pnpm check    # tsc --noEmit
pnpm lint
pnpm build
```
