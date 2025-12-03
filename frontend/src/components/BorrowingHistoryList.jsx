import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import CSVDownloadModal from "./CSVDownloadModal";
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
  Avatar,
  Stack,
  Grid,
} from "@mui/material";
import {
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

const BorrowingHistoryList = () => {
  const dispatch = useDispatch();
  const [borrowings, setBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCSVConfirm, setShowCSVConfirm] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setStartDate(formatDate(thirtyDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  const getBorrowings = useCallback(async () => {
    const startTime = Date.now();
    const minLoadingTime = 800;

    try {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }

      const response = await axios.get(
        `${API_BASE_URL}/borrowings?${params.toString()}`,
        {
          withCredentials: true,
        }
      );

      const newBorrowings = response.data || [];

      let filtered = [...newBorrowings];
      if (searchTerm && searchTerm.trim() !== "") {
        const search = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(
          (borrowing) =>
            (borrowing.product?.name?.toLowerCase().includes(search)) ||
            (borrowing.product?.merek?.toLowerCase().includes(search)) ||
            (borrowing.product?.serialNumber?.toLowerCase().includes(search)) ||
            (borrowing.namaPeminjam?.toLowerCase().includes(search))
        );
      }

      setBorrowings(filtered);

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat data peminjaman");
      } else {
        setError("Gagal memuat data peminjaman");
      }

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, filterStatus, searchTerm]);

  useEffect(() => {
    if (startDate && endDate) {
      getBorrowings();
    }
  }, [startDate, endDate, filterStatus, getBorrowings]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      dipinjam: { color: "info", text: "Dipinjam" },
      dikembalikan: { color: "success", text: "Dikembalikan" },
      terlambat: { color: "error", text: "Terlambat" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return (
      <Chip
        label={config.text}
        size="small"
        color={config.color}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFilter = () => {
    getBorrowings();
  };

  const handleReset = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setStartDate(formatDate(thirtyDaysAgo));
    setEndDate(formatDate(today));
    setFilterStatus("all");
    setSearchTerm("");
  };

  const confirmDownloadCSV = (csvFilters) => {
    setShowCSVConfirm(false);
    downloadCSV(csvFilters);
  };

  const downloadCSV = async (csvFilters = null) => {
    try {
      setIsDownloadingCSV(true);
      setError("");

      const exportStartDate = csvFilters?.startDate || startDate;
      const exportEndDate = csvFilters?.endDate || endDate;
      const exportStatus = csvFilters?.status || filterStatus;

      const params = new URLSearchParams();
      if (exportStatus && exportStatus !== "all") {
        params.append("status", exportStatus);
      }
      if (exportStartDate) {
        params.append("startDate", exportStartDate);
      }
      if (exportEndDate) {
        params.append("endDate", exportEndDate);
      }

      const response = await axios.get(
        `${API_BASE_URL}/borrowings/export/csv?${params.toString()}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = "borrowings.csv";
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
      setIsDownloadingCSV(false);
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

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 3,
          gap: 2,
          opacity: isLoading ? 0.5 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            History Peminjaman
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Riwayat semua peminjaman barang
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={
              isDownloadingCSV ? (
                <CircularProgress size={20} />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={() => setShowCSVConfirm(true)}
            disabled={isDownloadingCSV || isLoading || borrowings.length === 0}
            sx={{
              backgroundColor: "success.main",
              "&:hover": {
                backgroundColor: "success.dark",
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
              Download CSV
            </Box>
          </Button>
          <Button
            component={Link}
            to="/borrowings"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            disabled={isLoading}
          >
            Kembali ke Peminjaman
          </Button>
        </Stack>
      </Box>

      {/* Filter Section */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Filter Pencarian
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Tanggal Mulai"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Tanggal Akhir"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="dipinjam">Dipinjam</MenuItem>
                <MenuItem value="dikembalikan">Dikembalikan</MenuItem>
                <MenuItem value="terlambat">Terlambat</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Cari"
              placeholder="Cari produk, merek, atau peminjam..."
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
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                disabled={isLoading}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Terapkan Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {isLoading ? (
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
              Memuat history peminjaman...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mohon tunggu sebentar
            </Typography>
          </Box>
        </Paper>
      ) : borrowings.length === 0 ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            Tidak ada data peminjaman yang ditemukan untuk periode yang dipilih.
          </Typography>
        </Paper>
      ) : (
        <>
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
                      Produk
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Peminjam
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Tanggal Pinjam
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Tgl. Kembali (Diharapkan)
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Tgl. Kembali (Aktual)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Status
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {borrowings.map((borrowing, index) => (
                  <TableRow key={borrowing.uuid || borrowing.id} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          src={borrowing.product?.image}
                          variant="rounded"
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "grey.200",
                          }}
                        >
                          <InventoryIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {borrowing.product?.name || "-"}
                          </Typography>
                          {borrowing.product?.merek && (
                            <Typography variant="caption" color="text.secondary">
                              {borrowing.product.merek}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      <Typography variant="body2" fontWeight="medium">
                        {borrowing.namaPeminjam || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDateTime(borrowing.borrowDate)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      <Typography variant="caption" color="text.secondary">
                        {borrowing.expectedReturnDate
                          ? formatDateTime(borrowing.expectedReturnDate)
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      <Typography variant="caption" color="text.secondary">
                        {borrowing.returnDate
                          ? formatDateTime(borrowing.returnDate)
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusBadge(borrowing.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!isLoading && borrowings.length > 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Menampilkan {borrowings.length} peminjaman untuk periode{" "}
                {formatDate(startDate)} - {formatDate(endDate)}
              </Typography>
            </Alert>
          )}
        </>
      )}

      {/* CSV Download Modal */}
      <CSVDownloadModal
        isOpen={showCSVConfirm}
        onClose={() => setShowCSVConfirm(false)}
        onConfirm={confirmDownloadCSV}
        title="Download CSV History Peminjaman"
        defaultStartDate={startDate}
        defaultEndDate={endDate}
        defaultStatus={filterStatus}
        isLoading={isDownloadingCSV}
        currentDataCount={borrowings.length}
      />
    </Box>
  );
};

export default BorrowingHistoryList;
