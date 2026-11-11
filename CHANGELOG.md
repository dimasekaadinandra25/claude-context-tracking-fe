# Changelog

## [Unreleased]

### Added

- Plan usage report: a member x day grid for the last 7 days on the overview with input (including
  cache), output, 7-day limit used and estimated cost per day, plus totals, share and members with no
  usage (`GET /usage/v1/daily`).
- Plan limits card on member detail shows the Claude account and plan, the week elapsed marker, the
  weekly allowance in dollars and a per-day chart of the 7-day limit with a pace line.
- Members sharing one Claude account split its daily cost by token share.
- Export image on the plan usage card: downloads a PNG report with the Claude account limit, the
  daily limit chart and the per member grid for the current 7-day window.
- The exported image lists each model under the weekly limit with its share of tokens, requests,
  input and output.
- Shares are rounded together so they always add up to 100%.
- Request count under each member's name in the plan usage grid and the report image.
- Models by member card on the Models page: each member's share and requests per model (`GET /usage/v1/member-models`).
- Code activity card on the overview, member detail and session detail: lines added and removed,
  commits, output tokens per commit and tool calls (`GET /usage/v1/tools`). Lines changed and
  commits columns in Members.
- Plan limits: 5h and 7d limit columns in Members, with a warning colour at 80% and an alert colour
  at 90%, and a card on member detail. Shown for members who turned on plan limits in the app.
- Cache hit rate (cache reads / all input): a KPI tile on the overview and member detail with the
  previous-period change, and a column in Members, Sessions (in range, hidden by default) and
  Projects. Shows "—" when there was no input.
- Context pressure: an overview card listing members with near-full sessions or compactions, and
  the member's own two numbers on member detail.
- Projects page (`/dashboard/projects`, `GET /usage/v1/projects`): new context, requests, sessions,
  members (admin), models, cache hit rate, compactions, near-full sessions and overhead per request
  with a breakdown bar; project links open the sessions list filtered by project; CSV export and an
  admin member filter.
- Session detail: an Overhead per request card (system prompt & tools, memory files, agents,
  skills, total) when the server sends `overhead`.
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
- Phone and tablet layouts: KPI tiles two per row on phones, page header actions wrap under the
  title, filters stack, tables scroll sideways instead of wrapping into tall rows, heatmap day
  labels stay pinned while its hours scroll, the models donut legend moves below the chart, and the
  Members, Sessions and Projects grids hide low-value columns by default on phones.
- Contrast: placeholder, unshrunk label and nav subheader text (`text.disabled`) and the dark
  status shades (accent, success, warning) meet WCAG AA on glass cards in both themes; colored
  text and outlined buttons use the dark shade in light mode.
- Overview KPI tiles sit 4 + 3 on wide screens and the last tile spans the row below that; chart
  cards in a row share one height and align their content with the card title; Context pressure
  names truncate on phones so both counts stay visible; dates and admin actions no longer wrap.
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
