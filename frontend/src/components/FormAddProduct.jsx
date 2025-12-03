import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Container,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

const FormAddProduct = () => {
  const [name, setName] = useState("");
  const [merek, setMerek] = useState("");
  const [kategori, setKategori] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMsg("File harus berupa gambar");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMsg("Ukuran file maksimal 5MB");
        return;
      }

      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setMsg("");
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSaving(true);

    try {
      let imageBase64 = null;

      if (image) {
        imageBase64 = await convertImageToBase64(image);
      }

      await axios.post(
        `${API_BASE_URL}/products`,
        {
          name: name.trim(),
          merek: merek.trim(),
          kategori: kategori && kategori !== "all" ? kategori.trim() : null,
          image: imageBase64,
        },
        {
          withCredentials: true,
        }
      );
      navigate("/products");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal menambahkan produk");
      } else {
        setMsg("Gagal menambahkan produk");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
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
            Tambah Produk Baru
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tambah produk baru ke dalam sistem
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/products"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Kembali
        </Button>
      </Box>

      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={saveProduct}>
            {msg && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMsg("")}>
                {msg}
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="caption">
                <strong>Catatan:</strong> Produk baru akan otomatis diset sebagai{" "}
                <strong>"Tersedia"</strong> dan Serial Number akan otomatis dibuat.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Nama Produk"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama produk"
              margin="normal"
            />

            <TextField
              fullWidth
              label="Merek"
              required
              value={merek}
              onChange={(e) => setMerek(e.target.value)}
              placeholder="Masukkan merek produk"
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                label="Kategori"
              >
                <MenuItem value="">Pilih Kategori (Opsional)</MenuItem>
                {isLoadingCategories ? (
                  <MenuItem disabled>Memuat kategori...</MenuItem>
                ) : (
                  categories.map((category) => (
                    <MenuItem key={category.uuid} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Pilih kategori untuk produk ini (opsional)
              </Typography>
            </FormControl>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Foto Produk
              </Typography>
              {!imagePreview ? (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{ mt: 1 }}
                >
                  Pilih Foto
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mt: 2,
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    src={imagePreview}
                    alt="Preview"
                    variant="rounded"
                    sx={{ width: 128, height: 128 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {image?.name || "Preview"}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={removeImage}
                        sx={{ mr: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Typography variant="caption" component="span">
                        Hapus Foto
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Upload foto produk (opsional, maksimal 5MB)
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/products")}
                disabled={isSaving}
              >
                Batal
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default FormAddProduct;
