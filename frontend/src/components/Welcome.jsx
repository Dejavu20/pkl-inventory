import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

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
    totalAdmins: 0
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

    // Filter by kategori
    if (filterKategori && filterKategori !== "all") {
      filtered = filtered.filter(item => 
        item.kategori && item.kategori.toLowerCase() === filterKategori.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(search) ||
        item.merek.toLowerCase().includes(search) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(search)) ||
        (item.kategori && item.kategori.toLowerCase().includes(search)) ||
        (item.createdBy && item.createdBy.toLowerCase().includes(search))
      );
    }

    setHistory(filtered);
  }, [allHistory, filterKategori, searchTerm]);

  useEffect(() => {
    // Filter history when filterKategori or searchTerm changes
    applyFilters();
  }, [applyFilters]);

  // Get unique categories from all history
  const getCategories = () => {
    const categories = new Set();
    allHistory.forEach(item => {
      if (item.kategori && item.kategori.trim() !== "") {
        categories.add(item.kategori);
      }
    });
    return Array.from(categories).sort();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Welcome Card */}
      <div className="box mb-4" style={{
        borderRadius: "4px",
        border: "1px solid #e0e0e0",
        padding: "1.5rem",
        backgroundColor: "#ffffff"
      }}>
        <div className="media">
          <div className="media-left">
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "4px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span className="icon">
                <i className="fas fa-user-circle fa-2x has-text-grey"></i>
              </span>
            </div>
          </div>
          <div className="media-content">
            <h1 className="title is-4 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.25rem" }}>
              Selamat Datang, {user && user.name}!
            </h1>
            <p className="subtitle is-6 has-text-grey" style={{ marginTop: "0" }}>
              Role: <span className="tag" style={{ backgroundColor: "#e0e0e0", color: "#2c3e50", fontWeight: "600" }}>
                {user && user.role}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="columns is-mobile mb-4">
        <div className="column is-4">
          <div className="box" style={{
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            padding: "1.25rem",
            backgroundColor: "#ffffff",
            textAlign: "center"
          }}>
            {isLoadingStats ? (
              <div className="has-text-centered">
                <span className="icon">
                  <i className="fas fa-spinner fa-spin"></i>
                </span>
              </div>
            ) : (
              <>
                <div className="icon is-large mb-3" style={{ color: "#48c774" }}>
                  <i className="fas fa-box fa-2x"></i>
                </div>
                <h3 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.5rem" }}>
                  {stats.totalProducts}
                </h3>
                <p className="subtitle is-6 has-text-grey" style={{ marginTop: "0" }}>
                  Total Barang
                </p>
              </>
            )}
          </div>
        </div>
        <div className="column is-4">
          <div className="box" style={{
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            padding: "1.25rem",
            backgroundColor: "#ffffff",
            textAlign: "center"
          }}>
            {isLoadingStats ? (
              <div className="has-text-centered">
                <span className="icon">
                  <i className="fas fa-spinner fa-spin"></i>
                </span>
              </div>
            ) : (
              <>
                <div className="icon is-large mb-3" style={{ color: "#3273dc" }}>
                  <i className="fas fa-users fa-2x"></i>
                </div>
                <h3 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.5rem" }}>
                  {stats.totalUsers}
                </h3>
                <p className="subtitle is-6 has-text-grey" style={{ marginTop: "0" }}>
                  Total User
                </p>
              </>
            )}
          </div>
        </div>
        <div className="column is-4">
          <div className="box" style={{
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            padding: "1.25rem",
            backgroundColor: "#ffffff",
            textAlign: "center"
          }}>
            {isLoadingStats ? (
              <div className="has-text-centered">
                <span className="icon">
                  <i className="fas fa-spinner fa-spin"></i>
                </span>
              </div>
            ) : (
              <>
                <div className="icon is-large mb-3" style={{ color: "#ff3860" }}>
                  <i className="fas fa-user-shield fa-2x"></i>
                </div>
                <h3 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.5rem" }}>
                  {stats.totalAdmins}
                </h3>
                <p className="subtitle is-6 has-text-grey" style={{ marginTop: "0" }}>
                  Total Admin
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History Input Barang */}
      <div className="box" style={{
        borderRadius: "4px",
        border: "1px solid #e0e0e0",
        padding: "1.5rem"
      }}>
        <div className="mb-4">
          <h2 className="title is-5 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.25rem" }}>
            <span className="icon mr-2 has-text-grey">
              <i className="fas fa-history"></i>
            </span>
            History Input Barang
          </h2>
          <p className="subtitle is-6 has-text-grey" style={{ marginTop: "0" }}>
            Riwayat input barang dalam sistem
          </p>
        </div>
        {/* Filter Section */}
        <div className="box mb-4" style={{ 
          borderRadius: "4px", 
          border: "1px solid #e0e0e0",
          padding: "1rem",
          backgroundColor: "#f8f9fa"
        }}>
                <div className="columns is-mobile is-vcentered">
                  <div className="column is-12-mobile is-6-tablet">
                    <div className="field">
                      <label className="label is-size-7 has-text-weight-semibold">
                        <span className="icon mr-1">
                          <i className="fas fa-filter"></i>
                        </span>
                        Filter Kategori
                      </label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                            style={{ borderRadius: "4px" }}
                          >
                            <option value="all">Semua Kategori</option>
                            {getCategories().map((kategori, index) => (
                              <option key={index} value={kategori}>
                                {kategori}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="column is-12-mobile is-6-tablet">
                    <div className="field">
                      <label className="label is-size-7 has-text-weight-semibold">
                        <span className="icon mr-1">
                          <i className="fas fa-search"></i>
                        </span>
                        Cari History
                      </label>
                      <div className="control has-icons-left">
                        <input
                          type="text"
                          className="input"
                          placeholder="Cari berdasarkan nama, merek, serial, kategori, atau pembuat..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ borderRadius: "4px" }}
                        />
                        <span className="icon is-small is-left">
                          <i className="fas fa-search"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {(filterKategori !== "all" || searchTerm.trim() !== "") && (
                  <div className="notification is-info is-light mt-3">
                    <button 
                      className="delete" 
                      onClick={() => {
                        setFilterKategori("all");
                        setSearchTerm("");
                      }}
                    ></button>
                    <p className="is-size-7">
                      Menampilkan {history.length} dari {allHistory.length} history
                      {filterKategori !== "all" && ` (Kategori: ${filterKategori})`}
                      {searchTerm.trim() !== "" && ` (Pencarian: "${searchTerm}")`}
                    </p>
                  </div>
          )}
        </div>

        {error && (
          <div className="notification is-danger is-light" style={{ borderRadius: "4px" }}>
            <button className="delete" onClick={() => setError("")}></button>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="has-text-centered py-6">
            <span className="icon is-large">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
            </span>
            <p className="mt-3">Memuat history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="notification is-info is-light" style={{ borderRadius: "4px" }}>
            <p>Tidak ada history input barang.</p>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table className="table is-fullwidth" style={{ margin: 0 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6",
                    fontSize: "0.875rem",
                    padding: "0.75rem"
                  }}>No</th>
                  <th style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6",
                    fontSize: "0.875rem",
                    padding: "0.75rem"
                  }}>Nama Produk</th>
                  <th className="is-hidden-mobile" style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6",
                    fontSize: "0.875rem",
                    padding: "0.75rem"
                  }}>Merek</th>
                  <th style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6",
                    fontSize: "0.875rem",
                    padding: "0.75rem"
                  }}>Kategori</th>
                  <th className="is-hidden-mobile" style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6",
                    fontSize: "0.875rem",
                    padding: "0.75rem"
                  }}>Serial Number</th>
                  <th style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6",
                    fontSize: "0.875rem",
                    padding: "0.75rem"
                  }}>Dibuat Oleh</th>
                  <th className="is-hidden-mobile" style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6",
                    fontSize: "0.875rem",
                    padding: "0.75rem"
                  }}>Waktu Input</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((item, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: "1px solid #f0f0f0"
                    }}
                  >
                    <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="has-text-weight-semibold has-text-grey is-size-7">
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <strong style={{ color: "#2c3e50", fontSize: "0.875rem" }}>{item.productName}</strong>
                      <br className="is-hidden-tablet" />
                      <span className="is-size-7 has-text-grey is-hidden-tablet">
                        {item.merek} • {item.serialNumber}
                      </span>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="tag" style={{ borderRadius: "4px", fontSize: "0.75rem", backgroundColor: "#e0e0e0", color: "#2c3e50" }}>
                        {item.merek}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      {item.kategori ? (
                        <span className="tag is-info" style={{ borderRadius: "4px", fontSize: "0.75rem" }}>
                          {item.kategori}
                        </span>
                      ) : (
                        <span className="has-text-grey is-size-7">-</span>
                      )}
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <code className="is-size-7" style={{
                        backgroundColor: "#f0f0f0",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px"
                      }}>
                        {item.serialNumber}
                      </code>
                    </td>
                    <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="has-text-grey is-size-7">{item.createdBy}</span>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="is-size-7 has-text-grey">
                        {formatDate(item.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length > 10 && (
              <div className="notification is-info is-light mt-4" style={{ borderRadius: "4px" }}>
                <p className="is-size-7">
                  Menampilkan 10 dari {history.length} history terbaru. 
                  <Link to="/products" className="ml-2 has-text-weight-semibold">
                    Lihat semua produk →
                  </Link>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;
