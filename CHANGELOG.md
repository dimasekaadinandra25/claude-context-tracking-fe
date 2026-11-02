# Changelog

## [Unreleased]

### Added

- Members table: an App version column with an Outdated chip for versions below the newest one,
  and a warning icon on Last synced when a member has not synced for over 24 hours.
- Heatmap drill-down: clicking a cell lists the dates behind it, newest first, each linking to the
  sessions of that hour. The sessions list takes `from`/`to` from the URL.
- Quick search (Ctrl+K / Cmd+K, or the search button in the nav footer): members (admin) and
  sessions, with arrow keys and Enter to open one.

- Change password page (`/dashboard/account/password`, account menu � Change password) with
  current / new / confirm fields (`POST /core/v1/auth/change-password`). While
  `must_change_password` is set, every dashboard route redirects there until the change succeeds.
- Output tokens and subagent usage: overview and person KPI tiles (Output tokens, Subagent
  requests), People and Models columns (output tokens, subagent requests, subagent output),
  Sessions columns (Output tokens, Subagent requests) and session detail totals. Fields an older
  server omits count as 0.
- CSV export on the overview People table and the Sessions grid: every column, raw numbers and
  ISO dates.

- Admin › People › API keys: a copy button on each active key copies the full key to the clipboard
  (`GET /core/v1/admin/api-keys/:id/reveal`) without showing it; keys issued before reveal existed
  show the server message to issue a new key.
- Sessions grid, person recent sessions and session detail show every model a session used
  (`models`), not only the current one.

### Changed

- Sessions grid fits a 1440px screen: Project, Requests, Subagent requests, Compactions and the
  separate latest / peak context columns are hidden by default (Columns menu, remembered per
  browser), and the latest / peak column no longer truncates.
- Sign-in page tagline reads "Track Claude Code context usage across your team."
- `CLAUDE.md` and `docs/` describe this dashboard; the starter skeleton's finance pattern docs
  (`docs/patterns/`, `docs/CONVENTIONS.md`) are removed.

- Claude palette (accent `#D97757`, warm neutrals for light and dark) and Claude-warm chart colors
  set once through the theme (`MuiChartsDataProvider`).
- Accent-tinted KPI tiles, an accent bar on card headers and a primary sign-in button.
- Original Claude Usage mark replaces the Venturo logo in the sidebar, auth pages and favicon.
- Token counts drop a trailing `.0` (`200K`, not `200.0K`); chart y-axes are wide enough for
  their tick labels.

### Removed

- Venturo and Tuai logo files under `public/logo/`.

## [0.1.0] - 2026-10-30

### Added

- Claude Usage dashboard built from `venturo-skeleton-react`: Team overview, Person detail,
  Sessions with drill-down, Models and Admin › People (members, password reset, activation,
  API keys shown once).
- Sign-in against `claude-usage-server` (`/core/v1/auth/*`); admins are `is_super_admin` users.

### Removed

- Firebase and Google sign-in, sign-up, companies, branches, roles, users, audit log, translation
  overrides, demo pages, demo dashboards, `_mock` data and the Indonesian locale.
