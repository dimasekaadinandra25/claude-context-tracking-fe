# CLAUDE.md

Claude Usage dashboard: web UI for `claude-usage-server` (team overview, person detail, sessions,
models, user and API key admin, change password). Architecture: `docs/architecture.md`; endpoints
the dashboard calls: `docs/api/`. Read them when needed, they are not imported here.

## Commands

```bash
yarn install        # Node >= 22.12, yarn 1.22.22 (packageManager field); yarn.lock is committed
yarn dev            # Vite on port 5173 + TypeScript/ESLint overlay (errors only)
yarn build          # tsc, then vite build
yarn typecheck      # tsc --noEmit
yarn test           # vitest run (jsdom); yarn test:watch for watch mode
yarn lint:changed   # ESLint --max-warnings 0 + Prettier on src/ files changed since BASE
yarn lint           # ESLint on all of src/; structure thresholds show as warnings
yarn lint:fix       # autofix, including import order
yarn check:all      # lint:changed + typecheck + test + check:changelog + check:doc-sync (= CI)
```

`BASE` comes from the argument or env `BASE`, then `git config kinerja.base`, then `origin/HEAD`.
The full stack (Postgres, API, dashboard on :3000) runs from `../claude-usage-server` with
`docker compose up -d --build --wait`; see `README.md`.

## Conventions

- Imports always use `src/...` (Vite alias + `baseUrl`), not deep relative paths across modules.
  Import order is enforced by `perfectionist/sort-imports`: run `yarn lint:fix`, don't sort by hand.
- Type-only imports use `import type`.
- HTTP goes only through the instance in `src/shared/lib/axios.ts` (Bearer header + refresh on
  401); endpoint URLs live only in `endpoints` in that file. Usage calls are in
  `src/module/usage/api/usage.ts`, which defaults fields an older server may omit.
- Errors from that instance are already `Error` (+ `.status`) with the server message: in a
  `catch`, read `err.message`.
- Local state + React Context; no Redux, SWR or React Query. Styling with MUI `sx`, no Tailwind.
- Every user-visible string goes through `t()` (`useTranslate('<namespace>')`) with keys in
  `src/locales/langs/en/<namespace>.json`, Zod messages included.
- Token counts use `formatTokens`; request counts use `toLocaleString()`.
- DataGrid tables share `components/grid-actions.tsx` (Columns + CSV export) and
  `hooks/use-column-visibility.ts` (per-table `localStorage`).

## Gotchas

- `VITE_*` env is inlined at build time and visible in the browser bundle; the Docker image takes
  build arg `VITE_SERVER_URL` (default `http://localhost:8080`). Changing env means rebuilding.
- Access token in `sessionStorage` (per tab), refresh token in `localStorage`: a new tab refreshes
  first, then calls `GET /core/v1/auth/me`.
- `user.must_change_password` makes `PasswordChangeGuard` send every dashboard route to
  `/dashboard/account/password` until the change succeeds and `me` is reloaded.
- `CONFIG.auth.skip = true` (`src/shared/config/index.ts`) disables the dashboard `AuthGuard` for
  dev without a backend; never commit it as `true`.
- Iconify names must be registered in `src/shared/ui/iconify/icon-sets.ts`; other names fail `tsc`.
- DataGrid only renders rows in jsdom with `autoHeight`; tests that look for grid cells need it.
- ESLint structure thresholds (function ≤ 50 lines, complexity ≤ 10, nesting ≤ 4, params ≤ 5,
  `.tsx` ≤ 300 lines, no magic numbers outside tests/theme/config) are `warn`, so `yarn lint`
  passes with old backlog, but `yarn lint:changed` and CI fail on any warning in a changed file.
- `src/_mock` and unused starter UI are leftovers; new code does not import them.

## Hard rules

- No secrets in `VITE_*` or committed files: every `VITE_*` ends up in the browser bundle.
- Never log tokens, passwords or personal data. No `console.log` in committed code (`no-console`;
  `console.warn`/`console.error` are allowed).
- No second axios instance and no `fetch` to the backend: those skip the auth header and refresh.
- No `any` (use `unknown` and narrow) and no unsanitised `dangerouslySetInnerHTML`.
- No code comments in new code. `eslint-disable` must name the rule and the reason.
- Changing `src/**/api/**` or `endpoints` requires a `docs/api/` update with a new
  `**Last Updated:**` line (`yarn check:doc-sync`); app code changes need a `CHANGELOG.md` entry
  under `## [Unreleased]` (`yarn check:changelog`).
- Changed hooks and utils have unit tests; auth and form flows have integration tests with
  Testing Library and the fake backend (`src/test/fake-backend.ts`).
