import Category from "../models/CategoryModel.js";

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']],
            attributes: ['uuid', 'name', 'description', 'createdAt', 'updatedAt']
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ msg: error.message || "Internal server error" });
    }
}

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                uuid: req.params.id
            },
            attributes: ['uuid', 'name', 'description', 'createdAt', 'updatedAt']
        });

        if (!category) {
            return res.status(404).json({ msg: "Kategori tidak ditemukan" });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ msg: error.message || "Internal server error" });
    }
}

// Create category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || name.trim() === "") {
            return res.status(400).json({ msg: "Nama kategori harus diisi" });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ msg: "Nama kategori minimal 2 karakter" });
        }

        if (name.trim().length > 50) {
            return res.status(400).json({ msg: "Nama kategori maksimal 50 karakter" });
        }

        // Check if category name already exists
        const existingCategory = await Category.findOne({
            where: {
                name: name.trim()
            }
        });

        if (existingCategory) {
            return res.status(400).json({ msg: "Kategori dengan nama tersebut sudah ada" });
        }

        // Create category
        const category = await Category.create({
            name: name.trim(),
            description: description ? description.trim() : null
        });

        res.status(201).json({
            msg: "Kategori berhasil ditambahkan",
            category: {
                uuid: category.uuid,
                name: category.name,
                description: category.description
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: "Kategori dengan nama tersebut sudah ada" });
        }
        res.status(500).json({ msg: error.message || "Internal server error" });
    }
}

// Update category
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!category) {
            return res.status(404).json({ msg: "Kategori tidak ditemukan" });
        }

        const { name, description } = req.body;

        // Validation
        if (name !== undefined) {
            if (!name || name.trim() === "") {
                return res.status(400).json({ msg: "Nama kategori harus diisi" });
            }

            if (name.trim().length < 2) {
                return res.status(400).json({ msg: "Nama kategori minimal 2 karakter" });
            }

            if (name.trim().length > 50) {
                return res.status(400).json({ msg: "Nama kategori maksimal 50 karakter" });
            }

            // Check if category name already exists (excluding current category)
            const existingCategory = await Category.findOne({
                where: {
                    name: name.trim()
                }
            });

            if (existingCategory && existingCategory.uuid !== category.uuid) {
                return res.status(400).json({ msg: "Kategori dengan nama tersebut sudah ada" });
            }
        }

        // Update category
        await category.update({
            name: name !== undefined ? name.trim() : category.name,
            description: description !== undefined ? (description ? description.trim() : null) : category.description
        });

        res.status(200).json({
            msg: "Kategori berhasil diupdate",
            category: {
                uuid: category.uuid,
                name: category.name,
                description: category.description
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: "Kategori dengan nama tersebut sudah ada" });
        }
        res.status(500).json({ msg: error.message || "Internal server error" });
    }
}

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!category) {
            return res.status(404).json({ msg: "Kategori tidak ditemukan" });
        }

        await category.destroy();

        res.status(200).json({ msg: "Kategori berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message || "Internal server error" });
    }
}










