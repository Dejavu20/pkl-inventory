import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
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
  InputAdornment,
  CircularProgress,
  Container,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  FilterList as FilterListIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";

const FormEditProduct = () => {
  const [name, setName] = useState("");
  const [merek, setMerek] = useState("");
  const [kategori, setKategori] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMsg("File harus berupa gambar");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setMsg("Ukuran gambar maksimal 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage("");
    setImagePreview("");
  };

  useEffect(() => {
    const getProductById = async () => {
      try {
        setIsFetching(true);
        setMsg("");
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        setName(response.data.name || "");
        setMerek(response.data.merek || "");
        setKategori(response.data.kategori || "");
        setSerialNumber(response.data.serialNumber || "");
        setImage(response.data.image || "");
        setImagePreview(response.data.image || "");
      } catch (error) {
        if (error.response) {
          setMsg(error.response.data.msg || "Gagal memuat data produk");
        } else {
          setMsg("Gagal memuat data produk");
        }
      } finally {
        setIsFetching(false);
      }
    };
    getProductById();
  }, [id]);

  const updateProduct = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    if (!name || !merek) {
      setMsg("Nama dan Merek harus diisi");
      setIsLoading(false);
      return;
    }

    if (name.trim().length < 3) {
      setMsg("Nama produk minimal 3 karakter");
      setIsLoading(false);
      return;
    }

    if (name.trim().length > 100) {
      setMsg("Nama produk maksimal 100 karakter");
      setIsLoading(false);
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/products/${id}`, {
        name: name.trim(),
        merek: merek.trim(),
        kategori: kategori.trim() || null,
        image: image || null,
      });
      navigate("/products");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal mengupdate produk");
      } else {
        setMsg("Gagal mengupdate produk");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Memuat data produk...
        </Typography>
      </Box>
    );
  }

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
            Edit Produk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update informasi produk
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
          <form onSubmit={updateProduct}>
            {msg && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMsg("")}>
                {msg}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nama Produk"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama produk"
              margin="normal"
              inputProps={{ minLength: 3, maxLength: 100 }}
              helperText={
                name && name.length < 3
                  ? `Nama produk minimal 3 karakter (tersisa ${3 - name.length} karakter)`
                  : name && name.length > 100
                  ? `Nama produk maksimal 100 karakter (kelebihan ${name.length - 100} karakter)`
                  : "Nama produk harus antara 3 hingga 100 karakter"
              }
              error={name ? name.length < 3 || name.length > 100 : false}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InventoryIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Merek"
              required
              value={merek}
              onChange={(e) => setMerek(e.target.value)}
              placeholder="Masukkan merek produk"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOfferIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                label="Kategori"
                disabled={isLoadingCategories}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">Pilih Kategori (Opsional)</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.uuid} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
                {kategori &&
                  !categories.find((cat) => cat.name === kategori) && (
                    <MenuItem value={kategori} disabled>
                      {kategori} (tidak tersedia)
                    </MenuItem>
                  )}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Pilih kategori dari daftar yang tersedia. Admin dapat menambahkan kategori baru di
                halaman Categories.
              </Typography>
            </FormControl>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Gambar Produk
              </Typography>
              {!imagePreview ? (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{ mt: 1 }}
                >
                  Pilih Gambar
                  <input
                    ref={fileInputRef}
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
                    position: "relative",
                  }}
                >
                  <Avatar
                    src={imagePreview}
                    alt="Preview"
                    variant="rounded"
                    sx={{ width: 200, height: 200 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Ganti Gambar
                      </Button>
                      <IconButton color="error" size="small" onClick={removeImage}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Upload gambar produk (JPG, PNG, maksimal 2MB)
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Serial Number"
              value={serialNumber || ""}
              placeholder="Serial Number (read-only)"
              disabled
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Serial number dibuat otomatis dan tidak dapat diubah"
            />

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                {isLoading ? "Menyimpan..." : "Update"}
              </Button>
              <Button
                component={Link}
                to="/products"
                variant="outlined"
                disabled={isLoading}
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

export default FormEditProduct;
