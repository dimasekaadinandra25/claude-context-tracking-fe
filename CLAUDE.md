# CLAUDE.md

Arsitektur: `docs/architecture.md`; pola UI per topik: `docs/README.md` (tabel "kapan dibaca");
kontrak API yang dipakai FE: `docs/api/`. Semua dibaca bila perlu, tidak di-import.
Aturan per folder (fitur, route, lapisan API, i18n, test, dokumen API) dimuat dari `.claude/rules/`.

## Perintah

```bash
yarn install        # Node >= 22.12, yarn 1.22.22 (field packageManager); yarn.lock ikut di-commit
yarn dev            # Vite di port 5173 + overlay TypeScript/ESLint (hanya error)
yarn build          # tsc lalu vite build
yarn typecheck      # tsc --noEmit
yarn test           # vitest run (jsdom); yarn test:watch untuk mode watch
yarn lint:changed   # ESLint --max-warnings 0 + Prettier, hanya file src/ yang berubah sejak BASE
yarn lint           # ESLint seluruh src/; ambang Kinerja tampil sebagai warning
yarn lint:fix       # autofix, termasuk urutan import
yarn check:all      # lint:changed + typecheck + test + check:changelog + check:doc-sync (sama dengan CI)
yarn hooks          # sekali per clone: pasang .githooks/commit-msg
```

`BASE` diambil dari argumen atau env `BASE`, lalu `git config kinerja.base`, lalu `origin/HEAD`,
lalu `origin/production`. Di project turunan set sekali: `git config kinerja.base origin/<branch-tujuan>`.
Setup lokal: `docs/guides/local-development.md`; fitur baru: `docs/guides/new-feature.md`.

## Konvensi yang berbeda dari kebiasaan

- Import selalu `src/...` (alias Vite + `baseUrl`), bukan relatif `../../`. Urutan import dipaksa
  `perfectionist/sort-imports` (error) dengan grup kustom: jalankan `yarn lint:fix`, jangan disusun manual.
- Import yang hanya tipe memakai `import type`.
- HTTP ke backend hanya lewat instance `src/shared/lib/axios.ts` (header Bearer + refresh saat 401);
  URL endpoint hanya di `endpoints.*` di file yang sama.
- Error dari instance itu sudah berupa `Error` (+ `.status`) dengan pesan dari `errors`/`message`
  backend: di `catch` cukup baca `err.message`.
- State lokal + React Context; tanpa Redux, SWR, atau React Query. Styling MUI `sx`, tanpa Tailwind.
- Teks yang dilihat user selalu lewat `t()` (`useTranslate('<namespace>')`), termasuk pesan Zod.

## Gotcha

- `docs/CONVENTIONS.md` dan `docs/patterns/*` memakai contoh `src/module/finance/**` (fund-transfer,
  cash-transactions, contacts, approval) yang tidak ada di skeleton ini. Polanya tetap berlaku; contoh
  kode yang ada: `src/module/core/features/branches/` (CRUD dialog + cache reference data).
- Env `VITE_*` di-inline Vite saat build dan terbaca di bundle browser; image Docker memakai build arg
  `VITE_SERVER_URL` (default `http://localhost:8080`). Mengubah env berarti build ulang.
- Access token di `sessionStorage` (per tab), refresh token di `localStorage`: tab baru selalu
  refresh token dulu sebelum `GET /core/v1/auth/me`.
- `CONFIG.auth.skip = true` (`src/shared/config/index.ts`) mematikan `AuthGuard` dashboard untuk dev
  tanpa backend; jangan di-commit dalam keadaan `true`.
- Nama icon Iconify hanya yang terdaftar di `src/shared/ui/iconify/icon-sets.ts`; nama lain gagal `tsc`.
- Ambang Kinerja di `eslint.config.mjs` berlevel `warn`, jadi `yarn lint` lulus dengan backlog lama.
  `yarn lint:changed` dan CI gagal pada warning apa pun di file yang berubah: mengubah file lama berarti
  membereskan pelanggaran lama di file itu juga.
- `max-lines-per-function` dan `complexity` melapor di baris awal fungsi; panjang dihitung termasuk
  baris kosong dan komentar, sama dengan reviewer Kinerja.

## Larangan keras

- Tidak ada secret di env `VITE_*` atau file yang di-commit: semua `VITE_*` ikut ke bundle browser.
- Token, password, dan data personal tidak pernah di-log. Tidak ada `console.log` di kode yang
  di-commit (`no-console`; `console.warn`/`console.error` boleh).
- Tidak membuat instance axios kedua atau memanggil backend dengan `fetch`: request itu lolos dari
  header auth dan refresh token.
