# Panduan: menambah fitur

Prosedur ini jarang dipakai, jadi tidak dimuat ke setiap sesi agent. Konvensi tiap folder dimuat
otomatis dari `.claude/rules/` saat file di folder itu disentuh. Contoh kode lengkap:
`src/module/core/features/branches/`; detail pola: `docs/patterns/feature-module.md`.

1. Buat `src/module/<domain>/features/<feature>/` dengan `api/`, `hooks/`, `types/`, `views/`,
   `pages/`, dan `components/` sesuai kebutuhan.
2. Daftarkan URL backend di `endpoints` (`src/shared/lib/axios.ts`), tulis fungsi di
   `api/index.ts`, dan dokumentasikan di `docs/api/<feature>.md` (format di
   [docs/api/README.md](../api/README.md)).
3. Tambah path di `src/routes/paths.ts`, route `lazy()` di `src/routes/sections/dashboard.tsx`
   (dibungkus `gated(PERM...)` bila butuh permission), dan menu di
   `src/layouts/nav-config-dashboard.tsx`. Permission baru masuk ke `PERM`
   (`src/shared/lib/permissions.ts`).
4. Buat namespace i18n `src/locales/langs/{id,en}/<feature>.json` dengan key yang sama.
5. Tulis test di samping kodenya: unit test untuk tiap hook dan util, integration test untuk
   form atau alur kritis (`.claude/rules/tests.md`).
6. Catat di `CHANGELOG.md` bagian `## [Unreleased]`, lalu `yarn check:all`.
