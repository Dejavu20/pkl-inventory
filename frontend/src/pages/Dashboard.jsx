import React, { useEffect, useState, useCallback } from "react";
import Layout from "./Layout";
import Welcome from "../components/Welcome";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { getMe } from "../features/authSlice";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import { Box, Grid, Card, CardContent, Typography, Link as MuiLink } from "@mui/material";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError, user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/");
    }
  }, [isError, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const productStats = await axios.get(`${API_BASE_URL}/products/stats`);
      setStats(productStats.data);
    } catch (error) {
      console.error("Gagal memuat statistik:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Welcome />

        {!isLoading && stats && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Total Barang
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {stats.totalProducts}
                  </Typography>
                  <MuiLink
                    component={Link}
                    to="/products"
                    sx={{ fontSize: "0.75rem", textDecoration: "none" }}
                  >
                    Lihat detail →
                  </MuiLink>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Total Pengguna
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.totalUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Layout>
  );
};

export default Dashboard;
