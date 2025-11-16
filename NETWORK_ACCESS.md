# Panduan Akses dari Device Lain dalam Jaringan yang Sama

Dokumen ini menjelaskan cara mengakses aplikasi dari device lain dalam jaringan lokal yang sama.

## Prerequisites

1. Pastikan semua device terhubung ke jaringan WiFi/LAN yang sama
2. Pastikan firewall tidak memblokir port 3000 (frontend) dan 5000 (backend)

## Langkah-langkah

### 1. Cari IP Address Komputer Server

#### Windows:
```cmd
ipconfig
```
Cari "IPv4 Address" di bagian adapter yang aktif (biasanya WiFi atau Ethernet).

#### Mac/Linux:
```bash
ifconfig
# atau
ip addr
```
Cari IP address yang bukan 127.0.0.1 (biasanya dimulai dengan 192.168.x.x atau 10.x.x.x)

### 2. Jalankan Backend

```bash
cd backend
npm start
```

Backend akan otomatis:
- Listen di `0.0.0.0` (semua network interface)
- Menampilkan IP address lokal di console
- Menerima request dari IP lokal

### 3. Konfigurasi Frontend

#### Opsi 1: Menggunakan .env file (Recommended)
Buat file `.env` di folder `frontend/` (copy dari `.env.example`):
```
HOST=0.0.0.0
REACT_APP_API_URL=http://[IP_ADDRESS_SERVER]:5000
```

**Contoh:** Jika IP server adalah `192.168.1.100`:
```
HOST=0.0.0.0
REACT_APP_API_URL=http://192.168.1.100:5000
```

Kemudian jalankan:
```bash
cd frontend
npm start
```

#### Opsi 2: Menggunakan environment variable saat start
```bash
cd frontend
# Windows (PowerShell)
$env:HOST="0.0.0.0"; $env:REACT_APP_API_URL="http://[IP_ADDRESS_SERVER]:5000"; npm start

# Windows (CMD)
set HOST=0.0.0.0 && set REACT_APP_API_URL=http://[IP_ADDRESS_SERVER]:5000 && npm start

# Mac/Linux
HOST=0.0.0.0 REACT_APP_API_URL=http://[IP_ADDRESS_SERVER]:5000 npm start
```

**Catatan:** Ganti `[IP_ADDRESS_SERVER]` dengan IP address komputer yang menjalankan backend (lihat di console backend).

### 4. Akses dari Device Lain

Setelah backend dan frontend berjalan, akses aplikasi dari device lain menggunakan:

```
http://[IP_ADDRESS_SERVER]:3000
```

Contoh:
- Jika IP server adalah `192.168.1.100`
- Akses dari device lain: `http://192.168.1.100:3000`

### 5. Konfigurasi API URL (Opsional)

Jika frontend tidak bisa connect ke backend, buat file `.env` di folder `frontend/`:

```
REACT_APP_API_URL=http://[IP_ADDRESS_SERVER]:5000
```

Contoh:
```
REACT_APP_API_URL=http://192.168.1.100:5000
```

**Catatan:** Ganti `[IP_ADDRESS_SERVER]` dengan IP address komputer yang menjalankan server.

## Troubleshooting

### Frontend tidak bisa connect ke backend

1. Pastikan backend sudah berjalan dan menampilkan IP address di console
2. Pastikan IP address yang digunakan benar
3. Cek firewall Windows/Mac/Linux - pastikan port 3000 dan 5000 tidak diblokir
4. Coba akses `http://[IP_ADDRESS]:5000` dari browser device lain untuk test koneksi backend

### CORS Error

Backend sudah dikonfigurasi untuk menerima request dari IP lokal. Jika masih ada error:
1. Pastikan menggunakan IP address yang sama seperti yang ditampilkan di console backend
2. Restart backend setelah perubahan

### Port sudah digunakan

Jika port 3000 atau 5000 sudah digunakan:
1. Backend: Set `APP_PORT` di `.env` file backend
2. Frontend: Set `PORT=3001` di `.env` file frontend (atau port lain)

## Keamanan

⚠️ **Peringatan:** Konfigurasi ini hanya untuk development/testing dalam jaringan lokal. 
Untuk production, gunakan:
- HTTPS
- Authentication yang lebih ketat
- Firewall rules yang tepat
- Environment variables yang aman

