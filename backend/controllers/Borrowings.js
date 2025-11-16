import Borrowing from "../models/BorrowingModel.js";
import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

// ============================================
// HELPER: Update status terlambat otomatis
// ============================================
const updateOverdueStatus = async () => {
    try {
        const now = new Date();
        // Update status menjadi 'terlambat' untuk peminjaman yang melewati expectedReturnDate
        await Borrowing.update(
            { status: 'terlambat' },
            {
                where: {
                    status: 'dipinjam',
                    expectedReturnDate: {
                        [Op.lt]: now
                    }
                }
            }
        );
    } catch (error) {
        // Silent fail untuk auto-update
    }
};

// ============================================
// GET ALL BORROWINGS
// ============================================
export const getBorrowings = async (req, res) => {
    try {
        const { status, search, startDate, endDate } = req.query;
        
        // Update status terlambat sebelum mengambil data
        await updateOverdueStatus();
        
        // Build where clause
        const whereClause = {};
        if (status && status !== 'all' && status !== '') {
            whereClause.status = status;
        }
        
        // Filter by date range (borrowDate)
        if (startDate || endDate) {
            whereClause.borrowDate = {};
            if (startDate) {
                whereClause.borrowDate[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                // Set end date to end of day (23:59:59)
                const endDateObj = new Date(endDate);
                endDateObj.setHours(23, 59, 59, 999);
                whereClause.borrowDate[Op.lte] = endDateObj;
            }
        }
        
        // Get all borrowings with relations
        // Pastikan UUID selalu di-include
        let borrowings = await Borrowing.findAll({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            attributes: [
                'id', // Include ID untuk debugging
                'uuid', 
                'productId', 
                'borrowerId', 
                'namaPeminjam', 
                'borrowDate', 
                'returnDate', 
                'expectedReturnDate', 
                'status', 
                'notes', 
                'borrowedBy', 
                'createdAt', 
                'updatedAt'
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['uuid', 'name', 'merek', 'serialNumber', 'kategori', 'image', 'status']
                },
                {
                    model: User,
                    as: 'borrower',
                    attributes: ['name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'processedBy',
                    attributes: ['name', 'email'],
                    required: false
                }
            ],
            order: [['borrowDate', 'DESC']]
        });
        
        // Update status di memory untuk yang belum diupdate di database
        borrowings.forEach(borrowing => {
            if (borrowing.status === 'dipinjam' && borrowing.expectedReturnDate) {
                const expectedDate = new Date(borrowing.expectedReturnDate);
                if (expectedDate < new Date()) {
                    borrowing.status = 'terlambat';
                }
            }
        });
        
        // Convert Sequelize instances to plain objects
        // Pastikan UUID selalu ada - query dari database jika tidak ada
        const plainBorrowings = await Promise.all(borrowings.map(async (borrowing, index) => {
            // Convert to plain object
            let plainBorrowing;
            
            if (borrowing && typeof borrowing.get === 'function') {
                // Sequelize instance - convert to plain object
                plainBorrowing = borrowing.get({ plain: true });
            } else if (borrowing && borrowing.dataValues) {
                // Sequelize instance dengan dataValues
                plainBorrowing = { ...borrowing.dataValues };
            } else if (borrowing && typeof borrowing === 'object') {
                // Sudah plain object
                plainBorrowing = { ...borrowing };
            } else {
                console.error(`[GET_BORROWINGS] Invalid borrowing object at index ${index}:`, borrowing);
                return null;
            }
            
            // Pastikan UUID selalu ada - query dari database jika tidak ada
            if (!plainBorrowing.uuid && plainBorrowing.id) {
                try {
                    const borrowingWithUuid = await Borrowing.findOne({
                        where: { id: plainBorrowing.id },
                        attributes: ['uuid'],
                        raw: true
                    });
                    
                    if (borrowingWithUuid && borrowingWithUuid.uuid) {
                        plainBorrowing.uuid = borrowingWithUuid.uuid;
                        console.log(`[GET_BORROWINGS] Retrieved UUID for borrowing ID ${plainBorrowing.id}: ${plainBorrowing.uuid}`);
                    } else {
                        console.warn(`[GET_BORROWINGS] UUID not found in database for borrowing ID ${plainBorrowing.id}`);
                    }
                } catch (uuidError) {
                    console.error(`[GET_BORROWINGS] Error querying UUID for borrowing ID ${plainBorrowing.id}:`, uuidError);
                }
            }
            
            // Log jika UUID masih tidak ada (untuk debugging)
            if (!plainBorrowing.uuid) {
                console.warn(`[GET_BORROWINGS] Borrowing at index ${index} still missing UUID after query:`, {
                    id: plainBorrowing.id,
                    productId: plainBorrowing.productId,
                    namaPeminjam: plainBorrowing.namaPeminjam
                });
            }
            
            return plainBorrowing;
        }));
        
        // Filter null values
        const filteredBorrowings = plainBorrowings.filter(borrowing => borrowing !== null);
        
        console.log(`[GET_BORROWINGS] Returning ${filteredBorrowings.length} borrowings (from ${borrowings.length} total)`);
        
        res.status(200).json(filteredBorrowings);
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || "Gagal memuat data peminjaman" 
        });
    }
};

