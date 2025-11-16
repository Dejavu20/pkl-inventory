# Migration: Add Kategori Column

## Problem
Error: `Unknown column 'product.kategori' in 'field list'`

## Solution

### Option 1: Auto-Migration (Recommended)
Kolom `kategori` akan otomatis ditambahkan saat server backend di-restart. 
Server akan mengecek apakah kolom sudah ada, dan jika belum, akan menambahkannya secara otomatis.

**Cara:**
1. Stop server backend (jika sedang berjalan)
2. Start server backend:
   ```bash
   cd backend
   npm start
   # atau
   npm run dev
   ```
3. Server akan otomatis menambahkan kolom `kategori` jika belum ada

### Option 2: Manual Migration Script
Jalankan script migration secara manual:

```bash
cd backend
npm run migrate:kategori
```

### Option 3: SQL Manual
Jika kedua opsi di atas tidak berhasil, jalankan SQL script secara manual:

1. Buka MySQL client (phpMyAdmin, MySQL Workbench, atau command line)
2. Pilih database yang digunakan
3. Jalankan script: `backend/scripts/addKategoriColumn.sql`

Atau jalankan query ini langsung:

```sql
ALTER TABLE product 
ADD COLUMN kategori VARCHAR(255) NULL 
AFTER serialNumber;
```

## Verification

Setelah migration, verifikasi dengan query:

```sql
DESCRIBE product;
```

Atau:

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'product' 
AND COLUMN_NAME = 'kategori';
```

Kolom `kategori` seharusnya muncul dengan:
- **Type**: VARCHAR(255)
- **Null**: YES
- **Position**: Setelah kolom `serialNumber`








