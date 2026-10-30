# Arsitektur

Ringkasan yang dipindah dari `CLAUDE.md` lama dan dicocokkan ulang dengan kode. Isinya bisa
dibaca dari kode, jadi tidak dimuat otomatis ke sesi agent; buka file ini bila butuh gambaran
besar. Pola UI per topik ada di [docs/README.md](README.md), kontrak API yang dipakai FE di
[docs/api](api/README.md).

## Gambaran umum

Frontend skeleton produk multi-tenant Venturo, berbasis Minimals MUI starter (v7.6.1):
Vite 7, React 19, React Router 7 (data router), MUI v7 + Emotion, React Hook Form + Zod,
Axios, i18next, Firebase Web SDK (login Google). State lokal + React Context; tidak ada Redux,
SWR, atau React Query.

## Struktur kode

```
src/
├── main.tsx          # createBrowserRouter + <App>, ErrorBoundary sebagai errorElement
├── app.tsx           # provider global
├── module/
│   ├── core/features/   # auth, settings, error, home, users, roles, branches, companies,
│   │                    # audit-log, translation-override, demo, demo-order
│   └── dashboard/       # halaman dashboard finance/monitoring/sales + komponen & util-nya
├── shared/           # api, config, constants, hooks, lib (axios, permissions, cache-registry,
│                     # firebase), types, ui, utils
├── layouts/          # auth-split, dashboard, simple, nav-config-*.tsx
├── routes/           # paths.ts, sections/{auth,dashboard,index}.tsx, hooks, components
├── locales/          # i18next + JSON per bahasa (langs/{id,en}/<namespace>.json)
├── theme/            # tema MUI (core, with-settings)
├── test/             # helper test bersama (setup, fake backend, render dengan provider)
└── _mock/            # data mock sisa starter; tidak dipakai fitur
```

Bentuk folder fitur: `api/`, `components/`, `hooks/`, `pages/`, `types/`, `views/`, `utils/`
(plus `context/`, `guard/` bila perlu). `pages/` adalah route leaf yang di-lazy-load; isi halaman
di `views/`. Aturan lengkapnya di `.claude/rules/feature-module.md`.

## Routing

- [src/routes/sections/index.tsx](../src/routes/sections/index.tsx) menggabungkan `authRoutes`
  (`/auth/jwt/sign-in`, `/auth/jwt/sign-up`, dibungkus `GuestGuard`), `dashboardRoutes` (dipasang
  di `/`, dibungkus `AuthGuard` kecuali `CONFIG.auth.skip`), dan halaman 404.
- Halaman dimuat dengan `lazy()` di dalam `<Suspense>` yang di-key dengan `pathname`, jadi fallback
  muncul lagi di setiap pindah route.
- Halaman yang butuh permission dibungkus `gated(require, element)` (`PermissionGuard` dengan
  `showForbidden`).
- Semua path di [src/routes/paths.ts](../src/routes/paths.ts). `CONFIG.auth.redirectPath` =
  `paths.dashboard.root` (`/`).

## App shell

[src/app.tsx](../src/app.tsx): `I18nProvider → AuthProvider → SettingsProvider → ThemeProvider →
LocalizationProvider → MotionLazy`, plus `ProgressBar`, `Snackbar`, `SettingsDrawer`,
`OnboardingDialog`, dan `TranslationOverrideSync`. Provider atau overlay global baru ditaruh di sini.

## Auth (JWT + multi-company)

[auth-provider.tsx](../src/module/core/features/auth/context/jwt/auth-provider.tsx) adalah
sumber kebenaran sesi:

- Access token di `sessionStorage` (`tuai.access_token`), refresh token dan company aktif di
  `localStorage` (`tuai.refresh_token`, `tuai.active_company_id`).
- Saat mount, `checkUserSession` me-refresh token bila access token tidak ada atau `exp`-nya lewat
  (payload JWT di-decode tanpa library), lalu memanggil `GET /core/v1/auth/me`. Bila `me` belum
  punya company, company tersimpan (atau primary/owner/pertama dari `GET /core/v1/auth/companies`)
  dipulihkan lewat `switch-company`.
- State: `user`, `company`, `client`, `roles`, `permissions`, `isSuperAdmin`, `companyVersion`.
  `switchCompany` meminta token pair baru untuk company itu, memanggil
  `invalidateAllCompanyCaches()` (`src/shared/lib/cache-registry.ts`), dan menaikkan
  `companyVersion` supaya hook data mengambil ulang.
- Guard di `auth/guard/`: `AuthGuard` (redirect ke sign-in dengan `returnTo`), `GuestGuard`
  (pengguna yang sudah login diarahkan ke `returnTo`), `PermissionGuard` (`require`, `mode`
  `all`/`any`, `fallback`, `showForbidden`; super admin selalu lolos).

## HTTP (shared axios)

[src/shared/lib/axios.ts](../src/shared/lib/axios.ts) mengekspor satu instance:

- Interceptor request memasang `Authorization: Bearer <access>`.
- Interceptor response: pada 401, memanggil handler refresh yang didaftarkan `AuthProvider` lewat
  `configureAxiosAuth(...)`, sekali untuk semua request yang gagal bersamaan (`refreshPromise`),
  lalu mengulang request. Refresh gagal → `onUnauthorized` → sesi dihapus.
  `withoutAuthRefresh(config)` mengecualikan request dari alur ini.
- Error dinormalisasi ke `Error` dengan `.status` dan pesan dari `errors` atau `message` envelope.
- `endpoints` memuat semua URL backend; `fetcher` adalah helper GET.

## i18n

i18next + react-i18next dengan loader JSON lazy
([locales-config.ts](../src/locales/locales-config.ts)). Bahasa: `en` (fallback) dan `id`, pilihan
user disimpan di `localStorage.i18nextLng`. `LocalizationProvider` menyelaraskan locale dayjs.
`TranslationOverrideSync` menerapkan override label dari backend.

## Layout

[src/layouts/](../src/layouts/): `auth-split` (sign-in/up), `dashboard` (shell utama + nav), `simple`.
Route disusun `<Guard><Layout><SuspenseOutlet /></Layout></Guard>`.

## Kualitas: lint dan test

- [eslint.config.mjs](../eslint.config.mjs) memasang ambang review Kinerja (`thresholdRules`:
  panjang fungsi, kompleksitas, nesting, parameter, panjang file, magic number, duplikasi,
  `no-explicit-any`, `no-console`) berlevel `warn`. `yarn lint` di seluruh `src/` tidak gagal
  karena pelanggaran lama; [scripts/lint-changed.sh](../scripts/lint-changed.sh) menjalankan
  ESLint dengan `--max-warnings 0` dan Prettier hanya pada file `src/` yang berubah sejak base.
- Test: Vitest + jsdom + Testing Library ([vitest.config.ts](../vitest.config.ts)), file
  `*.test.ts(x)` di samping kodenya. `src/test/fake-backend.ts` mengganti adapter axios sehingga
  test integrasi menjalankan interceptor auth yang sebenarnya.
- Gerbang PR: [.github/workflows/ci.yml](../.github/workflows/ci.yml) (lint file berubah,
  `tsc --noEmit`, test, CHANGELOG, doc-sync, batas 200 baris `CLAUDE.md`) dan
  [.githooks/commit-msg](../.githooks/commit-msg).
