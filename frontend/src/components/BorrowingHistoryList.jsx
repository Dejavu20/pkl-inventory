import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import CSVDownloadModal from "./CSVDownloadModal";

const BorrowingHistoryList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [borrowings, setBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCSVConfirm, setShowCSVConfirm] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  // Get current user info on mount
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
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
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "all") {
        params.append('status', filterStatus);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/borrowings?${params.toString()}`,
        {
          withCredentials: true
        }
      );
      
      const newBorrowings = response.data || [];
      
      // Apply search filter
      let filtered = [...newBorrowings];
      if (searchTerm && searchTerm.trim() !== "") {
        const search = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(borrowing =>
          (borrowing.product?.name?.toLowerCase().includes(search)) ||
          (borrowing.product?.merek?.toLowerCase().includes(search)) ||
          (borrowing.product?.serialNumber?.toLowerCase().includes(search)) ||
          (borrowing.namaPeminjam?.toLowerCase().includes(search))
        );
      }
      
      setBorrowings(filtered);
      
      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat data peminjaman");
      } else {
        setError("Gagal memuat data peminjaman");
      }
      
      // Ensure minimum loading time even on error
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, filterStatus, searchTerm]);

  // Load borrowings when filters change (but not searchTerm, it's handled in getBorrowings)
  useEffect(() => {
    if (startDate && endDate) {
      getBorrowings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, filterStatus]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      dipinjam: { class: "is-info", text: "Dipinjam" },
      dikembalikan: { class: "is-success", text: "Dikembalikan" },
      terlambat: { class: "is-danger", text: "Terlambat" }
    };
    const config = statusConfig[status] || { class: "is-light", text: status };
    return (
      <span className={`tag ${config.class}`} style={{ borderRadius: "4px" }}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
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
      
      // Use filters from modal if provided, otherwise use current filters
      const exportStartDate = csvFilters?.startDate || startDate;
      const exportEndDate = csvFilters?.endDate || endDate;
      const exportStatus = csvFilters?.status || filterStatus;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (exportStatus && exportStatus !== "all") {
        params.append('status', exportStatus);
      }
      if (exportStartDate) {
        params.append('startDate', exportStartDate);
      }
      if (exportEndDate) {
        params.append('endDate', exportEndDate);
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/borrowings/export/csv?${params.toString()}`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      
      // Create blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'borrowings.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }
      
      link.setAttribute('download', filename);
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
    <div>
      <div className="level is-mobile mb-5" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s ease-in-out' }}>
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title is-4 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.25rem" }}>
                History Peminjaman
              </h1>
              <h2 className="subtitle is-6 has-text-grey" style={{ marginTop: "0" }}>
                Riwayat semua peminjaman barang
              </h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <div className="buttons">
              <button
                onClick={() => setShowCSVConfirm(true)}
                className="button is-success"
                disabled={isDownloadingCSV || isLoading || borrowings.length === 0}
                style={{ borderRadius: "8px" }}
                title="Download data peminjaman dalam format CSV"
              >
                <span className="icon">
                  <i className={`fas ${isDownloadingCSV ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                </span>
                <span className="is-hidden-mobile">Download CSV</span>
              </button>
              <Link to="/borrowings" className="button is-primary">
                <span className="icon">
                  <i className="fas fa-arrow-left"></i>
                </span>
                <span>Kembali ke Peminjaman</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="notification is-danger is-light">
          <button className="delete" onClick={() => setError("")}></button>
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="box" style={{ borderRadius: "8px", marginBottom: "1.5rem" }}>
        <h3 className="title is-5 mb-4">Filter Pencarian</h3>
        <div className="columns is-multiline">
          <div className="column is-12-mobile is-6-tablet is-3-desktop">
            <label className="label is-size-7">Tanggal Mulai</label>
            <div className="control">
              <input
                className="input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ borderRadius: "4px" }}
              />
            </div>
          </div>
          <div className="column is-12-mobile is-6-tablet is-3-desktop">
            <label className="label is-size-7">Tanggal Akhir</label>
            <div className="control">
              <input
                className="input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ borderRadius: "4px" }}
              />
            </div>
          </div>
          <div className="column is-12-mobile is-6-tablet is-3-desktop">
            <label className="label is-size-7">Status</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ borderRadius: "4px" }}
                >
                  <option value="all">Semua Status</option>
                  <option value="dipinjam">Dipinjam</option>
                  <option value="dikembalikan">Dikembalikan</option>
                  <option value="terlambat">Terlambat</option>
                </select>
              </div>
            </div>
          </div>
          <div className="column is-12-mobile is-6-tablet is-3-desktop">
            <label className="label is-size-7">Cari</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Cari produk, merek, atau peminjam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: "4px" }}
              />
            </div>
          </div>
          <div className="column is-12">
            <div className="buttons">
              <button
                className="button is-primary"
                onClick={handleFilter}
                disabled={isLoading}
              >
                <span className="icon">
                  <i className="fas fa-filter"></i>
                </span>
                <span>Terapkan Filter</span>
              </button>
              <button
                className="button is-light"
                onClick={handleReset}
                disabled={isLoading}
              >
                <span className="icon">
                  <i className="fas fa-redo"></i>
                </span>
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="has-text-centered py-6" style={{ minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <span className="icon is-large mb-4">
            <i className="fas fa-spinner fa-spin fa-3x has-text-primary"></i>
          </span>
          <p className="is-size-5 has-text-weight-semibold mt-3">Memuat history peminjaman...</p>
          <p className="is-size-7 has-text-grey mt-2">Mohon tunggu sebentar</p>
        </div>
      ) : borrowings.length === 0 ? (
        <div className="notification is-info is-light">
          <p>Tidak ada data peminjaman yang ditemukan untuk periode yang dipilih.</p>
        </div>
      ) : (
        <div className="box" style={{ 
          borderRadius: "4px", 
          border: "1px solid #e0e0e0",
          padding: "1rem"
        }}>
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table className="table is-fullwidth" style={{ margin: 0 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ fontWeight: "600", color: "#495057", borderBottom: "2px solid #dee2e6" }}>No</th>
                  <th style={{ fontWeight: "600", color: "#495057", borderBottom: "2px solid #dee2e6" }}>Produk</th>
                  <th className="is-hidden-mobile" style={{ fontWeight: "600", color: "#495057", borderBottom: "2px solid #dee2e6" }}>Peminjam</th>
                  <th style={{ fontWeight: "600", color: "#495057", borderBottom: "2px solid #dee2e6" }}>Tanggal Pinjam</th>
                  <th className="is-hidden-mobile" style={{ fontWeight: "600", color: "#495057", borderBottom: "2px solid #dee2e6" }}>Tgl. Kembali (Diharapkan)</th>
                  <th className="is-hidden-mobile" style={{ fontWeight: "600", color: "#495057", borderBottom: "2px solid #dee2e6" }}>Tgl. Kembali (Aktual)</th>
                  <th style={{ fontWeight: "600", color: "#495057", borderBottom: "2px solid #dee2e6" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((borrowing, index) => (
                  <tr 
                    key={borrowing.uuid || borrowing.id}
                    style={{ 
                      borderBottom: "1px solid #f0f0f0",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <span className="has-text-weight-semibold has-text-grey">
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <div className="is-flex is-align-items-center">
                        <div 
                          className="is-flex is-align-items-center is-justify-content-center mr-3"
                          style={{
                            width: "48px",
                            height: "48px",
                            minWidth: "48px",
                            borderRadius: "8px",
                            backgroundColor: borrowing.product?.image ? "transparent" : "#f5f5f5",
                            border: "2px solid #e0e0e0",
                            overflow: "hidden",
                            position: "relative"
                          }}
                        >
                          {borrowing.product?.image ? (
                            <img
                              src={borrowing.product.image}
                              alt={borrowing.product?.name || "Product"}
                              style={{
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                                borderRadius: "8px"
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.image-fallback');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="image-fallback is-flex is-align-items-center is-justify-content-center"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: borrowing.product?.image ? "none" : "flex"
                            }}
                          >
                            <span className="icon has-text-grey">
                              <i className="fas fa-box"></i>
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="has-text-weight-semibold is-size-6" style={{ margin: 0 }}>
                            {borrowing.product?.name || "-"}
                          </p>
                          {borrowing.product?.merek && (
                            <p className="is-size-7 has-text-grey" style={{ margin: 0 }}>
                              {borrowing.product.merek}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <span className="has-text-weight-semibold">
                        {borrowing.namaPeminjam || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <span className="is-size-7">
                        {formatDateTime(borrowing.borrowDate)}
                      </span>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="is-size-7 has-text-grey">
                        {borrowing.expectedReturnDate ? formatDateTime(borrowing.expectedReturnDate) : "-"}
                      </span>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="is-size-7 has-text-grey">
                        {borrowing.returnDate ? formatDateTime(borrowing.returnDate) : "-"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      {getStatusBadge(borrowing.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && borrowings.length > 0 && (
        <div className="notification is-info is-light mt-4">
          <p className="is-size-7">
            Menampilkan {borrowings.length} peminjaman untuk periode {formatDate(startDate)} - {formatDate(endDate)}
          </p>
        </div>
      )}

      {/* CSV Download Modal with Date Range Selection */}
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
    </div>
  );
};

export default BorrowingHistoryList;

