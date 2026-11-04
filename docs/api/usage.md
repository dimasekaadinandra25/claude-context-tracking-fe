# Usage

**Module:** usage
**Kode FE:** `src/module/usage/api/usage.ts`
**Last Updated:** 2026-11-03 (cache hit rate, context pressure, projects, overhead)

Server contract: `claude-usage-server/docs/api-contract/usage/README.md`. All calls send
`Authorization: Bearer <access_token>`. Report calls send `from`/`to` as UTC `Z` strings and `tz`
as the browser time zone (`buildRangeParams`).

| Method | Path | Function |
|--------|------|----------|
| GET | `/usage/v1/overview` | `getOverview(range, userId?)` |
| GET | `/usage/v1/timeseries` | `getTimeseries(range, interval, groupBy, userId?)` |
| GET | `/usage/v1/models` | `getModels(range, userId?)` |
| GET | `/usage/v1/projects` | `getProjects(range, userId?)` |
| GET | `/usage/v1/sessions` | `getSessions(range, query)` |
| GET | `/usage/v1/sessions/:id` | `getSession(id)` |
| GET | `/usage/v1/people` | `getPeople()` (admin) |
| GET | `/core/v1/admin/users` | `adminListUsers()` |
| POST | `/core/v1/admin/users` | `adminCreateUser(body)` |
| POST | `/core/v1/admin/users/:id/activate`, `/deactivate` | `adminSetActive(id, active)` |
| POST | `/core/v1/admin/users/:id/reset-password` | `adminResetPassword(id, password)` |
| POST | `/core/v1/admin/users/:id/api-keys` | `adminIssueKey(userId, name)` |
| GET | `/core/v1/admin/users/:id/api-keys` | `adminListKeys(userId)` |
| POST | `/core/v1/admin/api-keys/:id/revoke` | `adminRevokeKey(keyId)` |
| GET | `/core/v1/admin/api-keys/:id/reveal` | `adminRevealKey(keyId)` |

`output_tokens`, `subagent_requests` and `subagent_output_tokens` are read from overview people,
models rows, session rows (range sums) and session `hours`; overview totals are
`total_output_tokens`, `total_subagent_requests` and `total_subagent_output_tokens`. Timeseries
points carry the same three fields but no view reads them yet. `usage.ts` sets each missing field
to 0, so an older server shows zeros instead of breaking the page.

Overview people and session rows carry `input_tokens`, `cache_write_tokens` and
`cache_read_tokens` (session rows: in range); overview totals are `total_input_tokens`,
`total_cache_write_tokens` and `total_cache_read_tokens`. Cache hit rate is
`cache_read / (input + cache_write + cache_read)`, shown as "—" when the sum is 0. Overview people
also carry `sessions_near_full` and `compactions` (totals `total_sessions_near_full`,
`total_compactions`). `usage.ts` sets each missing field to 0.

Overview people also carry `lines_added`, `lines_removed` and `commits` in the range (totals
`total_lines_added`, `total_lines_removed`, `total_commits`), and the latest plan limits regardless
of range: `five_hour_used`, `five_hour_resets_at`, `seven_day_used`, `seven_day_resets_at` and
`limits_captured_at`, each null when never sent or once the window has reset. `getTools` returns
`{ tool, calls, lines_added, lines_removed, commits }` rows for the range, most calls first, and the
`getSession` detail has the same rows as `tools`.

`getProjects` returns one row per project (`""` = private sessions), sorted by `new_context` desc,
with the same cache and pressure fields plus `requests`, `output_tokens`, `sessions`, `members`,
`models` and `overhead`. `overhead` (`system_tokens`, `memory_tokens`, `agents_tokens`,
`skills_tokens`, or null) is also on the `getSession` detail; a missing one becomes null.

Overview people carry `app_version` (the desktop app version of the last sync, or null). `usage.ts`
sets a missing `app_version` to null.

Session rows from `getSessions` and the `getSession` detail carry `models`: every model the
session used, largest new context first. The `model` filter matches any of them.

Errors come back as `Error.message` from the server `errors.detail` or `message`.
The full API key from `adminIssueKey` is kept only in the issue dialog's state and dropped on close.
`adminRevealKey` returns the full key of an active key; the keys drawer writes it straight to the
clipboard and never renders or stores it. 409 means the key was issued before reveal existed (issue
a new key), 410 means it is no longer active.
