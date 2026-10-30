# Dokumen API (sisi FE)

Dokumen di folder ini mencatat endpoint backend yang dipanggil FE: method dan path, fungsi di
`api/index.ts` yang memanggilnya, bentuk request dan `data` di envelope, serta perilaku auth.
Kontrak lengkap tetap milik backend; dokumen ini yang diperbarui setiap kali cara FE memanggil
backend berubah.

`yarn check:doc-sync` (juga di CI) gagal bila:

- `src/module/<domain>/features/<feature>/api/**` berubah tanpa `docs/api/<feature>.md`;
- `src/**/services/**`, `src/shared/api/**`, atau `src/shared/lib/axios.ts` (`endpoints`) berubah
  tanpa perubahan apa pun di `docs/api/`;
- dokumen di folder ini (selain README) berubah tanpa baris `**Last Updated:**` baru.

Format tiap dokumen: `.claude/rules/api-docs.md`. Envelope semua response:
`{ data, message, meta, errors }`; `errors`/`message` dipakai sebagai pesan `Error` oleh interceptor
`src/shared/lib/axios.ts`.

## Dokumen

| Fitur | Dokumen              | Endpoint |
| ----- | -------------------- | -------- |
| auth  | [auth.md](auth.md)   | 4        |
| usage | [usage.md](usage.md) | 13       |
