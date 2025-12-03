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
  InputAdornment,
  CircularProgress,
  Container,
  Stack,
  Grid,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Note as NoteIcon,
} from "@mui/icons-material";

const FormAddBorrowing = () => {
  const [productId, setProductId] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [borrowTime, setBorrowTime] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [expectedReturnTime, setExpectedReturnTime] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      const availableProducts = response.data.filter((product) => {
        const status = product.status;
        return (
          status === "tersedia" ||
          !status ||
          status === null ||
          status === undefined ||
          status === ""
        );
      });
      setProducts(availableProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setMsg("Gagal memuat daftar produk");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    setBorrowDate(formatDate(today));
    setBorrowTime(formatTime(today));
    setExpectedReturnDate(formatDate(tomorrow));
    setExpectedReturnTime("17:00");
  }, []);

  const saveBorrowing = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    if (!productId || !borrowerName || !borrowDate || !expectedReturnDate) {
      setMsg("Semua field wajib harus diisi");
      setIsLoading(false);
      return;
    }

    if (borrowerName.trim().length < 3) {
      setMsg("Nama peminjam minimal 3 karakter");
      setIsLoading(false);
      return;
    }

    if (borrowerName.trim().length > 255) {
      setMsg("Nama peminjam maksimal 255 karakter");
      setIsLoading(false);
      return;
    }

    const borrow = new Date(borrowDate);
    const expectedReturn = new Date(expectedReturnDate);

    if (expectedReturn <= borrow) {
      setMsg("Tanggal kembali harus setelah tanggal pinjam");
      setIsLoading(false);
      return;
    }

    const borrowDateTime = borrowTime
      ? `${borrowDate}T${borrowTime}:00`
      : `${borrowDate}T00:00:00`;
    const expectedReturnDateTime = expectedReturnTime
      ? `${expectedReturnDate}T${expectedReturnTime}:00`
      : `${expectedReturnDate}T00:00:00`;

    try {
      await axios.post(
        `${API_BASE_URL}/borrowings`,
        {
          productId: productId.trim(),
          namaPeminjam: borrowerName.trim(),
          borrowDate: borrowDateTime,
          expectedReturnDate: expectedReturnDateTime,
          notes: notes.trim() || null,
        },
        {
          withCredentials: true,
        }
      );
      navigate("/borrowings");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal menambahkan peminjaman");
      } else {
        setMsg("Gagal menambahkan peminjaman");
      }
    } finally {
      setIsLoading(false);
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
            Tambah Peminjaman Baru
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Buat peminjaman barang baru
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/borrowings"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Kembali
        </Button>
      </Box>

      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={saveBorrowing}>
            {msg && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMsg("")}>
                {msg}
              </Alert>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Produk</InputLabel>
              <Select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                label="Produk"
                required
                disabled={isLoadingProducts}
                startAdornment={
                  <InputAdornment position="start">
                    <InventoryIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  {isLoadingProducts ? "Memuat produk..." : "Pilih Produk"}
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.uuid} value={product.uuid}>
                    {product.name} - {product.merek} ({product.serialNumber})
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Pilih produk yang akan dipinjam
              </Typography>
            </FormControl>

            <TextField
              fullWidth
              label="Nama Peminjam"
              required
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="Masukkan nama peminjam"
              margin="normal"
              inputProps={{ minLength: 3, maxLength: 255 }}
              helperText={
                borrowerName && borrowerName.length > 0 && borrowerName.length < 3
                  ? `Nama peminjam minimal 3 karakter (tersisa ${3 - borrowerName.length} karakter)`
                  : borrowerName && borrowerName.length > 255
                  ? `Nama peminjam maksimal 255 karakter (kelebihan ${borrowerName.length - 255} karakter)`
                  : "Masukkan nama peminjam (minimal 3 karakter, maksimal 255 karakter)"
              }
              error={
                borrowerName
                  ? borrowerName.length < 3 || borrowerName.length > 255
                  : false
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tanggal Pinjam"
                  type="date"
                  required
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Tanggal kapan barang dipinjam"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jam Pengambilan"
                  type="time"
                  required
                  value={borrowTime}
                  onChange={(e) => setBorrowTime(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Jam kapan barang diambil"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tanggal Kembali (Diharapkan)"
                  type="date"
                  required
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: borrowDate }}
                  error={
                    borrowDate &&
                    expectedReturnDate &&
                    new Date(expectedReturnDate) <= new Date(borrowDate)
                  }
                  helperText={
                    borrowDate &&
                    expectedReturnDate &&
                    new Date(expectedReturnDate) <= new Date(borrowDate)
                      ? "Tanggal kembali harus setelah tanggal pinjam"
                      : "Tanggal kapan barang diharapkan dikembalikan"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jam Pengembalian (Diharapkan)"
                  type="time"
                  required
                  value={expectedReturnTime}
                  onChange={(e) => setExpectedReturnTime(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Jam kapan barang diharapkan dikembalikan"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Catatan"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan (opsional)"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                    <NoteIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Tambahkan catatan tambahan tentang peminjaman ini (opsional)"
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
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                component={Link}
                to="/borrowings"
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

export default FormAddBorrowing;
