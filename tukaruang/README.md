# TukarUang

Aplikasi web remitansi dan pertukaran uang berbasis:

- Frontend: React + Vite
- Backend: Express.js
- Database: MongoDB
- Kurs live: provider API key eksternal + fallback demo

## Fitur

- Register dan login berbasis JWT
- Dashboard ringkas volume transaksi dan estimasi profit
- Kalkulator kurs live berbasis API internasional
- Simulasi publik fokus pada kalkulasi live tanpa menyimpan harga harian ke sistem
- Fee per pasangan mata uang dapat dikonfigurasi di database
- KYC formal: biodata, identitas, alamat, pekerjaan, kontak darurat
- Verifikasi wajah awal: selfie capture via kamera atau upload manual
- Upload KTP/paspor dan dokumen pendukung
- Pembuatan transfer dengan payout bank, cash pickup, atau mobile wallet
- Riwayat transfer user
- Panel admin/compliance untuk review KYC dan update status transfer

## Menjalankan

1. Pastikan MongoDB aktif secara lokal.
2. Salin `backend/.env.example` menjadi `backend/.env` lalu isi `EXCHANGE_RATE_API_KEY` jika ingin provider live utama.
3. Salin `frontend/.env.example` menjadi `frontend/.env` bila ingin override API URL.
4. Jalankan:

```bash
npm run dev
```

## Admin Default

- Email: `admin@tukaruang.local`
- Password: `Admin12345!`
- Nilai ini bisa diubah lewat `DEFAULT_ADMIN_NAME`, `DEFAULT_ADMIN_EMAIL`, dan `DEFAULT_ADMIN_PASSWORD` di `backend/.env`.

## Endpoint Utama

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/rates/currencies`
- `GET /api/rates/latest`
- `POST /api/kyc/submit`
- `GET /api/kyc/status`
- `POST /api/transfers`
- `GET /api/transfers`
- `GET /api/dashboard/summary`
- `GET /api/admin/summary`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/kyc`
- `GET /api/admin/transfers`
- `PATCH /api/admin/transfers/:transferId/status`

## Catatan

- API key live exchange rate dari provider pihak ketiga tidak bisa dibuat otomatis dari kode. Struktur aplikasi ini sudah menyiapkan tempat untuk API key tersebut.
- Sistem tidak menyimpan harga kurs harian sebagai data terpisah. Kurs diambil live saat simulasi dan saat transaksi transfer dibuat.
- `INTERNAL_SERVICE_API_KEY` dan `JWT_SECRET` contoh sudah disiapkan untuk kebutuhan development lokal.
- Untuk produksi, sebaiknya tambahkan verifikasi biometrik dari vendor KYC khusus agar matching wajah benar-benar tervalidasi.

## Standar Frontend

- Frontend TukarUang memakai design token dan utility atomic untuk tipografi serta warna.
- Dokumentasi penggunaan token dan utility class ada di `frontend/README.md`.
