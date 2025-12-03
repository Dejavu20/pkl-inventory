import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  AccountCircle,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  History as HistoryIcon,
  FilterList,
  Search,
  Close,
} from "@mui/icons-material";

const Welcome = () => {
  const { user } = useSelector((state) => state.auth);
  const [history, setHistory] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalAdmins: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const getHistory = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await axios.get(`${API_BASE_URL}/products/history`);
        setAllHistory(response.data);
        setHistory(response.data);
      } catch (error) {
        if (error.response) {
          setError(error.response.data.msg || "Gagal memuat history");
        } else {
          setError("Gagal memuat history");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const getStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await axios.get(`${API_BASE_URL}/products/stats`);
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    getHistory();
    getStats();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...allHistory];

    if (filterKategori && filterKategori !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.kategori &&
          item.kategori.toLowerCase() === filterKategori.toLowerCase()
      );
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(search) ||
          item.merek.toLowerCase().includes(search) ||
          (item.serialNumber &&
            item.serialNumber.toLowerCase().includes(search)) ||
          (item.kategori && item.kategori.toLowerCase().includes(search)) ||
          (item.createdBy && item.createdBy.toLowerCase().includes(search))
      );
    }

    setHistory(filtered);
  }, [allHistory, filterKategori, searchTerm]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getCategories = () => {
    const categories = new Set();
    allHistory.forEach((item) => {
      if (item.kategori && item.kategori.trim() !== "") {
        categories.add(item.kategori);
      }
    });
    return Array.from(categories).sort();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Welcome Card */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountCircle sx={{ fontSize: 40, color: "grey.600" }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Selamat Datang, {user && user.name}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role:{" "}
              <Chip
                label={user && user.role}
                size="small"
                sx={{ ml: 1 }}
                color="primary"
              />
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ textAlign: "center" }}>
            <CardContent>
              {isLoadingStats ? (
                <CircularProgress />
              ) : (
                <>
                  <InventoryIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {stats.totalProducts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Barang
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ textAlign: "center" }}>
            <CardContent>
              {isLoadingStats ? (
                <CircularProgress />
              ) : (
                <>
                  <PeopleIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total User
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ textAlign: "center" }}>
            <CardContent>
              {isLoadingStats ? (
                <CircularProgress />
              ) : (
                <>
                  <AdminIcon sx={{ fontSize: 48, color: "error.main", mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {stats.totalAdmins}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Admin
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* History Input Barang */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <HistoryIcon color="action" />
            <Typography variant="h6" fontWeight="bold">
              History Input Barang
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Riwayat input barang dalam sistem
          </Typography>
        </Box>

        {/* Filter Section */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <FilterList fontSize="small" />
                    Filter Kategori
                  </Box>
                </InputLabel>
                <Select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  label="Filter Kategori"
                >
                  <MenuItem value="all">Semua Kategori</MenuItem>
                  {getCategories().map((kategori, index) => (
                    <MenuItem key={index} value={kategori}>
                      {kategori}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Cari berdasarkan nama, merek, serial, kategori, atau pembuat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {(filterKategori !== "all" || searchTerm.trim() !== "") && (
            <Alert
              severity="info"
              sx={{ mt: 2 }}
              action={
                <IconButton
                  size="small"
                  onClick={() => {
                    setFilterKategori("all");
                    setSearchTerm("");
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              }
            >
              Menampilkan {history.length} dari {allHistory.length} history
              {filterKategori !== "all" && ` (Kategori: ${filterKategori})`}
              {searchTerm.trim() !== "" && ` (Pencarian: "${searchTerm}")`}
            </Alert>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Memuat history...
            </Typography>
          </Box>
        ) : history.length === 0 ? (
          <Alert severity="info">Tidak ada history input barang.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      No
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Nama Produk
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Merek
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Kategori
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Serial Number
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Dibuat Oleh
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Waktu Input
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.slice(0, 10).map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2">{index + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.productName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: { xs: "block", md: "none" } }}
                      >
                        {item.merek} • {item.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      <Chip label={item.merek} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {item.kategori ? (
                        <Chip label={item.kategori} size="small" color="primary" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      <Typography
                        variant="caption"
                        component="code"
                        sx={{
                          bgcolor: "grey.100",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {item.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.createdBy}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {history.length > 10 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Menampilkan 10 dari {history.length} history terbaru.{" "}
                <Link
                  to="/products"
                  style={{ textDecoration: "none", fontWeight: "bold" }}
                >
                  Lihat semua produk →
                </Link>
              </Alert>
            )}
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Welcome;
