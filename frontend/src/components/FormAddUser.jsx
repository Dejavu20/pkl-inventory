import React, { useState } from "react";
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
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const FormAddUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("User");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const saveUser = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    if (!name || !email || !password || !confPassword || !role) {
      setMsg("Semua field harus diisi");
      setIsLoading(false);
      return;
    }

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

    try {
      await axios.post(`${API_BASE_URL}/users`, {
        name: name,
        email: email,
        password: password,
        confPassword: confPassword,
        role: role,
      });
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal menambahkan user");
      } else {
        setMsg("Gagal menambahkan user");
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
            Tambah User Baru
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Buat user baru untuk sistem
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
          <form onSubmit={saveUser}>
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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              margin="normal"
              inputProps={{ minLength: 6 }}
              helperText="Password minimal 6 karakter"
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
              required
              value={confPassword}
              onChange={(e) => setConfPassword(e.target.value)}
              placeholder="Ulangi password"
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
                {isLoading ? "Menyimpan..." : "Simpan"}
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

export default FormAddUser;