// ============================================
// EXPORT BORROWINGS TO CSV
// ============================================
export const exportBorrowingsToCSV = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        
        // Update status terlambat sebelum mengambil data
        await updateOverdueStatus();
        
        // Build where clause (same as getBorrowings)
        const whereClause = {};
        if (status && status !== 'all' && status !== '') {
            whereClause.status = status;
        }
        
        // Filter by date range (borrowDate)
        if (startDate || endDate) {
            whereClause.borrowDate = {};
            if (startDate) {
                whereClause.borrowDate[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                const endDateObj = new Date(endDate);
                endDateObj.setHours(23, 59, 59, 999);
                whereClause.borrowDate[Op.lte] = endDateObj;
            }
        }
        
        // Get all borrowings with relations
        const borrowings = await Borrowing.findAll({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            attributes: [
                'uuid',
                'namaPeminjam',
                'borrowDate',
                'returnDate',
                'expectedReturnDate',
                'status',
                'notes',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'merek', 'serialNumber', 'kategori'],
                    required: false
                },
                {
                    model: User,
                    as: 'borrower',
                    attributes: ['name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'processedBy',
                    attributes: ['name', 'email'],
                    required: false
                }
            ],
            order: [['borrowDate', 'DESC']]
        });
        
        // Helper function to escape CSV fields
        const escapeCSV = (field) => {
            if (field === null || field === undefined) return '';
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
        
        // Convert Sequelize instances to plain objects
        const plainBorrowings = borrowings.map(borrowing => {
            if (borrowing && typeof borrowing.get === 'function') {
                return borrowing.get({ plain: true });
            } else if (borrowing && borrowing.dataValues) {
                return { ...borrowing.dataValues };
            }
            return borrowing;
        });
        
        // Convert to CSV format
        const csvHeader = 'No,Nama Produk,Merek,Serial Number,Kategori,Nama Peminjam,Tanggal Pinjam,Tanggal Kembali (Diharapkan),Tanggal Kembali (Aktual),Status,Catatan,Dibuat Pada,Diupdate Pada\n';
        const csvRows = plainBorrowings.map((borrowing, index) => {
            const row = [
                index + 1,
                borrowing.product ? borrowing.product.name : '-',
                borrowing.product ? borrowing.product.merek : '-',
                borrowing.product ? borrowing.product.serialNumber : '-',
                borrowing.product ? (borrowing.product.kategori || '-') : '-',
                borrowing.namaPeminjam || '-',
                formatDate(borrowing.borrowDate),
                formatDate(borrowing.expectedReturnDate),
                formatDate(borrowing.returnDate),
                borrowing.status || '-',
                borrowing.notes || '-',
                formatDate(borrowing.createdAt),
                formatDate(borrowing.updatedAt)
            ];
            return row.map(escapeCSV).join(',');
        }).join('\n');
        
        const csvContent = csvHeader + csvRows;
        const dateRange = startDate && endDate 
            ? `${startDate}_${endDate}` 
            : new Date().toISOString().split('T')[0];
        const fileName = `borrowings-${dateRange}.csv`;
        
        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Add BOM for UTF-8 to ensure proper Excel encoding
        const bom = '\ufeff';
        res.status(200).send(Buffer.from(bom + csvContent, 'utf-8'));
    } catch (error) {
        console.error('Error exporting borrowings CSV:', error);
        // If headers already sent, can't send JSON error
        if (!res.headersSent) {
            res.status(500).json({msg: error.message || "Gagal export peminjaman ke CSV"});
        }
    }
};

// ============================================
// GET BORROWING BY ID
// ============================================
export const getBorrowingById = async (req, res) => {
    try {
        const borrowing = await Borrowing.findOne({
            where: {
                uuid: req.params.id
            },
            attributes: [
                'uuid', 
                'productId', 
                'borrowerId', 
                'namaPeminjam', 
                'borrowDate', 
                'returnDate', 
                'expectedReturnDate', 
                'status', 
                'notes', 
                'borrowedBy', 
                'createdAt', 
                'updatedAt'
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['uuid', 'name', 'merek', 'serialNumber', 'kategori', 'image', 'status']
                },
                {
                    model: User,
                    as: 'borrower',
                    attributes: ['name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'processedBy',
                    attributes: ['name', 'email'],
                    required: false
                }
            ]
        });
        
        if (!borrowing) {
            return res.status(404).json({ msg: "Data peminjaman tidak ditemukan" });
        }
        
        res.status(200).json(borrowing);
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || "Gagal memuat data peminjaman" 
        });
    }
};

