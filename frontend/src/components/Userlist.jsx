import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";
import ConfirmModal from "./ConfirmModal";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Alert,
  Chip,
  IconButton,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const Userlist = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat data user");
      } else {
        setError("Gagal memuat data user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`);
      setDeleteConfirm(null);
      getUsers();
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus user");
      } else {
        setError("Gagal menghapus user");
      }
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
            Manajemen User
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daftar semua user dalam sistem
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/users/add"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)",
            },
          }}
        >
          Tambah User
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteUser(deleteConfirm?.userId)}
        title="Konfirmasi Hapus User"
        message={
          <Box sx={{ mt: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                User yang akan dihapus:
              </Typography>
              <Typography variant="body2">
                <strong>{deleteConfirm?.userName}</strong>
              </Typography>
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
                <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. User akan
                dihapus secara permanen.
              </Typography>
            </Alert>
          </Box>
        }
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info">Tidak ada user yang ditemukan.</Alert>
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
                    Nama
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Email
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Role
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
              {users.map((user, index) => (
                <TableRow
                  key={user.uuid}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2">{index + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {user.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: { xs: "block", md: "none" } }}
                    >
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="body2" color="text.secondary">
                      {user.email || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role || "User"}
                      color={user.role?.toLowerCase() === "admin" ? "error" : "primary"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        component={Link}
                        to={`/users/edit/${user.uuid}`}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          setDeleteConfirm({ userId: user.uuid, userName: user.name })
                        }
                        color="error"
                        size="small"
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
    </Box>
  );
};

export default Userlist;
