# Inventory Management System

Sistem manajemen inventory dengan React frontend dan Express backend, dilengkapi dengan manajemen user dan autentikasi.

## Fitur

- ✅ Autentikasi user dengan session
- ✅ Manajemen produk (CRUD)
- ✅ Manajemen user (CRUD) - Hanya untuk Admin
- ✅ Role-based access control (Admin/User)
- ✅ UI yang responsif menggunakan Bulma CSS
- ✅ Validasi form yang lengkap
- ✅ Konfirmasi sebelum menghapus data

## Teknologi

### Backend
- Node.js
- Express.js
- Sequelize (ORM)
- MySQL
- Argon2 (password hashing)
- Express Session
- CORS

### Frontend
- React 19
- Redux Toolkit
- React Router
- Axios
- Bulma CSS
- Font Awesome

## Instalasi

### Prerequisites
- Node.js (v14 atau lebih baru)
- MySQL
- npm atau yarn

### Backend Setup

1. Masuk ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` di folder backend (copy dari `.env.example`):
```env
DB_NAME=auth_db
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
APP_PORT=5000
NODE_ENV=development
SESSION_SECRET=your-secret-key-here-change-in-production
```

4. Buat database MySQL:
```sql
CREATE DATABASE auth_db;
```

5. Jalankan server:
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

### Frontend Setup

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Opsional) Buat file `.env` di folder frontend jika ingin mengubah API URL:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Jalankan aplikasi:
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## Penggunaan

### Login
1. Buka aplikasi di browser
2. Login dengan email dan password
3. Setelah login, Anda akan diarahkan ke dashboard

### Admin Features
- **Manajemen User**: Admin dapat melihat, menambah, mengedit, dan menghapus user
- **Manajemen Produk**: Admin dapat mengelola produk
- **Dashboard**: Melihat ringkasan sistem

### User Features
- **Manajemen Produk**: User dapat melihat dan mengelola produk
- **Dashboard**: Melihat ringkasan

## Struktur Project

```
inventory-react/
├── backend/
│   ├── config/
│   │   └── Database.js
│   ├── controllers/
│   │   ├── Auth.js
│   │   ├── Products.js
│   │   └── Users.js
│   ├── middleware/
│   │   └── AuthUser.js
│   ├── models/
│   │   ├── ProductModel.js
│   │   └── UserModel.js
│   ├── routes/
│   │   ├── AuthRoute.js
│   │   ├── ProductRoute.js
│   │   └── UserRoute.js
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── config/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /login` - Login user
- `GET /me` - Get current user
- `DELETE /logout` - Logout user

### Users (Admin Only)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

## Security

- Password di-hash menggunakan Argon2
- Session-based authentication
- Role-based access control
- CORS diaktifkan untuk frontend
- Validasi input di backend dan frontend

## Catatan Penting

1. Pastikan MySQL server berjalan sebelum menjalankan backend
2. Pastikan database sudah dibuat sebelum menjalankan aplikasi
3. Session secret harus diubah di production
4. Database password harus dikonfigurasi dengan benar
5. API URL dapat dikonfigurasi melalui environment variable

## Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan MySQL server berjalan
- Periksa konfigurasi database di file `.env`
- Pastikan database sudah dibuat

### Frontend tidak bisa connect ke backend
- Pastikan backend server berjalan
- Periksa CORS configuration di backend
- Periksa API URL di frontend config

### Session tidak tersimpan
- Pastikan cookies diaktifkan di browser
- Periksa session secret di backend
- Periksa CORS credentials configuration

## License

ISC

## Author

Inventory Management System