// ============================================
// CREATE NEW BORROWING
// ============================================
export const createBorrowing = async (req, res) => {
    try {
        const { productId, namaPeminjam, borrowDate, expectedReturnDate, notes } = req.body;
        
        // ===== VALIDASI INPUT =====
        if (!productId || !namaPeminjam) {
            return res.status(400).json({ 
                msg: "Product ID dan Nama Peminjam harus diisi" 
            });
        }
        
        if (namaPeminjam.trim().length < 3) {
            return res.status(400).json({ 
                msg: "Nama peminjam minimal 3 karakter" 
            });
        }
        
        if (namaPeminjam.trim().length > 255) {
            return res.status(400).json({ 
                msg: "Nama peminjam maksimal 255 karakter" 
            });
        }
        
        // ===== CEK PRODUK =====
        const product = await Product.findOne({
            where: {
                uuid: productId
            }
        });
        
        if (!product) {
            return res.status(404).json({ 
                msg: "Produk tidak ditemukan" 
            });
        }
        
        // ===== NORMALISASI STATUS PRODUK =====
        // Normalisasi status: jika null/undefined/kosong, set ke 'tersedia'
        let productStatus = product.status;
        if (!productStatus || productStatus === null || productStatus === undefined || productStatus === '') {
            productStatus = 'tersedia';
            // Update status di database jika belum ter-set
            await Product.update(
                { status: 'tersedia' },
                { where: { id: product.id } }
            );
        }
        
        // ===== VALIDASI STATUS PRODUK =====
        if (productStatus !== 'tersedia') {
            return res.status(400).json({ 
                msg: `Produk "${product.name}" sedang ${productStatus === 'dipinjam' ? 'dipinjam' : 'tidak tersedia'}, tidak dapat dipinjam` 
            });
        }
        
        // ===== CEK PEMINJAMAN AKTIF =====
        // Cek apakah ada borrowing aktif (dipinjam atau terlambat)
        // Ini adalah double-check untuk memastikan tidak ada race condition
        const activeBorrowing = await Borrowing.findOne({
            where: {
                productId: product.id,
                status: {
                    [Op.in]: ['dipinjam', 'terlambat']
                }
            }
        });
        
        if (activeBorrowing) {
            // Update status produk jika ada data yang tidak sinkron
            await Product.update(
                { status: 'dipinjam' },
                { where: { id: product.id } }
            );
            return res.status(400).json({ 
                msg: "Produk sedang dipinjam oleh orang lain" 
            });
        }
        
        // Double-check: Pastikan status produk masih 'tersedia' setelah cek borrowing aktif
        // (untuk menghindari race condition jika ada request lain yang meminjam produk ini)
        const recheckProduct = await Product.findOne({
            where: { id: product.id },
            attributes: ['id', 'status']
        });
        
        if (recheckProduct && recheckProduct.status === 'dipinjam') {
            return res.status(400).json({ 
                msg: "Produk sedang dipinjam oleh orang lain" 
            });
        }
        
        // ===== VALIDASI TANGGAL PINJAM =====
        let finalBorrowDate = new Date(); // Default: sekarang
        if (borrowDate) {
            const borrowDateObj = new Date(borrowDate);
            if (isNaN(borrowDateObj.getTime())) {
                return res.status(400).json({ 
                    msg: "Tanggal dan jam pinjam tidak valid" 
                });
            }
            finalBorrowDate = borrowDateObj;
        }
        
        // ===== VALIDASI TANGGAL KEMBALI =====
        let finalExpectedReturnDate = null;
        if (expectedReturnDate) {
            const expectedDate = new Date(expectedReturnDate);
            if (isNaN(expectedDate.getTime())) {
                return res.status(400).json({ 
                    msg: "Tanggal dan jam kembali tidak valid" 
                });
            }
            
            if (expectedDate <= finalBorrowDate) {
                return res.status(400).json({ 
                    msg: "Tanggal dan jam kembali harus lebih besar dari tanggal dan jam pinjam" 
                });
            }
            finalExpectedReturnDate = expectedDate;
        }
        
        // ===== VALIDASI USER ID =====
        // Pastikan req.userId valid (harus ada karena sudah melalui verifyUser middleware)
        // Cek apakah user dengan ID tersebut ada di database sebelum menggunakan sebagai foreign key
        let finalBorrowedBy = null;
        if (req.userId) {
            try {
                const user = await User.findOne({
                    where: { id: req.userId },
                    attributes: ['id']
                });
                
                if (user && user.id) {
                    finalBorrowedBy = user.id;
                } else {
                    // Jika user tidak ditemukan, cari user admin pertama sebagai fallback
                    const adminUser = await User.findOne({
                        where: { role: 'admin' },
                        attributes: ['id'],
                        order: [['id', 'ASC']]
                    });
                    
                    if (adminUser && adminUser.id) {
                        finalBorrowedBy = adminUser.id;
                    } else {
                        // Jika tidak ada admin, set ke null (akan error jika constraint mengharuskan tidak null)
                        finalBorrowedBy = null;
                    }
                }
            } catch (userError) {
                // Jika ada error saat mencari user, coba cari admin sebagai fallback
                try {
                    const adminUser = await User.findOne({
                        where: { role: 'admin' },
                        attributes: ['id'],
                        order: [['id', 'ASC']]
                    });
                    if (adminUser && adminUser.id) {
                        finalBorrowedBy = adminUser.id;
                    }
                } catch (adminError) {
                    finalBorrowedBy = null;
                }
            }
        }
        
        // ===== BUAT PEMINJAMAN =====
        // Gunakan fields option untuk memastikan hanya kolom yang ada di model yang diisi
        // Jika ada kolom createdBy di database, kita akan mengisinya dengan finalBorrowedBy
        let borrowing;
        try {
            const borrowingData = {
                productId: product.id,
                borrowerId: null, // Input manual, tidak perlu user terdaftar
                namaPeminjam: namaPeminjam.trim(),
                expectedReturnDate: finalExpectedReturnDate,
                notes: notes ? notes.trim() : null,
                borrowedBy: finalBorrowedBy, // User ID yang memproses peminjaman (null jika user tidak ditemukan)
                status: 'dipinjam', // Status awal selalu 'dipinjam'
                borrowDate: finalBorrowDate
            };
            
            // Jika ada kolom createdBy di model, isi dengan finalBorrowedBy juga
            // (untuk menghindari foreign key constraint error)
            // Jika finalBorrowedBy null, kita tetap set createdBy untuk memenuhi constraint
            // Tapi jika constraint mengharuskan tidak null, kita perlu memastikan finalBorrowedBy tidak null
            // Jika finalBorrowedBy masih null setelah fallback, kita akan handle di error catch
            borrowingData.createdBy = finalBorrowedBy; // Bisa null jika constraint allow null, atau akan diisi di retry jika error
            
            borrowing = await Borrowing.create(borrowingData, {
                fields: ['productId', 'borrowerId', 'namaPeminjam', 'expectedReturnDate', 'notes', 'borrowedBy', 'status', 'borrowDate', 'createdBy']
            });
        } catch (createError) {
            // Handle foreign key constraint error
            if (createError.name === 'SequelizeForeignKeyConstraintError' || 
                (createError.message && createError.message.includes('foreign key constraint'))) {
                
                // Jika error terkait borrowedBy atau createdBy, coba lagi dengan mencari admin user
                if (createError.message.includes('borrowedBy') || createError.message.includes('createdBy')) {
                    try {
                        // Cari admin user sebagai fallback
                        const adminUser = await User.findOne({
                            where: { role: 'admin' },
                            attributes: ['id'],
                            order: [['id', 'ASC']]
                        });
                        
                        const fallbackUserId = (adminUser && adminUser.id) ? adminUser.id : null;
                        
                        if (!fallbackUserId) {
                            // Jika tidak ada admin, return error
                            return res.status(500).json({ 
                                msg: "Gagal membuat peminjaman. Tidak ada user admin yang valid di database. Silakan hubungi administrator." 
                            });
                        }
                        
                        // Retry dengan admin user sebagai fallback
                        const retryData = {
                            productId: product.id,
                            borrowerId: null,
                            namaPeminjam: namaPeminjam.trim(),
                            expectedReturnDate: finalExpectedReturnDate,
                            notes: notes ? notes.trim() : null,
                            borrowedBy: fallbackUserId, // Gunakan admin sebagai fallback
                            status: 'dipinjam',
                            borrowDate: finalBorrowDate,
                            createdBy: fallbackUserId // Gunakan admin sebagai fallback untuk createdBy juga
                        };
                        
                        borrowing = await Borrowing.create(retryData, {
                            fields: ['productId', 'borrowerId', 'namaPeminjam', 'expectedReturnDate', 'notes', 'borrowedBy', 'status', 'borrowDate', 'createdBy']
                        });
                    } catch (retryError) {
                        return res.status(500).json({ 
                            msg: "Gagal membuat peminjaman. Silakan coba lagi atau hubungi administrator." 
                        });
                    }
                } else {
                    return res.status(500).json({ 
                        msg: "Gagal membuat peminjaman karena constraint database. Silakan hubungi administrator." 
                    });
                }
            } else {
                return res.status(500).json({ 
                    msg: createError.message || "Gagal membuat peminjaman" 
                });
            }
        }
        
        // ===== UPDATE STATUS PRODUK =====
        const updateResult = await Product.update(
            { status: 'dipinjam' },
            { where: { id: product.id } }
        );
        
        if (updateResult[0] === 0) {
            // Silent fail - status mungkin sudah diupdate
        }
        
        // ===== VERIFIKASI =====
        const updatedProduct = await Product.findOne({
            where: { id: product.id },
            attributes: ['id', 'status']
        });
        
        if (updatedProduct && updatedProduct.status !== 'dipinjam') {
            // Jika masih salah, perbaiki
            await Product.update(
                { status: 'dipinjam' },
                { where: { id: product.id } }
            );
        }
        
        // ===== GET FULL DATA =====
        const fullBorrowing = await Borrowing.findOne({
            where: { id: borrowing.id },
            attributes: [
                'uuid', 
                'productId', 
                'borrowerId', 
                'namaPeminjam', 
                'borrowDate', 
                'returnDate', 
                'expectedReturnDate', 
                'status', 
                'notes', 
                'borrowedBy', 
                'createdAt', 
                'updatedAt'
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['uuid', 'name', 'merek', 'serialNumber', 'kategori', 'image', 'status']
                },
                {
                    model: User,
                    as: 'borrower',
                    attributes: ['name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'processedBy',
                    attributes: ['name', 'email'],
                    required: false
                }
            ]
        });
        
        res.status(201).json({ 
            msg: "Peminjaman berhasil dibuat",
            borrowing: fullBorrowing
        });
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || "Gagal membuat peminjaman" 
        });
    }
};

