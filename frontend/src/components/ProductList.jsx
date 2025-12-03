import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import ConfirmModal from "./ConfirmModal";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  QrCode as QrCodeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showCSVConfirm, setShowCSVConfirm] = useState(false);
  const [showQRDownloadConfirm, setShowQRDownloadConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();

  const getCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return;

    let filtered = allProducts.filter((product) => {
      const status = product.status;
      if (status === "dipinjam") {
        return false;
      }
      return (
        status === "tersedia" ||
        !status ||
        status === null ||
        status === undefined ||
        status === ""
      );
    });

    if (selectedKategori && selectedKategori !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.kategori &&
          product.kategori.toLowerCase() === selectedKategori.toLowerCase()
      );
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          (product.name && product.name.toLowerCase().includes(search)) ||
          (product.merek && product.merek.toLowerCase().includes(search)) ||
          (product.serialNumber &&
            product.serialNumber.toLowerCase().includes(search)) ||
          (product.kategori && product.kategori.toLowerCase().includes(search))
      );
    }

    setProducts(filtered);
  }, [allProducts, selectedKategori, searchTerm]);

  const getProducts = useCallback(async () => {
    const startTime = Date.now();
    const minLoadingTime = 800;

    try {
      setIsLoadingProducts(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      const productsWithStatus = response.data.map((product) => {
        let normalizedStatus = product.status;
        if (
          !normalizedStatus ||
          normalizedStatus === null ||
          normalizedStatus === undefined ||
          normalizedStatus === ""
        ) {
          normalizedStatus = "tersedia";
        }
        return {
          ...product,
          status: normalizedStatus,
        };
      });

      setAllProducts(productsWithStatus);

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    if (location.pathname === "/products") {
      getProducts();
    }
  }, [location.pathname, getProducts]);

  const openDeleteConfirm = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setProductToDelete(null);
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await axios.delete(`${API_BASE_URL}/products/${productToDelete.uuid}`, {
        withCredentials: true,
      });
      closeDeleteConfirm();
      getProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus produk");
      } else {
        setError("Gagal menghapus produk");
      }
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const showQRCode = async (product) => {
    try {
      setIsLoadingQR(true);
      setSelectedProduct(product);
      const response = await axios.get(
        `${API_BASE_URL}/products/${product.uuid}/qrcode`
      );
      setQrCodeData(response.data);
      setShowQRModal(true);
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat QR code");
      } else {
        setError("Gagal memuat QR code");
      }
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setQrCodeData(null);
    setSelectedProduct(null);
  };

  const downloadQRCode = () => {
    if (!qrCodeData || !qrCodeData.qrCode || !selectedProduct) return;

    const link = document.createElement("a");
    link.href = qrCodeData.qrCode;
    link.download = `QR-${selectedProduct.name}-${selectedProduct.serialNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowQRDownloadConfirm(false);
  };

  const openQRDownloadConfirm = () => {
    setShowQRDownloadConfirm(true);
  };

  const confirmDownloadCSV = () => {
    setShowCSVConfirm(false);
    downloadCSV();
  };

  const downloadCSV = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products/export/csv`, {
        responseType: "blob",
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = "products.csv";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/"/g, "");
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download CSV:", error);
      if (error.response && error.response.status === 401) {
        setError("Anda harus login terlebih dahulu");
      } else {
        setError("Gagal mengunduh file CSV. Silakan coba lagi.");
      }
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
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

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 3,
          gap: 2,
          opacity: isLoadingProducts ? 0.5 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            List of Products
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={isLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={() => setShowCSVConfirm(true)}
            disabled={isLoading || isLoadingProducts || products.length === 0}
            sx={{
              background: "linear-gradient(135deg, #48c774 0%, #3fb871 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #3fb871 0%, #2ea85a 100%)",
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
              Download CSV
            </Box>
          </Button>
          <Button
            component={Link}
            to="/products/add"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={isLoadingProducts}
            sx={{
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Add New Product
          </Button>
        </Stack>
      </Box>

      {/* Filter Section */}
      {!isLoadingProducts && allProducts.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            opacity: isLoadingProducts ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FilterListIcon fontSize="small" />
                  Filter Kategori
                </Box>
              </InputLabel>
              <Select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                label="Filter Kategori"
              >
                <MenuItem value="all">Semua Kategori</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.uuid} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari berdasarkan nama, merek, serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {(selectedKategori !== "all" || searchTerm.trim() !== "") && (
            <Alert
              severity="info"
              sx={{ mt: 2 }}
              action={
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedKategori("all");
                    setSearchTerm("");
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              Menampilkan {products.length} dari {allProducts.length} produk
              {selectedKategori !== "all" && ` (Kategori: ${selectedKategori})`}
              {searchTerm.trim() !== "" && ` (Pencarian: "${searchTerm}")`}
            </Alert>
          )}
        </Paper>
      )}

      {/* Loading State */}
      {isLoadingProducts ? (
        <Paper sx={{ p: 8 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={64} sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight="semibold" gutterBottom>
              Memuat data produk...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mohon tunggu sebentar
            </Typography>
          </Box>
        </Paper>
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
                    Foto
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Product Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Merek
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Kategori
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Serial Number
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Created By
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    QR Code
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      {allProducts.length === 0
                        ? "No products found"
                        : "Tidak ada produk yang sesuai dengan filter"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, index) => (
                  <TableRow key={product.uuid} hover>
                    <TableCell>
                      <Typography variant="body2">{index + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={product.image}
                        variant="rounded"
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: "grey.200",
                        }}
                      >
                        <InventoryIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.merek} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      {product.kategori ? (
                        <Chip label={product.kategori} size="small" color="info" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        component="code"
                        variant="caption"
                        sx={{
                          bgcolor: "grey.100",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {product.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {product.user?.name || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="warning"
                        size="small"
                        onClick={() => showQRCode(product)}
                        title="Tampilkan QR Code"
                      >
                        <QrCodeIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          component={Link}
                          to={`/products/edit/${product.uuid}`}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => openDeleteConfirm(product)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* QR Code Dialog */}
      <Dialog
        open={showQRModal}
        onClose={closeQRModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QrCodeIcon />
            QR Code Produk
          </Box>
        </DialogTitle>
        <DialogContent>
          {isLoadingQR ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Memuat QR Code...
              </Typography>
            </Box>
          ) : qrCodeData && selectedProduct ? (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Box
                  component="img"
                  src={qrCodeData.qrCode}
                  alt="QR Code"
                  sx={{
                    maxWidth: 300,
                    width: "100%",
                    height: "auto",
                    borderRadius: 2,
                    border: 2,
                    borderColor: "divider",
                  }}
                />
              </Box>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Nama Produk:</strong> {selectedProduct.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Merek:</strong> {selectedProduct.merek}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Serial Number:</strong>{" "}
                  <Box component="code" sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}>
                    {selectedProduct.serialNumber}
                  </Box>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                  <InfoIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  Scan QR code ini untuk melihat detail produk
                </Typography>
              </Paper>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          {selectedProduct && (
            <Button
              component={Link}
              to={`/products/detail/${selectedProduct.uuid}`}
              onClick={closeQRModal}
              variant="contained"
              startIcon={<InfoIcon />}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
            >
              Lihat Detail Produk
            </Button>
          )}
          {qrCodeData && (
            <Button
              variant="contained"
              color="success"
              onClick={openQRDownloadConfirm}
              startIcon={<DownloadIcon />}
            >
              Download QR
            </Button>
          )}
          <Button onClick={closeQRModal} variant="outlined">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Download Confirmation */}
      <ConfirmModal
        isOpen={showCSVConfirm}
        onClose={() => setShowCSVConfirm(false)}
        onConfirm={confirmDownloadCSV}
        title="Download CSV"
        message={`Anda akan mengunduh data produk dalam format CSV. File akan berisi ${products.length} produk yang sedang ditampilkan.`}
        confirmText="Download"
        cancelText="Batal"
        type="success"
        isLoading={isLoading}
      />

      {/* QR Download Confirmation */}
      <ConfirmModal
        isOpen={showQRDownloadConfirm}
        onClose={() => setShowQRDownloadConfirm(false)}
        onConfirm={downloadQRCode}
        title="Download QR Code"
        message={
          selectedProduct ? (
            <>
              Anda akan mengunduh QR Code untuk produk:
              <br />
              <strong>{selectedProduct.name}</strong>
              <br />
              <Typography variant="caption" color="text.secondary">
                Serial: {selectedProduct.serialNumber}
              </Typography>
            </>
          ) : (
            "Anda akan mengunduh QR Code produk ini."
          )
        }
        confirmText="Download"
        cancelText="Batal"
        type="success"
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        message={
          productToDelete ? (
            <>
              Apakah Anda yakin ingin menghapus produk ini?
              <br />
              <strong>{productToDelete.name}</strong>
              <br />
              <Typography variant="caption" color="text.secondary">
                Serial: {productToDelete.serialNumber}
              </Typography>
              <br />
              <Chip
                label="Tindakan ini tidak dapat dibatalkan!"
                color="error"
                size="small"
                sx={{ mt: 1 }}
              />
            </>
          ) : (
            "Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan!"
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

export default ProductList;
