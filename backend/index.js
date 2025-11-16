import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import os from 'os';
import db from './config/Database.js';
import { Sequelize } from 'sequelize';
import SequelizeStore from 'connect-session-sequelize';
import ProductRoute from "./routes/ProductRoute.js"; 
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import BorrowingRoute from "./routes/BorrowingRoute.js";
// Import models to ensure they are registered
import User from './models/UserModel.js';
import Product from './models/ProductModel.js';
import Category from './models/CategoryModel.js';
import Borrowing from './models/BorrowingModel.js';

dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});

// Initialize database and sync models
(async () => {
    try {
        await db.authenticate();
        console.log("Database connection established.");

        // Check and add kategori column if it doesn't exist
        try {
            const [results] = await db.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'product' 
                AND COLUMN_NAME = 'kategori'
            `);

            if (results.length === 0) {
                console.log("Adding kategori column to product table...");
                await db.query(`
                    ALTER TABLE product 
                    ADD COLUMN kategori VARCHAR(255) NULL 
                    AFTER serialNumber
                `);
                console.log("✓ Kategori column added successfully.");
            } else {
                console.log("✓ Kategori column already exists.");
            }
        } catch (migrationError) {
            console.error("Error checking/adding kategori column:", migrationError.message);
            // Continue anyway - column might already exist or will be added manually
        }

        // Check and add image column if it doesn't exist
        try {
            const [imageResults] = await db.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'product' 
                AND COLUMN_NAME = 'image'
            `);

            if (imageResults.length === 0) {
                console.log("Adding image column to product table...");
                await db.query(`
                    ALTER TABLE product 
                    ADD COLUMN image TEXT NULL 
                    AFTER kategori
                `);
                console.log("✓ Image column added successfully.");
            } else {
                console.log("✓ Image column already exists.");
            }
        } catch (migrationError) {
            console.error("Error checking/adding image column:", migrationError.message);
            // Continue anyway - column might already exist or will be added manually
        }

        // Check and ensure borrowing table exists with all columns
        try {
            // Check if borrowing table exists
            const [tableResults] = await db.query(`
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'borrowing'
            `);

            if (tableResults.length === 0) {
                console.log("Borrowing table does not exist. It will be created by sync.");
            } else {
                // Check if borrowerName column exists
                const [borrowerNameResults] = await db.query(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'borrowing' 
                    AND COLUMN_NAME = 'borrowerName'
                `);

                // Check if borrowerId column exists (old column)
                const [borrowerIdResults] = await db.query(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'borrowing' 
                    AND COLUMN_NAME = 'borrowerId'
                `);

                if (borrowerNameResults.length === 0) {
                    if (borrowerIdResults.length > 0) {
                        console.log("Migrating borrowerId to borrowerName...");
                        // Migrate: rename column and change type
                        await db.query(`
                            ALTER TABLE borrowing 
                            CHANGE COLUMN borrowerId borrowerName VARCHAR(100) NOT NULL
                        `);
                        console.log("✓ Migrated borrowerId to borrowerName successfully.");
                    } else {
                        console.log("Adding borrowerName column to borrowing table...");
                        await db.query(`
                            ALTER TABLE borrowing 
                            ADD COLUMN borrowerName VARCHAR(100) NOT NULL 
                            AFTER productId
                        `);
                        console.log("✓ borrowerName column added successfully.");
                    }
                } else {
                    console.log("✓ borrowerName column already exists.");
                }

                // Check if actualReturnDate column exists
                const [actualReturnDateResults] = await db.query(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'borrowing' 
                    AND COLUMN_NAME = 'actualReturnDate'
                `);

                if (actualReturnDateResults.length === 0) {
                    console.log("Adding actualReturnDate column to borrowing table...");
                    await db.query(`
                        ALTER TABLE borrowing 
                        ADD COLUMN actualReturnDate DATETIME NULL 
                        AFTER expectedReturnDate
                    `);
                    console.log("✓ actualReturnDate column added successfully.");
                } else {
                    console.log("✓ actualReturnDate column already exists.");
                }
            }
        } catch (migrationError) {
            console.error("Error checking/updating borrowing table:", migrationError.message);
            // Continue anyway - table will be created/updated by sync
        }

        // Check and add createdBy column to borrowing table if it doesn't exist
        try {
            const [createdByResults] = await db.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'borrowing' 
                AND COLUMN_NAME = 'createdBy'
            `);

            if (createdByResults.length === 0) {
                console.log("Adding createdBy column to borrowing table...");
                await db.query(`
                    ALTER TABLE borrowing 
                    ADD COLUMN createdBy INT NULL 
                    COMMENT 'User ID yang membuat record (legacy, mungkin tidak digunakan)'
                    AFTER borrowedBy
                `);
                console.log("✓ createdBy column added successfully.");
            } else {
                console.log("✓ createdBy column already exists.");
            }
        } catch (migrationError) {
            console.error("Error checking/adding createdBy column:", migrationError.message);
            // Continue anyway
        }

        // Sync all models first to ensure tables exist
        await User.sync({ alter: false });
        await Product.sync({ alter: false });
        await Category.sync({ alter: false });
        // Use alter: false untuk Borrowing karena kita sudah handle kolom secara manual
        // Ini mencegah Sequelize mencoba membuat foreign key constraint yang bermasalah
        await Borrowing.sync({ alter: false });
        console.log("✓ All models synced.");
    } catch (error) {
        console.error("Database initialization error:", error);
    }
})();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// 1. Body parser - MUST be first
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 2. Get local IP address for network access
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIPAddress();

// 3. CORS configuration - MUST be before session
const allowedOrigins = [
    'http://localhost:3000',
    `http://${LOCAL_IP}:3000`,
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list or matches local network pattern
        if (allowedOrigins.includes(origin) || 
            origin.startsWith(`http://${LOCAL_IP}:`) ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            origin.startsWith('http://172.')) {
            callback(null, true);
        } else {
            // For development, allow all origins
            if (process.env.NODE_ENV !== 'production') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}));

// 4. Session configuration - MUST be after CORS
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false, // Changed to false for security
    store: store,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // Added for better security
    },
    name: 'inventory.sid' // Custom session name
}));

// 5. Routes - MUST be last
app.use(UserRoute);
app.use(ProductRoute);
app.use(AuthRoute);
app.use(CategoryRoute);
app.use(BorrowingRoute);

//store.sync();

const PORT = process.env.APP_PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
    console.log(`\n╔══════════════════════════════════════════════════════════╗`);
    console.log(`║  Server is running!                                       ║`);
    console.log(`╠══════════════════════════════════════════════════════════╣`);
    console.log(`║  Local:    http://localhost:${PORT.toString().padEnd(35)}║`);
    console.log(`║  Network:   http://${LOCAL_IP}:${PORT.toString().padEnd(28)}║`);
    console.log(`╠══════════════════════════════════════════════════════════╣`);
    console.log(`║  Frontend URL untuk device lain:                        ║`);
    console.log(`║  http://${LOCAL_IP}:3000${' '.repeat(26)}║`);
    console.log(`╚══════════════════════════════════════════════════════════╝\n`);
});