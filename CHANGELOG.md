# Changelog

## [Unreleased]

### Added

- Admin › People › API keys: a copy button on each active key copies the full key to the clipboard
  (`GET /core/v1/admin/api-keys/:id/reveal`) without showing it; keys issued before reveal existed
  show the server message to issue a new key.
- Sessions grid, person recent sessions and session detail show every model a session used
  (`models`), not only the current one.

### Changed

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
