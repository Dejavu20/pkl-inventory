import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";
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
  Avatar,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const BorrowingList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [borrowings, setBorrowings] = useState([]);
  const [allBorrowings, setAllBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowingToDelete, setBorrowingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [borrowingToReturn, setBorrowingToReturn] = useState(null);
  const [isReturning, setIsReturning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (allBorrowings.length === 0) return;

    let filtered = [...allBorrowings];

    if (filterStatus && filterStatus !== "all") {
      if (filterStatus === "active") {
        filtered = filtered.filter((borrowing) =>
          ["dipinjam", "terlambat"].includes(borrowing.status)
        );
      } else {
        filtered = filtered.filter(
          (borrowing) => borrowing.status === filterStatus
        );
      }
    }

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
  }, [allBorrowings, filterStatus, searchTerm]);

  const getBorrowings = useCallback(async () => {
    const startTime = Date.now();
    const minLoadingTime = 800;

    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/borrowings`, {
        withCredentials: true,
      });
      const newBorrowings = response.data || [];

      const validatedBorrowings = newBorrowings
        .map((borrowing, index) => {
          if (!borrowing || typeof borrowing !== "object") {
            return null;
          }

          let uuid = borrowing.uuid || borrowing.UUID || null;

          if (!uuid) {
            if (borrowing.id) {
              uuid = `temp-${borrowing.id}`;
            } else {
              uuid = `temp-${Date.now()}-${index}`;
            }
          }

          if (typeof uuid !== "string" || uuid.trim() === "") {
            if (borrowing.id) {
              uuid = `temp-${borrowing.id}`;
            } else {
              uuid = `temp-${Date.now()}-${index}`;
            }
          }

          return {
            ...borrowing,
            uuid: uuid,
          };
        })
        .filter((borrowing) => borrowing !== null);

      setAllBorrowings(validatedBorrowings);

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
  }, []);

  useEffect(() => {
    if (location.pathname === "/borrowings") {
      getBorrowings();
    }
  }, [location.pathname, getBorrowings]);

  // Real-time update untuk status terlambat (check setiap 10 detik)
  useEffect(() => {
    if (location.pathname !== "/borrowings") return;

    const checkOverdueStatus = () => {
      // Update status terlambat di frontend berdasarkan expectedReturnDate
      setAllBorrowings((prevBorrowings) => {
        const now = new Date();
        const updated = prevBorrowings.map((borrowing) => {
          if (
            borrowing.status === "dipinjam" &&
            borrowing.expectedReturnDate
          ) {
            const expectedDate = new Date(borrowing.expectedReturnDate);
            if (expectedDate < now) {
              return { ...borrowing, status: "terlambat" };
            }
          }
          return borrowing;
        });

        // Update filtered borrowings juga
        let filtered = [...updated];
        if (filterStatus && filterStatus !== "all") {
          if (filterStatus === "active") {
            filtered = filtered.filter((borrowing) =>
              ["dipinjam", "terlambat"].includes(borrowing.status)
            );
          } else {
            filtered = filtered.filter(
              (borrowing) => borrowing.status === filterStatus
            );
          }
        }

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
        return updated;
      });
    };

    // Check immediately
    checkOverdueStatus();

    // Check setiap 10 detik untuk update realtime
    const overdueInterval = setInterval(checkOverdueStatus, 10000);

    return () => clearInterval(overdueInterval);
  }, [location.pathname, filterStatus, searchTerm]);

  // Auto-refresh data dari server setiap 30 detik
  useEffect(() => {
    if (location.pathname !== "/borrowings") return;

    const refreshInterval = setInterval(() => {
      getBorrowings();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [location.pathname, getBorrowings]);

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

  const canReturnBorrowing = (borrowing) => {
    if (!user) return false;
    if (!borrowing) return false;

    const isAdmin = user.role && user.role.toLowerCase() === "admin";
    if (isAdmin) return true;

    const isBorrower =
      borrowing.borrowerId && user.id && borrowing.borrowerId === user.id;

    return isBorrower;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDeleteConfirm = (borrowing) => {
    setBorrowingToDelete(borrowing);
  };

  const closeDeleteConfirm = () => {
    setBorrowingToDelete(null);
  };

  const confirmDelete = async () => {
    if (!borrowingToDelete) return;

    try {
      setIsDeleting(true);
      setError("");
      setSuccess("");
      await axios.delete(`${API_BASE_URL}/borrowings/${borrowingToDelete.uuid}`);
      setSuccess("Peminjaman berhasil dihapus!");
      closeDeleteConfirm();
      getBorrowings();
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus peminjaman");
      } else {
        setError("Gagal menghapus peminjaman");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const openReturnConfirm = async (borrowing) => {
    if (!borrowing) {
      setError("Data peminjaman tidak valid");
      return;
    }

    if (!borrowing.uuid || borrowing.uuid.startsWith("temp-")) {
      if (!borrowing.id) {
        setError("ID peminjaman tidak ditemukan. Silakan refresh halaman dan coba lagi.");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/borrowings`, {
          withCredentials: true,
        });
        const allBorrowings = response.data || [];
        const foundBorrowing = allBorrowings.find((b) => b.id === borrowing.id);

        if (
          foundBorrowing &&
          foundBorrowing.uuid &&
          !foundBorrowing.uuid.startsWith("temp-")
        ) {
          borrowing.uuid = foundBorrowing.uuid;
        }
      } catch (error) {
        console.error("Error fetching UUID:", error);
      }
    }

    setBorrowingToReturn(borrowing);
  };

  const closeReturnConfirm = () => {
    setBorrowingToReturn(null);
  };

  const confirmReturn = async () => {
    if (!borrowingToReturn) {
      setError("Data peminjaman tidak ditemukan");
      return;
    }

    let uuid = borrowingToReturn.uuid;
    const borrowingId = borrowingToReturn.id;

    if (!borrowingId) {
      setError("ID peminjaman tidak ditemukan. Silakan refresh halaman dan coba lagi.");
      return;
    }

    if (!uuid || uuid.startsWith("temp-")) {
      try {
        const response = await axios.get(`${API_BASE_URL}/borrowings`, {
          withCredentials: true,
        });
        const allBorrowings = response.data || [];
        const foundBorrowing = allBorrowings.find((b) => b.id === borrowingId);

        if (
          foundBorrowing &&
          foundBorrowing.uuid &&
          !foundBorrowing.uuid.startsWith("temp-")
        ) {
          uuid = foundBorrowing.uuid;
        } else {
          uuid = `temp-${borrowingId}`;
        }
      } catch (error) {
        uuid = `temp-${borrowingId}`;
      }
    }

    if (typeof uuid !== "string" || uuid.trim() === "") {
      uuid = `temp-${borrowingId}`;
    }

    try {
      setIsReturning(true);
      setError("");
      setSuccess("");

      const response = await axios.patch(
        `${API_BASE_URL}/borrowings/${uuid}/return`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data) {
        setSuccess(response.data.msg || "Barang berhasil dikembalikan!");
        closeReturnConfirm();

        setTimeout(async () => {
          await getBorrowings();
        }, 500);

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError("Respon tidak valid dari server");
      }
    } catch (error) {
      let errorMessage = "Gagal mengembalikan barang";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 404) {
          errorMessage = data?.msg || "Data peminjaman tidak ditemukan";
        } else if (status === 400) {
          errorMessage = data?.msg || "Data tidak valid";
        } else if (status === 500) {
          errorMessage = data?.msg || "Terjadi kesalahan pada server";
        } else {
          errorMessage = data?.msg || data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Tidak ada respons dari server. Periksa koneksi internet Anda.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);

      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setIsReturning(false);
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
          opacity: isLoading ? 0.5 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Manajemen Peminjaman
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daftar semua peminjaman barang
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/borrowings/add"
          variant="contained"
          startIcon={<AddIcon />}
          disabled={isLoading}
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Tambah Peminjaman
        </Button>
      </Box>

      {/* Filter Section */}
      {!isLoading && allBorrowings.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FilterListIcon fontSize="small" />
                  Filter Status
                </Box>
              </InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter Status"
              >
                <MenuItem value="active">Sedang Dipinjam (Aktif)</MenuItem>
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="dipinjam">Dipinjam</MenuItem>
                <MenuItem value="dikembalikan">Dikembalikan</MenuItem>
                <MenuItem value="terlambat">Terlambat</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari berdasarkan produk, peminjam..."
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
          {(filterStatus !== "active" || searchTerm.trim() !== "") && (
            <Alert
              severity="info"
              sx={{ mt: 2 }}
              action={
                <IconButton
                  size="small"
                  onClick={() => {
                    setFilterStatus("active");
                    setSearchTerm("");
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              Menampilkan {borrowings.length} dari {allBorrowings.length} peminjaman
              {filterStatus !== "active" &&
                filterStatus !== "all" &&
                ` (Status: ${filterStatus})`}
              {filterStatus === "active" && ` (Hanya yang sedang dipinjam)`}
              {filterStatus === "all" && ` (Semua status)`}
              {searchTerm.trim() !== "" && ` (Pencarian: "${searchTerm}")`}
            </Alert>
          )}
        </Paper>
      )}

      {/* Info Alert */}
      {!isLoading && (
        <Alert
          severity="info"
          icon={<WarningIcon />}
          sx={{
            mb: 3,
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s",
            backgroundColor: "grey.50",
            border: "1px solid",
            borderColor: "grey.200",
            "& .MuiAlert-icon": {
              color: "text.secondary",
            },
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Barang yang sedang dipinjam
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Halaman ini menampilkan semua barang yang sedang dipinjam. Barang yang sudah dikembalikan akan hilang dari daftar ini dan kembali muncul di menu{" "}
            <Link
              to="/products"
              style={{
                color: "primary.main",
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              Barang
            </Link>
          </Typography>
        </Alert>
      )}

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
              Memuat data peminjaman...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mohon tunggu sebentar
            </Typography>
          </Box>
        </Paper>
      ) : borrowings.length === 0 ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            Tidak ada peminjaman yang ditemukan.
          </Typography>
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
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Aksi
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {borrowings.map((borrowing, index) => (
                <TableRow key={borrowing.uuid} hover>
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
                        <Box
                          sx={{
                            display: { xs: "block", md: "none" },
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {borrowing.product?.merek || "-"} •{" "}
                            {borrowing.product?.serialNumber || "-"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: { xs: "none", md: "flex" },
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            label={borrowing.product?.merek || "-"}
                            size="small"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
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
                            {borrowing.product?.serialNumber || "-"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="body2" fontWeight="medium">
                      {borrowing.namaPeminjam || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(borrowing.borrowDate)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(borrowing.expectedReturnDate)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {borrowing.actualReturnDate
                        ? formatDate(borrowing.actualReturnDate)
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusBadge(borrowing.status)}</TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      flexWrap="wrap"
                    >
                      {borrowing.status !== "dikembalikan" &&
                        canReturnBorrowing(borrowing) && (
                          <IconButton
                            size="small"
                            onClick={() => openReturnConfirm(borrowing)}
                            title="Kembalikan Barang"
                            sx={{
                              backgroundColor: "grey.100",
                              color: "text.secondary",
                              "&:hover": {
                                backgroundColor: "success.main",
                                color: "white",
                              },
                            }}
                          >
                            <UndoIcon fontSize="small" />
                          </IconButton>
                        )}
                      {borrowing.status !== "dikembalikan" &&
                        !canReturnBorrowing(borrowing) && (
                          <IconButton
                            size="small"
                            disabled
                            title="Hanya peminjam atau admin yang dapat mengembalikan barang"
                            sx={{
                              opacity: 0.4,
                              backgroundColor: "grey.100",
                            }}
                          >
                            <LockIcon fontSize="small" />
                          </IconButton>
                        )}
                      <IconButton
                        component={Link}
                        to={`/borrowings/edit/${borrowing.uuid}`}
                        size="small"
                        title="Edit Peminjaman"
                        sx={{
                          backgroundColor: "grey.100",
                          color: "text.secondary",
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteConfirm(borrowing)}
                        title="Hapus Peminjaman"
                        sx={{
                          backgroundColor: "grey.100",
                          color: "text.secondary",
                          "&:hover": {
                            backgroundColor: "error.main",
                            color: "white",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!borrowingToDelete}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="Hapus Peminjaman"
        message={
          borrowingToDelete ? (
            <>
              Apakah Anda yakin ingin menghapus peminjaman ini?
              <br />
              <Box
                sx={{
                  mt: 2,
                  mb: 2,
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" gutterBottom>
                  <strong>Produk:</strong> {borrowingToDelete.product?.name || "-"}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Peminjam:</strong> {borrowingToDelete.namaPeminjam || "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(borrowingToDelete.status)}
                </Typography>
              </Box>
              <Chip
                label="Tindakan ini tidak dapat dibatalkan!"
                color="error"
                size="small"
              />
            </>
          ) : (
            "Apakah Anda yakin ingin menghapus peminjaman ini? Tindakan ini tidak dapat dibatalkan!"
          )
        }
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Return Confirmation Modal */}
      <ConfirmModal
        isOpen={!!borrowingToReturn}
        onClose={closeReturnConfirm}
        onConfirm={confirmReturn}
        title="Konfirmasi Pengembalian"
        message={
          borrowingToReturn ? (
            <>
              Apakah Anda yakin ingin mengembalikan barang ini?
              <br />
              {(!borrowingToReturn.uuid ||
                borrowingToReturn.uuid.startsWith("temp-")) && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 2,
                    mb: 2,
                    backgroundColor: "grey.50",
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    <strong>Catatan:</strong> UUID akan dicari otomatis dari database saat proses pengembalian.
                  </Typography>
                </Alert>
              )}
              <Box
                sx={{
                  mt: 2,
                  mb: 2,
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" gutterBottom>
                  <strong>Produk:</strong> {borrowingToReturn.product?.name || "-"}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Peminjam:</strong> {borrowingToReturn.namaPeminjam || "-"}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Tanggal Pinjam:</strong>{" "}
                  {formatDate(borrowingToReturn.borrowDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>Tanggal Kembali Diharapkan:</strong>{" "}
                  {formatDate(borrowingToReturn.expectedReturnDate)}
                </Typography>
              </Box>
            </>
          ) : (
            "Apakah Anda yakin ingin mengembalikan barang ini?"
          )
        }
        confirmText="Kembalikan"
        cancelText="Batal"
        type="success"
        isLoading={isReturning}
      />
    </Box>
  );
};

export default BorrowingList;
