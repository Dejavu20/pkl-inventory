import express from "express";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/Categories.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

// Get all categories (public - for dropdown)
router.get('/categories', getCategories);

// Get category by ID (admin only)
router.get('/categories/:id', verifyUser, adminOnly, getCategoryById);

// Create category (admin only)
router.post('/categories', verifyUser, adminOnly, createCategory);

// Update category (admin only)
router.patch('/categories/:id', verifyUser, adminOnly, updateCategory);

// Delete category (admin only)
router.delete('/categories/:id', verifyUser, adminOnly, deleteCategory);

export default router;







