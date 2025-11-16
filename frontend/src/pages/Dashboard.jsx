import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import Welcome from "../components/Welcome";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { getMe } from "../features/authSlice";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

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

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const productStats = await axios.get(`${API_BASE_URL}/products/stats`);
      setStats(productStats.data);
    } catch (error) {
      console.error("Gagal memuat statistik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: "0.5rem" }}>
        <Welcome />
        
        {!isLoading && stats && (
          <div className="columns is-mobile is-multiline mt-4">
            <div className="column is-6-mobile is-3-tablet">
              <div className="box" style={{ padding: "1rem", borderRadius: "4px", border: "1px solid #e0e0e0" }}>
                <p className="is-size-7 has-text-grey mb-1">Total Barang</p>
                <p className="title is-5 has-text-weight-bold" style={{ color: "#2c3e50", margin: 0 }}>
                  {stats.totalProducts}
                </p>
                <Link to="/products" className="is-size-7 has-text-primary">Lihat detail →</Link>
              </div>
            </div>
            <div className="column is-6-mobile is-3-tablet">
              <div className="box" style={{ padding: "1rem", borderRadius: "4px", border: "1px solid #e0e0e0" }}>
                <p className="is-size-7 has-text-grey mb-1">Total Pengguna</p>
                <p className="title is-5 has-text-weight-bold" style={{ color: "#2c3e50", margin: 0 }}>
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
