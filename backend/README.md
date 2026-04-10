# Backend Lokal

Jalankan backend dari folder `backend`:

```bash
npm install
npm run start:public
```

Backend akan terbuka di:

- `http://localhost:3001`
- `http://IP-PC-KAMU:3001`

Cek kesehatan server:

```bash
http://localhost:3001/api/health
```

Kalau frontend di GitHub Pages ingin memakai backend dari PC ini, isi variable GitHub Actions:

```text
VITE_API_BASE_URL=http://IP-PC-KAMU:3001
```

Kalau ingin diakses dari internet publik, kamu masih perlu salah satu:

- port forwarding di router
- DDNS
- tunnel seperti Cloudflare Tunnel atau ngrok

Cara paling mudah untuk membuat backend ini publik dari PC:

```bash
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3001
```

Cloudflare akan memberi URL seperti:

```text
https://nama-random.trycloudflare.com
```

Untuk GitHub Pages, isi variable Actions:

```text
VITE_API_BASE_URL=https://nama-random.trycloudflare.com
```

Quick Tunnel cocok untuk demo dan testing. Kalau ingin stabil untuk pemakaian lama, gunakan named tunnel, port forwarding, atau hosting backend terpisah.
