# Adding a view

1. Create `src/module/usage/features/<feature>/` with `views/`, `pages/` and, as needed,
   `components/`, `hooks/`, `utils/`.
2. Add the backend URL to `endpoints` in `src/shared/lib/axios.ts`, the call to
   `src/module/usage/api/usage.ts` (default any field an older server may omit) and document it
   in `docs/api/usage.md` with a new `**Last Updated:**` line.
3. Add the path to `src/routes/paths.ts`, a `lazy()` route to `src/routes/sections/dashboard.tsx`
   (wrap in `admin(...)` for admin-only views) and the menu entry to
   `src/layouts/nav-config-dashboard.tsx`.
4. Put user-visible strings in `src/locales/langs/en/<namespace>.json` and read them with
   `useTranslate('<namespace>')`.
5. Write tests next to the code: unit tests for hooks and utils, an integration test with the
   fake backend for forms and flows.
6. Add a line to `CHANGELOG.md` under `## [Unreleased]`, then `yarn check:all`.
