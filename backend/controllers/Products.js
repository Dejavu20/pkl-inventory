import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import Borrowing from "../models/BorrowingModel.js";
import {Op} from "sequelize";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

// Get dashboard statistics
export const getDashboardStats = async(req, res) => {
    try {
        // Count total products
        const totalProducts = await Product.count();
        
        // Count total users
        const totalUsers = await User.count({
            where: {
                role: 'User'
            }
        });
        
        // Count total admins
        const totalAdmins = await User.count({
            where: {
                role: 'Admin'
            }
        });
        
        res.status(200).json({
            totalProducts,
            totalUsers,
            totalAdmins
        });
    } catch (error) {
        res.status(500).json({msg: error.message || "Gagal memuat statistik"});
    }
}

export const getProducts = async (req, res) =>{
    try {
        // Get filter parameters from query
        const { kategori, search, includeBorrowed } = req.query;
        
        // Build where clause
        const whereClause = {};
        if (kategori && kategori !== 'all' && kategori !== '') {
            whereClause.kategori = kategori;
        }
        if (search && search.trim() !== '') {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search.trim()}%` } },
                { merek: { [Op.like]: `%${search.trim()}%` } },
                { serialNumber: { [Op.like]: `%${search.trim()}%` } }
            ];
        }
        
        // Get all products
        const allProducts = await Product.findAll({
            attributes:['id','uuid','name','merek','serialNumber','kategori','image','status','createdAt','updatedAt'],
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            include:[{
                model: User,
                attributes:['name','email']
            }],
            order: [['createdAt', 'DESC']]
        });
        
        // Get active borrowings (dipinjam, terlambat)
        const activeBorrowings = await Borrowing.findAll({
            where: {
                status: {
                    [Op.in]: ['dipinjam', 'terlambat']
                }
            },
            attributes: ['productId']
        });
        
        // Get list of product IDs that are currently borrowed
        const borrowedProductIds = new Set(activeBorrowings.map(b => b.productId));
        
        // Sinkronisasi status produk berdasarkan borrowing aktif
        const productsToUpdateTersedia = [];
        const productsToUpdateDipinjam = [];
        
        for (const product of allProducts) {
            const hasActiveBorrowing = borrowedProductIds.has(product.id);
            
            // Normalisasi status: jika null/undefined/kosong, set ke 'tersedia'
            if (!product.status || product.status === null || product.status === undefined || product.status === '') {
                product.status = 'tersedia';
                productsToUpdateTersedia.push(product.id);
            }
            
            // Sinkronisasi: jika ada borrowing aktif tapi status produk bukan 'dipinjam', update
            if (hasActiveBorrowing && product.status !== 'dipinjam') {
                productsToUpdateDipinjam.push(product.id);
                product.status = 'dipinjam';
            } else if (!hasActiveBorrowing && product.status === 'dipinjam') {
                // Jika tidak ada borrowing aktif tapi status masih 'dipinjam', update ke 'tersedia'
                productsToUpdateTersedia.push(product.id);
                product.status = 'tersedia';
            }
        }
        
        // Bulk update status produk
        if (productsToUpdateTersedia.length > 0) {
            await Product.update(
                { status: 'tersedia' },
                { where: { id: { [Op.in]: productsToUpdateTersedia } } }
            );
        }
        if (productsToUpdateDipinjam.length > 0) {
            await Product.update(
                { status: 'dipinjam' },
                { where: { id: { [Op.in]: productsToUpdateDipinjam } } }
            );
        }
        
        // Filter out borrowed products unless includeBorrowed is true
        let response = allProducts;
        if (includeBorrowed !== 'true') {
            response = allProducts.filter(product => {
                const status = product.status;
                // Hanya tampilkan produk dengan status 'tersedia' atau null/undefined
                return status === 'tersedia' || !status || status === null || status === undefined || status === '';
            });
        }
        
        // Remove 'id' from response attributes (only needed for filtering)
        const finalResponse = response.map(product => {
            const { id, ...productData } = product.toJSON();
            // Pastikan status selalu ada
            if (!productData.status) {
                productData.status = 'tersedia';
            }
            return productData;
        });
        
        res.status(200).json(finalResponse);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getProductById = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        
        // All users can see all products now
        const response = await Product.findOne({
            attributes:['uuid','name','merek','serialNumber','kategori','image'],
            where:{
                id: product.id
            },
            include:[{
                model: User,
                attributes:['name','email']
            }]
        });
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

// Function to generate unique serial number
const generateSerialNumber = () => {
    // Format: PROD-YYYYMMDD-HHMMSS-XXXX (last 4 chars from UUID)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const uuidPart = uuidv4().replace(/-/g, '').substring(0, 4).toUpperCase();
    
    return `PROD-${year}${month}${day}-${hours}${minutes}${seconds}-${uuidPart}`;
};

export const createProduct = async(req, res) =>{
    // Mendapatkan name, merek, kategori, dan image dari request body (serialNumber auto-generated)
    const {name, merek, kategori, image} = req.body;
    
    // Validasi input
    if(!name || !merek) {
        return res.status(400).json({msg: "Nama dan Merek harus diisi"});
    }
    
    if(name.trim().length < 3) {
        return res.status(400).json({msg: "Nama produk minimal 3 karakter"});
    }
    
    if(name.trim().length > 100) {
        return res.status(400).json({msg: "Nama produk maksimal 100 karakter"});
    }
    
    try {
        // Generate serial number otomatis
        let serialNumber = generateSerialNumber();
        
        // Ensure uniqueness (retry if duplicate, though unlikely)
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
            const existing = await Product.findOne({
                where: { serialNumber: serialNumber }
            });
            if (!existing) {
                isUnique = true;
            } else {
                serialNumber = generateSerialNumber();
                attempts++;
            }
        }
        
        if (!isUnique) {
            return res.status(500).json({msg: "Gagal menghasilkan serial number unik"});
        }
        
        const product = await Product.create({
            name: name.trim(),
            merek: merek.trim(),
            kategori: kategori ? kategori.trim() : null,
            image: image || null,
            serialNumber: serialNumber, 
            userId: req.userId
        });
        
        res.status(201).json({
            msg: "Produk berhasil ditambahkan",
            product: {
                uuid: product.uuid,
                name: product.name,
                merek: product.merek,
                serialNumber: product.serialNumber
            }
        });
    } catch (error) {
        // Handle validation errors
        if(error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => {
                if(err.path === 'name' && err.validatorKey === 'len') {
                    return "Nama produk harus antara 3 hingga 100 karakter";
                }
                if(err.path === 'name' && err.validatorKey === 'notEmpty') {
                    return "Nama produk harus diisi";
                }
                if(err.path === 'merek' && err.validatorKey === 'notEmpty') {
                    return "Merek produk harus diisi";
                }
                if(err.path === 'serialNumber' && err.validatorKey === 'unique') {
                    return "Serial number sudah terdaftar";
                }
                return err.message;
            });
            return res.status(400).json({msg: messages.join(', ')});
        }
        // Handle other errors
        res.status(500).json({msg: error.message || "Gagal menambahkan produk"});
    }
}

export const updateProduct = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        
        const {name, merek, kategori, image} = req.body;
        
        // Validasi input
        if(!name || !merek) {
            return res.status(400).json({msg: "Nama dan Merek harus diisi"});
        }
        
        if(name.trim().length < 3) {
            return res.status(400).json({msg: "Nama produk minimal 3 karakter"});
        }
        
        if(name.trim().length > 100) {
            return res.status(400).json({msg: "Nama produk maksimal 100 karakter"});
        }
        
        // All users can update products (admin can update any, user can update their own)
        if(req.role && req.role.toLowerCase() !== "admin" && req.userId !== product.userId) {
            return res.status(403).json({msg: "Akses terlarang"});
        }
        
        await Product.update({
            name: name.trim(),
            merek: merek.trim(),
            kategori: kategori ? kategori.trim() : null,
            image: image !== undefined ? (image || null) : product.image
        },{
            where:{
                id: product.id
            }
        });
        res.status(200).json({msg: "Produk berhasil diupdate"});
    } catch (error) {
        // Handle validation errors
        if(error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => {
                if(err.path === 'name' && err.validatorKey === 'len') {
                    return "Nama produk harus antara 3 hingga 100 karakter";
                }
                if(err.path === 'name' && err.validatorKey === 'notEmpty') {
                    return "Nama produk harus diisi";
                }
                if(err.path === 'merek' && err.validatorKey === 'notEmpty') {
                    return "Merek produk harus diisi";
                }
                return err.message;
            });
            return res.status(400).json({msg: messages.join(', ')});
        }
        res.status(500).json({msg: error.message || "Gagal mengupdate produk"});
    }
}

export const deleteProduct = async(req, res) => {
    try {
        const productUuid = req.params.id;
        
        const product = await Product.findOne({
            where:{
                uuid: productUuid
            },
            attributes: ['id', 'userId']
        });

        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});

        let deletionCondition;

        if(req.role && req.role.toLowerCase() === "admin"){
            deletionCondition = { id: product.id };
        } else {
            if(req.userId !== product.userId) {
                return res.status(403).json({msg: "Akses terlarang"});
            }
            deletionCondition = { 
                [Op.and]: [{ id: product.id }, { userId: req.userId }] 
            };
        }
        
        await Product.destroy({
            where: deletionCondition
        });
        
        res.status(200).json({msg: "Product deleted successfully"});

    } catch (error) {
        res.status(500).json({msg: error.message || "Internal server error"});
    }
}

// Get QR Code for product
export const getProductQRCode = async(req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                uuid: req.params.id
            },
            attributes: ['id', 'uuid', 'name', 'merek', 'serialNumber', 'image', 'userId']
        });
        
        if(!product) {
            return res.status(404).json({msg: "Produk tidak ditemukan"});
        }
        
        // All users can view and download QR code for all products
        // Create QR code URL (public URL untuk melihat detail produk)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrDataUrl = `${frontendUrl}/products/detail/${product.uuid}`;
        
        // Generate QR code as data URL (PNG)
        const qrCodeDataUrl = await QRCode.toDataURL(qrDataUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 1
        });
        
        res.status(200).json({
            qrCode: qrCodeDataUrl,
            qrUrl: qrDataUrl,
            product: {
                uuid: product.uuid,
                name: product.name,
                merek: product.merek,
                serialNumber: product.serialNumber
            }
        });
    } catch (error) {
        res.status(500).json({msg: error.message || "Gagal generate QR code"});
    }
}

// Store for QR scan events (in-memory, bisa diganti dengan Redis untuk production)
const qrScanEvents = new Map();

// Get product detail (public, untuk QR code scan)
export const getProductDetail = async(req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                uuid: req.params.id
            },
            attributes: ['id', 'uuid', 'name', 'merek', 'serialNumber', 'image', 'kategori', 'status', 'createdAt', 'updatedAt'],
            include:[{
                model: User,
                attributes:['name','email']
            }]
        });
        
        if(!product) {
            return res.status(404).json({msg: "Produk tidak ditemukan"});
        }
        
        // Check if product is currently borrowed
        // Only query if product.id is valid
        let activeBorrowing = null;
        if (product.id) {
            activeBorrowing = await Borrowing.findOne({
                where: {
                    productId: product.id,
                    status: {
                        [Op.in]: ['dipinjam', 'terlambat']
                    }
                },
                attributes: ['uuid', 'namaPeminjam', 'borrowDate', 'expectedReturnDate', 'status'],
                order: [['borrowDate', 'DESC']]
            });
        }
        
        // Record QR scan event
        const scanEvent = {
            productUuid: product.uuid,
            productName: product.name,
            productMerek: product.merek,
            productSerialNumber: product.serialNumber,
            scannedAt: new Date().toISOString(),
            userAgent: req.headers['user-agent'] || 'Unknown',
            ip: req.ip || req.connection.remoteAddress
        };
        
        // Store scan event (keep last 100 events)
        const eventId = Date.now().toString();
        qrScanEvents.set(eventId, scanEvent);
        
        // Clean old events (keep only last 100)
        if (qrScanEvents.size > 100) {
            const firstKey = qrScanEvents.keys().next().value;
            qrScanEvents.delete(firstKey);
        }
        
        // Prepare response with additional info
        const productData = product.toJSON();
        productData.activeBorrowing = activeBorrowing ? activeBorrowing.toJSON() : null;
        
        res.status(200).json(productData);
    } catch (error) {
        res.status(500).json({msg: error.message || "Gagal memuat data produk"});
    }
}

// Get recent QR scan events
export const getQRScanEvents = async(req, res) => {
    try {
        // Get events from last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const recentEvents = Array.from(qrScanEvents.entries())
            .map(([id, event]) => ({ id, ...event }))
            .filter(event => event.scannedAt >= fiveMinutesAgo)
            .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));
        
        res.status(200).json(recentEvents);
    } catch (error) {
        res.status(500).json({msg: error.message || "Gagal memuat event scan"});
    }
}

// Get product history (siapa yang input barang)
export const getProductHistory = async(req, res) => {
    try {
        let response;
        if(req.role && req.role.toLowerCase() === "admin"){
            // Admin bisa lihat semua history
            response = await Product.findAll({
                attributes:['uuid','name','merek','serialNumber','kategori','image','createdAt','updatedAt'],
                include:[{
                    model: User,
                    attributes:['name','email','role']
                }],
                order: [['createdAt', 'DESC']],
                limit: 50 // Limit 50 terakhir
            });
        }else{
            // All users can see all history now
            response = await Product.findAll({
                attributes:['uuid','name','merek','serialNumber','kategori','image','createdAt','updatedAt'],
                include:[{
                    model: User,
                    attributes:['name','email','role']
                }],
                order: [['createdAt', 'DESC']],
                limit: 50
            });
        }
        
        // Format response untuk history
        const history = response.map(product => ({
            productName: product.name,
            merek: product.merek,
            kategori: product.kategori,
            serialNumber: product.serialNumber,
            createdBy: product.user.name,
            createdByEmail: product.user.email,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));
        
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({msg: error.message || "Gagal memuat history produk"});
    }
}

// Export products to CSV
export const exportProductsToCSV = async(req, res) => {
    try {
        // All users can export all products
        const products = await Product.findAll({
            attributes:['uuid','name','merek','serialNumber','kategori','image','createdAt','updatedAt'],
            include:[{
                model: User,
                attributes:['name','email']
            }],
            order: [['createdAt', 'DESC']]
        });
        
        // Helper function to escape CSV fields
        const escapeCSV = (field) => {
            if (field === null || field === undefined) return '""';
            const stringField = String(field);
            // Escape quotes and wrap in quotes if contains comma, newline, or quote
            if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };
        
        // Helper function to format date
        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };
        
        // Convert to CSV format
        const csvHeader = 'No,Nama Produk,Merek,Kategori,Serial Number,Dibuat Oleh,Email,Dibuat Pada,Diupdate Pada\n';
        const csvRows = products.map((product, index) => {
            const row = [
                index + 1,
                product.name,
                product.merek,
                product.kategori || '-',
                product.serialNumber,
                product.user ? product.user.name : '-',
                product.user ? product.user.email : '-',
                formatDate(product.createdAt),
                formatDate(product.updatedAt)
            ];
            return row.map(escapeCSV).join(',');
        }).join('\n');
        
        const csvContent = csvHeader + csvRows;
        const fileName = `products-${new Date().toISOString().split('T')[0]}.csv`;
        
        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Add BOM for UTF-8 to ensure proper Excel encoding
        const bom = '\ufeff';
        res.status(200).send(Buffer.from(bom + csvContent, 'utf-8'));
    } catch (error) {
        console.error('Error exporting CSV:', error);
        // If headers already sent, can't send JSON error
        if (!res.headersSent) {
            res.status(500).json({msg: error.message || "Gagal export produk ke CSV"});
        }
    }
}