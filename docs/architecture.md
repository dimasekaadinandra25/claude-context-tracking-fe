# Architecture

Big-picture notes for the Claude Usage dashboard. Not loaded into agent sessions; read when you
need the overview. API calls the dashboard makes: [docs/api](api/README.md).

## Overview

React 19 + Vite 7 single-page app for `claude-usage-server`. MUI 7 with Emotion, `@mui/x-data-grid`
and `@mui/x-charts`, React Router 7 (data router), React Hook Form + Zod, Axios, i18next. State is
local plus React Context; no Redux, SWR or React Query. Built from a starter skeleton; leftovers
that no route reaches (`src/_mock`, unused shared UI) are not used by new code.

## Code layout

```
src/
├── main.tsx          # createBrowserRouter + <App>
├── app.tsx           # global providers, Snackbar, settings drawer
├── module/
│   ├── core/features/   # auth (sign-in, guards, change password), settings, error pages
│   └── usage/           # api/usage.ts, types.ts, shared components, hooks, utils
│       └── features/    # overview, person, sessions, models, admin-people
├── shared/           # api envelope helpers, config, lib/axios.ts, ui kit
├── layouts/          # auth-split, dashboard (sidebar + account menu), nav-config-dashboard.tsx
├── routes/           # paths.ts, sections/{auth,dashboard,index}.tsx
├── locales/          # i18next, JSON per namespace in langs/en/<namespace>.json
├── theme/            # Claude palette and component overrides
└── test/             # setup, fake backend, render with providers, fixtures
```

A feature folder holds `components/`, `hooks/`, `pages/` (lazy route leaf) and `views/` (page
content), plus `utils/` when needed. All usage endpoints live in `src/module/usage/api/usage.ts`.

## Routing

- `/auth/jwt/sign-in` behind `GuestGuard`.
- `/dashboard/*` behind `AuthGuard` (sign-in redirect with `returnTo`) and `PasswordChangeGuard`
  (while `user.must_change_password` is set, every route redirects to
  `/dashboard/account/password`).
- Views: `overview` and `admin/people` (admins only, `AdminGuard`), `person[/:id]`,
  `sessions[/:id]`, `models`, `account/password`. `/dashboard` sends admins to the overview and
  members to their person page.
- Pages load with `lazy()` inside a `<Suspense>` keyed by pathname. All paths are in
  [src/routes/paths.ts](../src/routes/paths.ts).

## Auth

[auth-provider.tsx](../src/module/core/features/auth/context/jwt/auth-provider.tsx) owns the
session. The access token is in `sessionStorage`, the refresh token in `localStorage`. On mount it
refreshes an expired access token, then loads `GET /core/v1/auth/me`; `user` carries
`is_super_admin` (admin views) and `must_change_password`. `checkUserSession()` reloads `me`, for
example after a password change.

## HTTP

[src/shared/lib/axios.ts](../src/shared/lib/axios.ts) exports the only axios instance and all
endpoint URLs (`endpoints`). It sends `Authorization: Bearer`, refreshes once on 401 for all
concurrent requests and retries them, and turns failures into `Error` with `.status` and the
server message. `usage.ts` fills fields an older server does not send (output and subagent
counts) with 0, so views never see `undefined`.

## Report range and refresh

`ReportRangeProvider` holds the selected range; report calls send it as UTC `from`/`to` plus the
browser `tz`. `useFetch` reloads on range change and every 60 s.

## Tables

Overview People and Sessions use `DataGrid` with a toolbar from `components/grid-actions.tsx`
(Columns panel and CSV export). Column visibility is stored per table in `localStorage` through
`hooks/use-column-visibility.ts`; Sessions hides low-value columns by default so the grid fits a
1440px screen. CSV export includes hidden columns and ignores value formatters, so numbers are
raw and dates ISO. Sessions export covers the loaded page.

## Quality

- ESLint structure thresholds (function ≤ 50 lines, complexity ≤ 10, `.tsx` ≤ 300 lines, no
  magic numbers outside tests/theme/config) are warnings; `yarn lint:changed` fails on any
  warning or Prettier difference in changed `src/` files.
- Vitest + jsdom + Testing Library, `*.test.ts(x)` next to the code. `src/test/fake-backend.ts`
  replaces the axios adapter so integration tests run the real auth interceptors.
- CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml)): changed-file lint, typecheck,
  tests, CHANGELOG and doc-sync checks, `CLAUDE.md` at most 200 lines.
