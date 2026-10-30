# Usage

**Module:** usage
**Kode FE:** `src/module/usage/api/usage.ts`
**Last Updated:** 2026-10-30

Server contract: `claude-usage-server/docs/api-contract/usage/README.md`. All calls send
`Authorization: Bearer <access_token>`. Report calls send `from`/`to` as UTC `Z` strings and `tz`
as the browser time zone (`buildRangeParams`).

| Method | Path | Function |
|--------|------|----------|
| GET | `/usage/v1/overview` | `getOverview(range, userId?)` |
| GET | `/usage/v1/timeseries` | `getTimeseries(range, interval, groupBy, userId?)` |
| GET | `/usage/v1/models` | `getModels(range, userId?)` |
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

Session rows from `getSessions` and the `getSession` detail carry `models`: every model the
session used, largest new context first. The `model` filter matches any of them.

Errors come back as `Error.message` from the server `errors.detail` or `message`.
The full API key from `adminIssueKey` is kept only in the issue dialog's state and dropped on close.
