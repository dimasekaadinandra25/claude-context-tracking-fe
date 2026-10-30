# Changelog

## [Unreleased]

## [0.1.0] - 2026-10-30

### Added

- Claude Usage dashboard built from `venturo-skeleton-react`: Team overview, Person detail,
  Sessions with drill-down, Models and Admin › People (members, password reset, activation,
  API keys shown once).
- Sign-in against `claude-usage-server` (`/core/v1/auth/*`); admins are `is_super_admin` users.

### Removed

- Firebase and Google sign-in, sign-up, companies, branches, roles, users, audit log, translation
  overrides, demo pages, demo dashboards, `_mock` data and the Indonesian locale.