- Tidak ada `any` (pakai `unknown` lalu narrow) dan tidak ada `dangerouslySetInnerHTML` tanpa sanitasi.
- Fitur mengambil data dari endpoint backend; `src/_mock` sisa starter dan tidak diimpor kode baru.
- `eslint-disable` wajib menyebut rule dan alasannya
  (`// eslint-disable-next-line react-hooks/exhaustive-deps -- hanya saat mount`).
- Tidak push ke branch PR setelah PR di-approve (dihitung pelanggaran, tidak direview).

## Standar review Kinerja

PR dinilai otomatis di kinerja.venturo.id; `yarn check:all`, hook, dan CI menegakkan sebagian besar.

- Struktur (−10 per temuan): fungsi ≤50 baris dari signature sampai `}` termasuk baris kosong dan
  komentar (komponen fungsi React ikut dihitung); kompleksitas ≤10; nesting ≤4; parameter ≤5 (satu objek
  props = 1); file ≤800 baris, file `.tsx`/`.jsx` ≤300; tanpa duplikasi; tanpa magic value di logika
  (literal di test, `src/theme`, `src/_mock`, dan config dikecualikan); tanpa kode mati.
- Aturan stack React yang paling sering kena: komponen >200 baris dipecah; dependency `useEffect`
  lengkap dan langganan/timer di-cleanup; tidak mendefinisikan komponen di dalam komponen; `key` list
  dinamis bukan index; logika bisnis di hook atau `api/`, bukan di komponen.
- Doc sync (10 poin, biner): perubahan `src/**/api/**`, `src/**/services/**`, atau `endpoints` di
  `src/shared/lib/axios.ts` membawa `docs/api/` di PR yang sama (`yarn check:doc-sync`). Setiap
  perubahan kode aplikasi = entri di `CHANGELOG.md` bagian `## [Unreleased]` (`yarn check:changelog`).
- Custom hook dan util yang diubah punya unit test; alur auth, form, dan pembayaran punya integration
  test yang menguji interaksi user (Testing Library).
- Commit: subject `type(scope)?!?: deskripsi` (type `build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`)
  dan kode issue Space `[KODE-123]` di setiap commit; tanpa itu PR tidak dinilai.
- Deskripsi PR ditulis sebelum push pertama (mengedit deskripsi tidak memicu review ulang) dan hanya
  berisi fakta yang ada di diff.

## Delegasi sub-agent

Batas umum: sub-agent tidak commit, push, atau membuat PR; hasilnya diperiksa agent utama.

1. **Eksplorasi sebelum mengubah kode** — agent `Explore`
   - Pemicu: akan mengubah hook, util, komponen bersama, tipe, atau fungsi `api/` yang dipakai di luar file itu.
   - Input: path file + nama simbol yang akan diubah; scope `src/`, `docs/api/`.
   - Output: daftar `path:line` pemakai, test yang menutupinya, dan dokumen API terkait — satu baris per item, maks 30 baris.
   - Batas: read-only; maks 4 paralel (satu per file atau fitur).
2. **Rencana perubahan besar** — agent `Plan`
   - Pemicu: perubahan menyentuh lebih dari 3 file, lebih dari satu fitur, atau alur auth/token/permission.
   - Input: tujuan issue Space, hasil eksplorasi, file `.claude/rules/` yang berlaku.
   - Output: langkah bernomor; tiap langkah menyebut file, test yang ditambah, dan dokumen yang diupdate.
   - Batas: read-only; 1 agent.
3. **Verifikasi calon temuan** — agent `general-purpose`
   - Pemicu: ada temuan dari review, lint, atau agent lain yang belum terbukti.
   - Input: satu temuan (kategori, `path:line`, klaim); scope file itu dan pemakainya.
   - Output: `CONFIRMED` / `REJECTED` + bukti `path:line` + alasan maks 2 kalimat.
   - Batas: read-only (boleh menjalankan `yarn test` dan `yarn lint:changed`); maks 3 paralel.
4. **Review diff sebelum PR** — agent `general-purpose`
   - Pemicu: sebelum push pertama atau sebelum membuka PR.
   - Input: output `git diff <BASE>...HEAD`, bagian "Standar review Kinerja" di atas, dan rules yang berlaku untuk file di diff.
   - Output: daftar `[severity] kategori path:line — ringkasan` maks 15 butir, atau `bersih`.
   - Batas: read-only; 1 agent.
5. **Sinkron dokumen setelah API berubah** — agent `general-purpose`
   - Pemicu: `yarn check:doc-sync` atau `yarn check:changelog` gagal.
   - Input: diff `src/**/api/**` dan `src/shared/lib/axios.ts`; scope hanya `docs/api/` dan `CHANGELOG.md`.
   - Output: daftar file dokumen yang diubah + satu kalimat per file.
   - Batas: boleh edit hanya file di scope itu; 1 agent.
