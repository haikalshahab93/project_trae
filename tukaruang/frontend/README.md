# TukarUang Frontend

Frontend TukarUang dibangun dengan `React` dan `Vite`. Aplikasi ini melayani alur publik, autentikasi, dashboard pengguna, compliance/KYC, transfer, riwayat transaksi, dan panel admin.

## Menjalankan Frontend

1. Pastikan backend sudah berjalan.
2. Salin `.env.example` menjadi `.env` jika ingin mengubah base URL API.
3. Jalankan:

```bash
npm install
npm run dev
```

## Struktur Utama

- `src/App.jsx`: komposisi halaman dan routing utama
- `src/App.css`: layout utama, komponen visual, dan utility atomic
- `src/index.css`: design token global seperti font, size, line-height, tracking, dan warna
- `src/components`: komponen UI utama
- `src/services/api.js`: integrasi HTTP ke backend
- `src/utils`: formatter dan helper status

## Atomic UI Standard

Frontend ini memakai pendekatan atomic ringan untuk menjaga konsistensi tipografi dan warna. Aturan dasarnya:

- token global didefinisikan di `src/index.css`
- utility class didefinisikan di `src/App.css`
- komponen sebaiknya memakai utility class langsung di JSX untuk heading, subtitle, caption, dan tone teks
- selector kontekstual hanya dipakai bila memang perlu menjaga backward compatibility atau layout lama

## Design Tokens

Token global utama berada di `:root` dalam `src/index.css`.

### Typography Tokens

- `--font-family-base`
- `--font-weight-regular`
- `--font-weight-medium`
- `--font-weight-semibold`
- `--font-weight-bold`
- `--font-weight-extrabold`
- `--font-size-display`
- `--font-size-heading-1`
- `--font-size-heading-2`
- `--font-size-heading-3`
- `--font-size-title`
- `--font-size-body-lg`
- `--font-size-body-md`
- `--font-size-body-sm`
- `--font-size-caption`
- `--line-height-display`
- `--line-height-heading`
- `--line-height-title`
- `--line-height-body`
- `--line-height-relaxed`
- `--tracking-display`
- `--tracking-heading`
- `--tracking-title`
- `--tracking-kicker`
- `--tracking-caption`

### Color Tokens

- `--color-text-primary`
- `--color-text-secondary`
- `--color-text-muted`
- `--color-text-soft`
- `--color-text-inverse`
- `--color-text-inverse-secondary`
- `--color-brand-700`
- `--color-brand-600`
- `--color-brand-500`
- `--color-brand-300`
- `--color-surface-primary`
- `--color-surface-secondary`
- `--color-border-soft`

## Utility Classes

Utility class utama yang dipakai langsung di komponen:

### Typography

- `.type-display`
- `.type-heading-1`
- `.type-heading-2`
- `.type-heading-3`
- `.type-title`
- `.type-body-lg`
- `.type-body`
- `.type-body-sm`
- `.type-caption`

### Tone

- `.tone-primary`
- `.tone-secondary`
- `.tone-muted`
- `.tone-brand`
- `.tone-inverse`
- `.tone-inverse-secondary`

## Aturan Pakai

Gunakan pedoman berikut saat menambah atau merapikan UI:

- heading halaman utama: pakai `.type-heading-1`
- heading section/card besar: pakai `.type-heading-2`
- title item/card kecil: pakai `.type-heading-3` atau `.type-title`
- paragraf utama: pakai `.type-body` atau `.type-body-lg`
- label kecil, kicker, caption tabel: pakai `.type-caption`
- teks terang di area gelap: kombinasikan typography class dengan `.tone-inverse` atau `.tone-inverse-secondary`
- teks standar di surface terang: kombinasikan dengan `.tone-primary`, `.tone-secondary`, atau `.tone-muted`

## Contoh

```jsx
<p className="section-kicker type-caption tone-brand">Area Pengguna</p>
<h2 className="type-heading-2 tone-primary">Status akun dan kesiapan transfer</h2>
<p className="subtitle type-body tone-secondary">
  Ringkasan ini membantu pengguna melihat progres akun dengan lebih jelas.
</p>
```

## Komponen Yang Sudah Mengikuti Atomic Utility

Beberapa komponen utama yang sudah memakai utility class langsung:

- `DashboardHero.jsx`
- `PublicMarketingSections.jsx`
- `QuoteStatusSection.jsx`
- `WorkspaceShell.jsx`
- `DashboardOverview.jsx`
- `UserStatusSection.jsx`
- `CustomerWorkflowSection.jsx`
- `TransfersTable.jsx`
- `CustomerAccessSection.jsx`
- `AdminPanel.jsx`

## Saat Menambah Komponen Baru

- mulai dari token di `index.css`, bukan angka hardcoded
- pakai utility typography/tone lebih dulu sebelum membuat selector baru
- jika perlu selector baru, arahkan tetap ke `var(...)`
- hindari warna teks baru tanpa alasan visual yang jelas
- jaga konsistensi antara area terang dan area gelap

## Validasi

Sebelum merge atau push, jalankan:

```bash
npm run lint
npm run build
```