// ============================================
// RETURN BORROWING
// ============================================
export const returnBorrowing = async (req, res) => {
    try {
        const { notes } = req.body;
        const borrowingUuid = req.params.id;
        
        console.log(`[RETURN] Processing return for UUID: ${borrowingUuid}`);
        
        // ===== CEK PEMINJAMAN =====
        // Coba cari berdasarkan UUID dulu
        let borrowing = await Borrowing.findOne({
            where: {
                uuid: borrowingUuid
            },
            attributes: [
                'id',
                'uuid',
                'productId',
                'borrowerId',
                'namaPeminjam',
                'borrowDate',
                'returnDate',
                'expectedReturnDate',
                'status',
                'notes',
                'borrowedBy',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    required: false
                }
            ]
        });
        
        // Jika tidak ditemukan dengan UUID, coba beberapa alternatif:
        // 1. Cari dengan ID jika UUID adalah format temp-
        // 2. Cari dengan ID langsung jika UUID adalah angka (ID)
        if (!borrowing) {
            let borrowingId = null;
            
            // Coba parse ID dari UUID jika format temp-
            if (borrowingUuid.startsWith('temp-')) {
                borrowingId = parseInt(borrowingUuid.replace('temp-', ''));
            } 
            // Coba parse sebagai ID langsung jika UUID adalah angka
            else if (!isNaN(borrowingUuid) && borrowingUuid.trim() !== '') {
                borrowingId = parseInt(borrowingUuid);
            }
            
            if (borrowingId && !isNaN(borrowingId)) {
                console.log(`[RETURN] UUID not found, trying to find by ID: ${borrowingId}`);
                borrowing = await Borrowing.findOne({
                    where: {
                        id: borrowingId
                    },
                    attributes: [
                        'id',
                        'uuid',
                        'productId',
                        'borrowerId',
                        'namaPeminjam',
                        'borrowDate',
                        'returnDate',
                        'expectedReturnDate',
                        'status',
                        'notes',
                        'borrowedBy',
                        'createdAt',
                        'updatedAt'
                    ],
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            required: false
                        }
                    ]
                });
                
                if (borrowing) {
                    console.log(`[RETURN] Found borrowing by ID: ${borrowingId}, UUID: ${borrowing.uuid || 'NULL'}`);
                } else {
                    console.log(`[RETURN] Borrowing not found by ID: ${borrowingId}`);
                }
            }
        }
        
        if (!borrowing) {
            console.log(`[RETURN] Borrowing not found for UUID/ID: ${borrowingUuid}`);
            return res.status(404).json({ 
                msg: "Data peminjaman tidak ditemukan. Pastikan UUID atau ID peminjaman valid." 
            });
        }
        
        console.log(`[RETURN] Found borrowing ID: ${borrowing.id}, Status: ${borrowing.status}, Product ID: ${borrowing.productId}`);
        console.log(`[RETURN] Current user ID: ${req.userId}, Role: ${req.role}, Borrower ID: ${borrowing.borrowerId}`);
        
        // ===== VALIDASI AKSES =====
        // Hanya peminjam (borrowerId === req.userId) atau admin yang bisa mengembalikan
        const isBorrower = borrowing.borrowerId && borrowing.borrowerId === req.userId;
        const isAdmin = req.role && req.role.toLowerCase() === 'admin';
        
        if (!isBorrower && !isAdmin) {
            console.log(`[RETURN] Access denied - User ID: ${req.userId}, Role: ${req.role}, Borrower ID: ${borrowing.borrowerId}`);
            return res.status(403).json({ 
                msg: "Anda tidak memiliki izin untuk mengembalikan barang ini. Hanya peminjam atau admin yang dapat mengembalikan barang." 
            });
        }
        
        // ===== VALIDASI STATUS =====
        if (borrowing.status === 'dikembalikan') {
            return res.status(400).json({ 
                msg: "Barang sudah dikembalikan sebelumnya" 
            });
        }
        
        // Bisa dikembalikan jika status 'dipinjam' atau 'terlambat'
        if (borrowing.status !== 'dipinjam' && borrowing.status !== 'terlambat') {
            return res.status(400).json({ 
                msg: `Status peminjaman tidak valid: ${borrowing.status}. Hanya peminjaman dengan status 'dipinjam' atau 'terlambat' yang dapat dikembalikan.` 
            });
        }
        
        // ===== UPDATE PEMINJAMAN =====
        const returnDateNow = new Date();
        const updateData = {
            returnDate: returnDateNow,
            status: 'dikembalikan'
        };
        
        // Update notes hanya jika diberikan
        if (notes !== undefined) {
            updateData.notes = notes ? notes.trim() : null;
        }
        
        // Update borrowing
        console.log(`[RETURN] Updating borrowing ID ${borrowing.id} with data:`, updateData);
        
        const [updateCount] = await Borrowing.update(
            updateData,
            {
                where: { id: borrowing.id }
            }
        );
        
        console.log(`[RETURN] Update result: ${updateCount} rows affected`);
        
        if (updateCount === 0) {
            // Double check status
            const checkBorrowing = await Borrowing.findOne({
                where: { id: borrowing.id },
                attributes: ['status', 'returnDate']
            });
            
            if (checkBorrowing && checkBorrowing.status === 'dikembalikan') {
                console.log(`[RETURN] Borrowing already returned, continuing...`);
                // Already returned, continue
            } else {
                console.error(`[RETURN] Failed to update borrowing. Current status: ${checkBorrowing?.status}`);
                return res.status(500).json({ 
                    msg: "Gagal mengupdate data peminjaman" 
                });
            }
        }
        
        // ===== UPDATE STATUS PRODUK =====
        let newProductStatus = 'tersedia';
        
        if (borrowing.productId && borrowing.productId !== null && borrowing.productId !== undefined) {
            // Cek apakah masih ada borrowing aktif untuk produk ini
            const otherActiveBorrowing = await Borrowing.findOne({
                where: {
                    productId: borrowing.productId,
                    id: { [Op.ne]: borrowing.id },
                    status: {
                        [Op.in]: ['dipinjam', 'terlambat']
                    }
                }
            });

            // Jika tidak ada borrowing aktif lainnya, set status menjadi 'tersedia'
            // Jika masih ada, tetap 'dipinjam'
            newProductStatus = otherActiveBorrowing ? 'dipinjam' : 'tersedia';
            
            // Update status produk
            console.log(`[RETURN] Updating product ID ${borrowing.productId} status to: ${newProductStatus}`);
            const [productUpdateCount] = await Product.update(
                { status: newProductStatus },
                { where: { id: borrowing.productId } }
            );
            console.log(`[RETURN] Product update result: ${productUpdateCount} rows affected`);
        } else {
            console.warn(`[RETURN] Borrowing ID ${borrowing.id} has no valid productId, skipping product status update`);
        }
        
        // ===== GET UPDATED BORROWING DATA =====
        console.log(`[RETURN] Fetching updated borrowing data...`);
        const updatedBorrowing = await Borrowing.findOne({
            where: { id: borrowing.id },
            attributes: [
                'uuid', 
                'productId', 
                'borrowerId', 
                'namaPeminjam', 
                'borrowDate', 
                'returnDate', 
                'expectedReturnDate', 
                'status', 
                'notes', 
                'borrowedBy', 
                'createdAt', 
                'updatedAt'
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['uuid', 'name', 'merek', 'serialNumber', 'kategori', 'image', 'status'],
                    required: false
                },
                {
                    model: User,
                    as: 'borrower',
                    attributes: ['name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'processedBy',
                    attributes: ['name', 'email'],
                    required: false
                }
            ]
        });
        
        console.log(`[RETURN] Success! Returning response...`);
        
        res.status(200).json({ 
            msg: "Barang berhasil dikembalikan",
            borrowing: updatedBorrowing,
            productStatus: newProductStatus
        });
    } catch (error) {
        console.error("[RETURN] Error in returnBorrowing:", error);
        console.error("[RETURN] Error stack:", error.stack);
        res.status(500).json({ 
            msg: error.message || "Gagal mengembalikan barang"
        });
    }
};

