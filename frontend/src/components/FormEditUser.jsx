import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const FormEditUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("User");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getUserById = async () => {
      try {
        setIsFetching(true);
        setMsg("");
        const response = await axios.get(`${API_BASE_URL}/users/${id}`);
        setName(response.data.name || "");
        setEmail(response.data.email || "");
        setRole(response.data.role || "User");
      } catch (error) {
        if (error.response) {
          setMsg(error.response.data.msg || "Gagal memuat data user");
        } else {
          setMsg("Gagal memuat data user");
        }
      } finally {
        setIsFetching(false);
      }
    };
    getUserById();
  }, [id]);

  const updateUser = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    if (!name || !email || !role) {
      setMsg("Nama, Email, dan Role harus diisi");
      setIsLoading(false);
      return;
    }

    if (password || confPassword) {
      if (password !== confPassword) {
        setMsg("Password dan Konfirmasi Password tidak cocok");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setMsg("Password minimal 6 karakter");
        setIsLoading(false);
        return;
      }
    }

    try {
      await axios.patch(`${API_BASE_URL}/users/${id}`, {
        name: name,
        email: email,
        password: password || "",
        confPassword: confPassword || "",
        role: role,
      });
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal mengupdate user");
      } else {
        setMsg("Gagal mengupdate user");
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
          Memuat data user...
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
            Edit User
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update informasi user
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/users"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Kembali
        </Button>
      </Box>

      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={updateUser}>
            {msg && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMsg("")}>
                {msg}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nama"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah password"
              margin="normal"
              inputProps={{ minLength: 6 }}
              helperText="Kosongkan jika tidak ingin mengubah password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Konfirmasi Password"
              type="password"
              value={confPassword}
              onChange={(e) => setConfPassword(e.target.value)}
              placeholder="Ulangi password baru"
              margin="normal"
              inputProps={{ minLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Role"
                required
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Admin memiliki akses penuh untuk mengelola user
              </Typography>
            </FormControl>

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
                to="/users"
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

export default FormEditUser;
