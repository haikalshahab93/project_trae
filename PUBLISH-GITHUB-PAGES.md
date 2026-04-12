# Publish ke GitHub Pages

Project ini memakai:

- frontend React + Vite di folder `frontend`
- backend Express di folder `backend`
- backend lokal dari PC bisa dibuka ke internet dengan Cloudflare Tunnel

## 1. Jalankan backend di PC

Dari folder `backend`:

```bash
npm install
npm run start:public
```

Backend lokal aktif di:

- `http://localhost:3001`
- `http://IP-PC-KAMU:3001`

## 2. Buka backend ke internet

Dari folder `backend`:

```bash
npm run tunnel:quick
```

Cloudflare Tunnel akan memberi URL seperti:

```text
https://nama-random.trycloudflare.com
```

Selama terminal tunnel tetap hidup, URL itu bisa dipakai oleh frontend GitHub Pages.

## 3. Simpan URL backend di GitHub

Di repo GitHub:

- buka `Settings`
- buka `Secrets and variables`
- buka `Actions`
- buka `Variables`
- tambah variable `VITE_API_BASE_URL`

Contoh:

```text
VITE_API_BASE_URL=https://nama-random.trycloudflare.com
```

## 4. Aktifkan GitHub Pages

Di repo GitHub:

- buka `Settings`
- buka `Pages`
- pilih deployment source `GitHub Actions`

Workflow deploy frontend sudah ada di `.github/workflows/deploy-pages.yml`.

## 5. Push project ke GitHub

Kalau remote belum dibuat:

```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Kalau remote sudah ada:

```bash
git push origin main
```

## 6. Redeploy saat URL tunnel berubah

Quick Tunnel biasanya tidak permanen. Kalau URL berubah:

- jalankan lagi `npm run tunnel:quick`
- salin URL baru
- update `VITE_API_BASE_URL` di GitHub Actions Variables
- push commit kecil ke `main` atau jalankan workflow manual

## Catatan penting

- backend di PC harus tetap menyala
- terminal backend dan terminal tunnel tidak boleh ditutup
- Quick Tunnel cocok untuk demo dan testing
- untuk pemakaian lebih stabil, gunakan named tunnel atau hosting backend terpisah

## Kalau mau pakai Named Tunnel

Named tunnel Cloudflare lebih stabil, tetapi ada syarat tambahan:

- kamu harus punya domain yang dikelola di Cloudflare
- kamu perlu membuat subdomain misalnya `api.domainkamu.com`

Template konfigurasi awal sudah disiapkan di `backend/cloudflared/config.example.yml`.

Setelah domain Cloudflare tersedia, alurnya:

```bash
cd backend
npm run tunnel:login
npm run tunnel:create
cloudflared tunnel route dns project-trae-backend api.domainkamu.com
npm run tunnel:run:named
```

Lalu ganti variable GitHub:

```text
VITE_API_BASE_URL=https://api.domainkamu.com
```
