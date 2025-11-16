import express from "express";
import { 
    getBorrowings,
    getBorrowingById,
    createBorrowing,
    updateBorrowing,
    returnBorrowing,
    deleteBorrowing,
    getBorrowingStats,
    exportBorrowingsToCSV
} from "../controllers/Borrowings.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/borrowings', verifyUser, getBorrowings);
router.get('/borrowings/export/csv', verifyUser, exportBorrowingsToCSV);
router.get('/borrowings/stats', verifyUser, getBorrowingStats);
router.get('/borrowings/:id', verifyUser, getBorrowingById);
router.post('/borrowings', verifyUser, createBorrowing);
router.patch('/borrowings/:id', verifyUser, updateBorrowing);
router.patch('/borrowings/:id/return', verifyUser, returnBorrowing);
router.delete('/borrowings/:id', verifyUser, deleteBorrowing);

export default router;

