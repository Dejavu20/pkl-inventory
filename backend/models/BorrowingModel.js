import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";
import Product from "./ProductModel.js";

const { DataTypes } = Sequelize;

const Borrowing = db.define('borrowing', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: 'ID produk yang dipinjam'
    },
    borrowerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID jika peminjam adalah user terdaftar (opsional)'
    },
    namaPeminjam: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 255]
        },
        comment: 'Nama peminjam (wajib diisi)'
    },
    borrowDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Tanggal peminjaman'
    },
    returnDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Tanggal pengembalian (null jika belum dikembalikan)'
    },
    expectedReturnDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Tanggal pengembalian yang diharapkan (opsional)'
    },
    status: {
        type: DataTypes.ENUM('dipinjam', 'dikembalikan', 'terlambat'),
        allowNull: false,
        defaultValue: 'dipinjam',
        comment: 'Status peminjaman'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Catatan tambahan'
    },
    borrowedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID yang memproses peminjaman (admin/staff)',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    },
    // Kolom createdBy mungkin ada di database tapi tidak digunakan di aplikasi
    // Tidak menggunakan references untuk menghindari constraint error saat sync
    // Kita handle di controller dengan fields option
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID yang membuat record (legacy, mungkin tidak digunakan)'
        // Tidak menggunakan references untuk menghindari constraint error
        // Foreign key akan dibuat manual jika diperlukan
    }
}, {
    freezeTableName: true,
    indexes: [
        {
            fields: ['productId']
        },
        {
            fields: ['status']
        },
        {
            fields: ['borrowDate']
        }
    ]
});

// Relationships
User.hasMany(Borrowing, { foreignKey: 'borrowerId', as: 'borrowings' });
Borrowing.belongsTo(User, { foreignKey: 'borrowerId', as: 'borrower' });

User.hasMany(Borrowing, { foreignKey: 'borrowedBy', as: 'processedBorrowings' });
Borrowing.belongsTo(User, { foreignKey: 'borrowedBy', as: 'processedBy' });

// Tidak membuat relationship untuk createdBy untuk menghindari constraint error
// Kolom createdBy hanya digunakan untuk menyimpan data, tidak ada foreign key constraint

Product.hasMany(Borrowing, { foreignKey: 'productId', as: 'borrowings' });
Borrowing.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export default Borrowing;
