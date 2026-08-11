# 🌴 Wisata Indonesia

Aplikasi web katalog destinasi wisata Indonesia yang dibangun dengan **NextJS (React)** di sisi frontend dan **Express + MongoDB** sebagai REST API di sisi backend.

Proyek ini dibuat untuk memenuhi Tugas Pengembangan Aplikasi Web dengan ReactJS atau NextJS.

## ✨ Fitur

- Menampilkan daftar destinasi wisata Indonesia
- Detail destinasi wisata
- Pencarian & filter destinasi
- REST API lengkap (CRUD) dengan dokumentasi Swagger
- Statistik dan metadata destinasi

## 🛠️ Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | NextJS 16 (App Router), React 19, CSS |
| Backend | Node.js, Express 4, Mongoose (MongoDB) |
| Dokumentasi API | Swagger UI (`/api-docs`) |
| Data | Dataset wisata Indonesia (`DATASETWISATA_FINAL.csv`) |

## 📁 Struktur Proyek

```
wisata-indonesia-new/
├── frontend/            # Aplikasi NextJS
│   ├── app/             # Halaman (App Router): layout.js, page.js
│   ├── components/      # Komponen React yang dapat digunakan ulang
│   └── lib/             # Utilitas & helper fetching API
├── backend/             # REST API Express + MongoDB
│   ├── server.js        # Entry point server
│   ├── src/             # Config, routes, models
│   └── scripts/         # Seeder data (seed.js) & perbaikan gambar
└── DATASETWISATA_FINAL.csv  # Dataset destinasi wisata
```

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js 18+
- MongoDB berjalan lokal (`mongodb://localhost:27017`) atau MongoDB Atlas

### 1. Jalankan Backend

```bash
cd backend
npm install
npm run seed     # isi database dari dataset (sekali saja)
npm run dev      # server berjalan di http://localhost:4000
```

- REST API: http://localhost:4000/api/destinasi
- Dokumentasi Swagger: http://localhost:4000/api-docs

### 2. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev      # aplikasi berjalan di http://localhost:3000
```

## 📡 Endpoint API

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/destinasi` | Daftar semua destinasi |
| GET | `/api/destinasi/:id` | Detail destinasi |
| POST | `/api/destinasi` | Tambah destinasi |
| PUT | `/api/destinasi/:id` | Update destinasi (penuh) |
| PATCH | `/api/destinasi/:id` | Update destinasi (sebagian) |
| DELETE | `/api/destinasi/:id` | Hapus destinasi |
| GET | `/api/stats` | Statistik destinasi |
| GET | `/api/meta` | Metadata (kategori, provinsi, dll.) |

## ⚙️ Konfigurasi Environment

Buat file `backend/.env`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/wisata_indonesia
CLIENT_ORIGIN=http://localhost:3000
```

## 👤 Author

**guprann** — [github.com/guprann](https://github.com/guprann)
