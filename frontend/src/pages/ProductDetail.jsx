import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  QrCode as QrCodeIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@mui/icons-material";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProductDetail = async () => {
      try {
        setIsLoading(true);
        setError("");
        // Public endpoint untuk melihat detail produk dari QR code
        // Tidak perlu credentials karena endpoint public
        const response = await axios.get(`${API_BASE_URL}/products/${id}/detail`, {
          withCredentials: false
        });
        setProduct(response.data);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            setError("Produk tidak ditemukan");
          } else {
            setError(error.response.data.msg || "Gagal memuat data produk");
          }
        } else {
          setError("Gagal memuat data produk");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      getProductDetail();
    }
  }, [id]);

  const InfoCard = ({ icon, label, value, iconColor, children }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: iconColor,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: "0.75rem",
              }}
            >
              {label}
            </Typography>
            {children || (
              <Typography
                variant="h6"
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {value}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        {isLoading ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Memuat informasi produk...
            </Typography>
          </Paper>
        ) : error ? (
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: "error.light",
                color: "error.dark",
                border: "1px solid",
                borderColor: "error.main",
                "& .MuiAlert-icon": {
                  color: "error.main",
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Error
              </Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Kembali ke Home
              </Button>
            </Box>
          </Paper>
        ) : product ? (
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              backgroundColor: "background.paper",
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              {product.image ? (
                <Box sx={{ mb: 3 }}>
                  <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      maxWidth: 200,
                      maxHeight: 200,
                      borderRadius: 2,
                      border: "3px solid",
                      borderColor: "divider",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ) : (
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 50 }} />
                </Avatar>
              )}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                Informasi Produk
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <QrCodeIcon sx={{ fontSize: 18 }} />
                Detail produk dari QR Code Scan
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Product Information */}
            <Box>
              <InfoCard
                icon={<InventoryIcon />}
                label="Nama Produk"
                value={product.name}
                iconColor="#667eea"
              />

              <InfoCard
                icon={<BusinessIcon />}
                label="Merek"
                iconColor="#48c6ef"
              >
                <Chip
                  label={product.merek}
                  sx={{
                    mt: 0.5,
                    borderRadius: 1.5,
                    backgroundColor: "#e0f2fe",
                    color: "#0369a1",
                    fontWeight: 500,
                  }}
                />
              </InfoCard>

              <InfoCard
                icon={<QrCodeIcon />}
                label="Serial Number"
                iconColor="#10b981"
              >
                <Box
                  component="code"
                  sx={{
                    display: "inline-block",
                    mt: 0.5,
                    px: 2,
                    py: 1,
                    borderRadius: 1.5,
                    backgroundColor: "grey.50",
                    border: "1px solid",
                    borderColor: "divider",
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: "1rem",
                    fontFamily: "monospace",
                  }}
                >
                  {product.serialNumber}
                </Box>
              </InfoCard>

              {product.kategori && (
                <InfoCard
                  icon={<CategoryIcon />}
                  label="Kategori"
                  iconColor="#8b5cf6"
                >
                  <Chip
                    label={product.kategori}
                    sx={{
                      mt: 0.5,
                      borderRadius: 1.5,
                      backgroundColor: "#f3e8ff",
                      color: "#7c3aed",
                      fontWeight: 500,
                    }}
                  />
                </InfoCard>
              )}

              <InfoCard
                icon={
                  product.status === "tersedia" ? (
                    <CheckCircleIcon />
                  ) : (
                    <ErrorIcon />
                  )
                }
                label="Status"
                iconColor={
                  product.status === "tersedia" ? "#10b981" : "#ef4444"
                }
              >
                <Chip
                  label={product.status === "tersedia" ? "Tersedia" : "Dipinjam"}
                  sx={{
                    mt: 0.5,
                    borderRadius: 1.5,
                    backgroundColor:
                      product.status === "tersedia"
                        ? "#d1fae5"
                        : "#fee2e2",
                    color:
                      product.status === "tersedia"
                        ? "#065f46"
                        : "#991b1b",
                    fontWeight: 500,
                  }}
                />
              </InfoCard>

              {product.activeBorrowing && (
                <Card
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    border: "1px solid",
                    borderColor: "warning.main",
                    backgroundColor: "warning.light",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: "warning.main",
                        }}
                      >
                        <ErrorIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "warning.dark",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontSize: "0.75rem",
                          }}
                        >
                          Status Peminjaman
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={
                              product.activeBorrowing.status === "terlambat"
                                ? "Terlambat"
                                : "Sedang Dipinjam"
                            }
                            sx={{
                              borderRadius: 1.5,
                              backgroundColor:
                                product.activeBorrowing.status === "terlambat"
                                  ? "error.light"
                                  : "warning.light",
                              color:
                                product.activeBorrowing.status === "terlambat"
                                  ? "error.dark"
                                  : "warning.dark",
                              fontWeight: 500,
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "warning.dark", mb: 0.5 }}
                          >
                            <strong>Peminjam:</strong>{" "}
                            {product.activeBorrowing.namaPeminjam}
                          </Typography>
                          {product.activeBorrowing.borrowDate && (
                            <Typography
                              variant="body2"
                              sx={{ color: "warning.dark", mb: 0.5 }}
                            >
                              <strong>Tanggal Pinjam:</strong>{" "}
                              {new Date(
                                product.activeBorrowing.borrowDate
                              ).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                          )}
                          {product.activeBorrowing.expectedReturnDate && (
                            <Typography
                              variant="body2"
                              sx={{ color: "warning.dark" }}
                            >
                              <strong>Tanggal Kembali (Diharapkan):</strong>{" "}
                              {new Date(
                                product.activeBorrowing.expectedReturnDate
                              ).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {product.user && (
                <InfoCard
                  icon={<PersonIcon />}
                  label="Dibuat Oleh"
                  value={product.user.name}
                  iconColor="#6366f1"
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      mt: 0.5,
                    }}
                  >
                    {product.user.name}
                  </Typography>
                  {product.user.email && (
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.5 }}
                    >
                      {product.user.email}
                    </Typography>
                  )}
                </InfoCard>
              )}

              {product.createdAt && (
                <InfoCard
                  icon={<CalendarIcon />}
                  label="Tanggal Dibuat"
                  iconColor="#6b7280"
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      mt: 0.5,
                    }}
                  >
                    {new Date(product.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </InfoCard>
              )}
            </Box>

            {/* Success Message */}
            <Alert
              severity="success"
              icon={<CheckCircleOutlineIcon />}
              sx={{
                mt: 4,
                borderRadius: 2,
                backgroundColor: "success.light",
                color: "success.dark",
                border: "1px solid",
                borderColor: "success.main",
                "& .MuiAlert-icon": {
                  color: "success.main",
                },
              }}
            >
              <Typography variant="body2">
                Informasi produk berhasil dimuat dari QR Code
              </Typography>
            </Alert>

            {/* Back Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "1rem",
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Kembali ke Home
              </Button>
            </Box>
          </Paper>
        ) : null}
      </Container>
    </Box>
  );
};

export default ProductDetail;
