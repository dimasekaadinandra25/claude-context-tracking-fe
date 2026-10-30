# Auth

**Module:** core
**Kode FE:** `src/module/core/features/auth/api/index.ts`
**Last Updated:** 2026-10-30

Server contract: `claude-usage-server/docs/api-contract/core/auth.md`.

| Method | Path | Function | Body | `data` | Auth |
|--------|------|----------|------|--------|------|
| POST | `/core/v1/auth/signin` | `signIn` | `{ email, password }` (email or username) | `SignInResponse` | none, without refresh |
| POST | `/core/v1/auth/refresh` | `refreshTokens` | `{ refresh_token }` | `TokenPair` | none, without refresh |
| POST | `/core/v1/auth/logout` | `logout` | `{ refresh_token }` | `null` | Bearer |
| GET | `/core/v1/auth/me` | `getMe` | - | `MeResponse` (`is_super_admin` decides admin views) | Bearer |

401 on sign-in shows the server `message` (`Invalid credentials`, `User account is not active`).
A failed refresh signs the user out.