// ============================================
// UPDATE BORROWING
// ============================================
export const updateBorrowing = async (req, res) => {
    try {
        const { productId, namaPeminjam, borrowDate, expectedReturnDate, actualReturnDate, status, notes } = req.body;
        
        // ===== CEK PEMINJAMAN =====
        const borrowing = await Borrowing.findOne({
            where: {
                uuid: req.params.id
            },
            include: [
                {
                    model: Product,
                    as: 'product'
                }
            ]
        });
        
        if (!borrowing) {
            return res.status(404).json({ 
                msg: "Data peminjaman tidak ditemukan" 
            });
        }
        
        // ===== VALIDASI INPUT =====
        if (!namaPeminjam || !borrowDate || !expectedReturnDate) {
            return res.status(400).json({ 
                msg: "Nama Peminjam, Tanggal Pinjam, dan Tanggal Kembali harus diisi" 
            });
        }
        
        if (namaPeminjam.trim().length < 3) {
            return res.status(400).json({ 
                msg: "Nama peminjam minimal 3 karakter" 
            });
        }
        
        if (namaPeminjam.trim().length > 255) {
            return res.status(400).json({ 
                msg: "Nama peminjam maksimal 255 karakter" 
            });
        }
        
        // ===== VALIDASI TANGGAL =====
        let finalBorrowDate = new Date(borrowDate);
        if (isNaN(finalBorrowDate.getTime())) {
            return res.status(400).json({ 
                msg: "Tanggal dan jam pinjam tidak valid" 
            });
        }
        
        let finalExpectedReturnDate = new Date(expectedReturnDate);
        if (isNaN(finalExpectedReturnDate.getTime())) {
            return res.status(400).json({ 
                msg: "Tanggal dan jam kembali tidak valid" 
            });
        }
        
        if (finalExpectedReturnDate <= finalBorrowDate) {
            return res.status(400).json({ 
                msg: "Tanggal dan jam kembali harus lebih besar dari tanggal dan jam pinjam" 
            });
        }
        
        let finalActualReturnDate = null;
        if (actualReturnDate) {
            finalActualReturnDate = new Date(actualReturnDate);
            if (isNaN(finalActualReturnDate.getTime())) {
                return res.status(400).json({ 
                    msg: "Tanggal dan jam kembali aktual tidak valid" 
                });
            }
        }
        
        // ===== VALIDASI STATUS =====
        const validStatuses = ['dipinjam', 'dikembalikan', 'terlambat'];
        let finalStatus = status || borrowing.status;
        if (!validStatuses.includes(finalStatus)) {
            finalStatus = borrowing.status; // Keep current status if invalid
        }
        
        // ===== UPDATE PEMINJAMAN =====
        const oldStatus = borrowing.status;
        const oldProductId = borrowing.productId;
        
        await Borrowing.update(
            {
                namaPeminjam: namaPeminjam.trim(),
                borrowDate: finalBorrowDate,
                expectedReturnDate: finalExpectedReturnDate,
                returnDate: finalActualReturnDate,
                status: finalStatus,
                notes: notes !== undefined ? notes.trim() : borrowing.notes
            },
            {
                where: { id: borrowing.id }
            }
        );
        
        // ===== UPDATE STATUS PRODUK BERDASARKAN STATUS BORROWING =====
        // Jika status berubah menjadi 'dikembalikan', update produk menjadi 'tersedia'
        // Jika status berubah menjadi 'dipinjam' atau 'terlambat', update produk menjadi 'dipinjam'
        if (oldStatus !== finalStatus && oldProductId && oldProductId !== null && oldProductId !== undefined) {
            // Cek apakah masih ada borrowing aktif lainnya untuk produk ini
            const otherActiveBorrowing = await Borrowing.findOne({
                where: {
                    productId: oldProductId,
                    id: { [Op.ne]: borrowing.id },
                    status: {
                        [Op.in]: ['dipinjam', 'terlambat']
                    }
                }
            });
            
            if (finalStatus === 'dikembalikan') {
                // Jika dikembalikan dan tidak ada borrowing aktif lainnya, set 'tersedia'
                const newProductStatus = otherActiveBorrowing ? 'dipinjam' : 'tersedia';
                await Product.update(
                    { status: newProductStatus },
                    { where: { id: oldProductId } }
                );
            } else if (finalStatus === 'dipinjam' || finalStatus === 'terlambat') {
                // Jika dipinjam atau terlambat, set 'dipinjam'
                await Product.update(
                    { status: 'dipinjam' },
                    { where: { id: oldProductId } }
                );
            }
        } else if (oldStatus !== finalStatus && (!oldProductId || oldProductId === null || oldProductId === undefined)) {
            console.warn(`[UPDATE_BORROWING] Borrowing ID ${borrowing.id} has no valid productId, skipping product status update`);
        }
        
        // ===== GET UPDATED DATA =====
        const updatedBorrowing = await Borrowing.findOne({
            where: { id: borrowing.id },
            attributes: [
                'uuid', 
                'productId', 
                'borrowerId', 
                'namaPeminjam', 
                'borrowDate', 
                'returnDate', 
                'expectedReturnDate', 
                'status', 
                'notes', 
                'borrowedBy', 
                'createdAt', 
                'updatedAt'
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['uuid', 'name', 'merek', 'serialNumber', 'kategori', 'image', 'status']
                },
                {
                    model: User,
                    as: 'borrower',
                    attributes: ['name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'processedBy',
                    attributes: ['name', 'email'],
                    required: false
                }
            ]
        });
        
        res.status(200).json({ 
            msg: "Peminjaman berhasil diupdate",
            borrowing: updatedBorrowing
        });
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || "Gagal mengupdate peminjaman" 
        });
    }
};

