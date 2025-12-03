import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import ConfirmModal from "./ConfirmModal";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat data kategori");
      } else {
        setError("Gagal memuat data kategori");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: "", description: "" });
    setShowAddModal(true);
    setError("");
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ name: "", description: "" });
    setError("");
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setError("");
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!formData.name || formData.name.trim() === "") {
      setError("Nama kategori harus diisi");
      setIsSubmitting(false);
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Nama kategori minimal 2 karakter");
      setIsSubmitting(false);
      return;
    }

    if (formData.name.trim().length > 50) {
      setError("Nama kategori maksimal 50 karakter");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingCategory) {
        await axios.patch(`${API_BASE_URL}/categories/${editingCategory.uuid}`, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        setSuccess("Kategori berhasil diupdate!");
      } else {
        await axios.post(`${API_BASE_URL}/categories`, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        setSuccess("Kategori berhasil ditambahkan!");
      }
      closeAddModal();
      closeEditModal();
      getCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menyimpan kategori");
      } else {
        setError("Gagal menyimpan kategori");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      setError("");
      setSuccess("");
      await axios.delete(`${API_BASE_URL}/categories/${categoryToDelete.uuid}`);
      setSuccess("Kategori berhasil dihapus!");
      setCategoryToDelete(null);
      getCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus kategori");
      } else {
        setError("Gagal menghapus kategori");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Manajemen Kategori
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kelola kategori produk
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddModal}
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)",
            },
          }}
        >
          Tambah Kategori
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Alert severity="info">
          Tidak ada kategori. Klik "Tambah Kategori" untuk menambahkan kategori pertama.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.100" }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    No
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Nama Kategori
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Deskripsi
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Aksi
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow
                  key={category.uuid}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2">{index + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {category.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => openEditModal(category)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => setCategoryToDelete(category)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddModal || !!editingCategory}
        onClose={editingCategory ? closeEditModal : closeAddModal}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nama Kategori"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama kategori"
              margin="normal"
              inputProps={{ minLength: 2, maxLength: 50 }}
              helperText="Nama kategori harus antara 2 hingga 50 karakter"
            />

            <TextField
              fullWidth
              label="Deskripsi"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Masukkan deskripsi kategori (opsional)"
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={editingCategory ? closeEditModal : closeAddModal}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Kategori"
        message={
          categoryToDelete && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Kategori yang akan dihapus:
                </Typography>
                <Typography variant="body2">
                  <strong>Nama:</strong> {categoryToDelete.name}
                </Typography>
                {categoryToDelete.description && (
                  <Typography variant="body2">
                    <strong>Deskripsi:</strong> {categoryToDelete.description}
                  </Typography>
                )}
              </Alert>
              <Alert
                severity="info"
                sx={{
                  backgroundColor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Kategori
                  akan dihapus secara permanen.
                </Typography>
              </Alert>
            </Box>
          )
        }
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default CategoryList;
