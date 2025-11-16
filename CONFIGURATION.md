# Panduan Konfigurasi

Dokumen ini menjelaskan langkah-langkah konfigurasi untuk menjalankan aplikasi Inventory Management System.

## Backend Configuration

### 1. Setup Database

1. Pastikan MySQL server sudah terinstall dan berjalan
2. Buat database baru:
```sql
CREATE DATABASE auth_db;
```

### 2. Setup Environment Variables

1. Buat file `.env` di folder `backend/`
2. Copy isi dari `.env.example` (jika ada) atau gunakan template berikut:

```env
# Database Configuration
DB_NAME=auth_db
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost

# Server Configuration
APP_PORT=5000
NODE_ENV=development

# Session Secret (generate random string)
SESSION_SECRET=your-secret-key-here-change-in-production
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Run Backend Server

```bash
# Development mode
npm start

# atau dengan watch mode
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## Frontend Configuration

### 1. Setup Environment Variables (Optional)

1. Buat file `.env` di folder `frontend/` (opsional):
```env
REACT_APP_API_URL=http://localhost:5000
```

Jika tidak dibuat, aplikasi akan menggunakan default: `http://localhost:5000`

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Run Frontend Application

```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## Konfigurasi CORS

Backend sudah dikonfigurasi untuk menerima request dari `http://localhost:3000`. Jika ingin mengubah port frontend, edit file `backend/index.js`:

```javascript
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000' // Ubah port jika perlu
}));
```

## Konfigurasi Session

Session dikonfigurasi menggunakan Express Session dengan Sequelize Store. Pastikan:

1. `SESSION_SECRET` di `.env` backend sudah diisi dengan string acak yang aman
2. Database sudah dibuat sebelum menjalankan server
3. Tabel session akan dibuat otomatis oleh Sequelize

## Troubleshooting

### Backend tidak bisa connect ke database

1. Pastikan MySQL server berjalan
2. Periksa kredensial database di `.env`
3. Pastikan database sudah dibuat
4. Periksa apakah MySQL user memiliki akses ke database

### Frontend tidak bisa connect ke backend

1. Pastikan backend server berjalan
2. Periksa CORS configuration di backend
3. Periksa API URL di `frontend/src/config/api.js`
4. Pastikan tidak ada firewall yang memblokir koneksi

### Session tidak tersimpan

1. Pastikan cookies diaktifkan di browser
2. Periksa `SESSION_SECRET` di backend `.env`
3. Periksa CORS credentials configuration
4. Pastikan database session table sudah dibuat

### Error saat install dependencies

1. Pastikan Node.js version >= 14
2. Hapus `node_modules` dan `package-lock.json`
3. Jalankan `npm install` lagi
4. Jika masih error, coba `npm cache clean --force`

## Production Configuration

### Backend

1. Ubah `NODE_ENV=production` di `.env`
2. Gunakan `SESSION_SECRET` yang kuat dan acak
3. Konfigurasi database production
4. Setup reverse proxy (nginx/apache) jika perlu
5. Setup SSL certificate untuk HTTPS

### Frontend

1. Build aplikasi: `npm run build`
2. Serve folder `build/` menggunakan web server
3. Konfigurasi environment variables untuk production API URL
4. Setup SSL certificate untuk HTTPS

## Security Checklist

- [ ] `SESSION_SECRET` menggunakan string acak yang kuat
- [ ] Database password tidak kosong di production
- [ ] CORS hanya mengizinkan domain yang diizinkan
- [ ] HTTPS diaktifkan di production
- [ ] Environment variables tidak di-commit ke git
- [ ] Database backup dilakukan secara berkala
- [ ] Password user di-hash menggunakan Argon2
- [ ] Input validation dilakukan di backend dan frontend
- [ ] Role-based access control diimplementasikan

## Notes

- Pastikan untuk tidak commit file `.env` ke git
- Gunakan `.env.example` sebagai template
- Database akan di-sync otomatis saat server pertama kali dijalankan
- Session table akan dibuat otomatis oleh Sequelize Store