// ============================================
// DELETE BORROWING (Only for returned items)
// ============================================
export const deleteBorrowing = async (req, res) => {
    try {
        const borrowing = await Borrowing.findOne({
            where: {
                uuid: req.params.id
            }
        });
        
        if (!borrowing) {
            return res.status(404).json({ 
                msg: "Data peminjaman tidak ditemukan" 
            });
        }
        
        // Hanya bisa hapus jika sudah dikembalikan
        if (borrowing.status !== 'dikembalikan') {
            return res.status(400).json({ 
                msg: "Hanya dapat menghapus data peminjaman yang sudah dikembalikan" 
            });
        }
        
        // Simpan productId sebelum menghapus untuk update status produk
        const productIdToCheck = borrowing.productId;
        
        await Borrowing.destroy({
            where: { id: borrowing.id }
        });
        
        // Setelah menghapus borrowing, cek apakah masih ada borrowing aktif untuk produk ini
        // Jika tidak ada, update status produk menjadi 'tersedia'
        // Hanya update jika productId valid
        if (productIdToCheck && productIdToCheck !== null && productIdToCheck !== undefined) {
            const otherActiveBorrowing = await Borrowing.findOne({
                where: {
                    productId: productIdToCheck,
                    status: {
                        [Op.in]: ['dipinjam', 'terlambat']
                    }
                }
            });
            
            // Jika tidak ada borrowing aktif lainnya, set status menjadi 'tersedia'
            if (!otherActiveBorrowing) {
                await Product.update(
                    { status: 'tersedia' },
                    { where: { id: productIdToCheck } }
                );
            }
        } else {
            console.warn(`[DELETE_BORROWING] Borrowing ID ${borrowing.id} has no valid productId, skipping product status update`);
        }
        
        res.status(200).json({ 
            msg: "Data peminjaman berhasil dihapus" 
        });
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || "Gagal menghapus data peminjaman" 
        });
    }
};

// ============================================
// GET BORROWING STATISTICS
// ============================================
export const getBorrowingStats = async (req, res) => {
    try {
        // Update status terlambat sebelum mengambil statistik
        await updateOverdueStatus();
        
        const totalBorrowings = await Borrowing.count();
        const activeBorrowings = await Borrowing.count({
            where: {
                status: {
                    [Op.in]: ['dipinjam', 'terlambat']
                }
            }
        });
        const returnedBorrowings = await Borrowing.count({
            where: {
                status: 'dikembalikan'
            }
        });
        const overdueBorrowings = await Borrowing.count({
            where: {
                status: 'terlambat'
            }
        });
        
        res.status(200).json({
            total: totalBorrowings,
            active: activeBorrowings,
            returned: returnedBorrowings,
            overdue: overdueBorrowings
        });
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || "Gagal memuat statistik peminjaman" 
        });
    }
};
