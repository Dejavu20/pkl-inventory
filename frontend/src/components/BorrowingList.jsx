import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import ConfirmModal from "./ConfirmModal";

const BorrowingList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [borrowings, setBorrowings] = useState([]);
  const [allBorrowings, setAllBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // Default: show all borrowings
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowingToDelete, setBorrowingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [borrowingToReturn, setBorrowingToReturn] = useState(null);
  const [isReturning, setIsReturning] = useState(false);
  const location = useLocation();

  // Get current user info on mount
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  // Apply filters when filter criteria change
  useEffect(() => {
    if (allBorrowings.length === 0) return;
    
    let filtered = [...allBorrowings];

    // Filter by status
    if (filterStatus && filterStatus !== "all") {
      if (filterStatus === "active") {
        // Show only active borrowings (dipinjam, terlambat)
        filtered = filtered.filter(borrowing => 
          ['dipinjam', 'terlambat'].includes(borrowing.status)
        );
      } else {
        filtered = filtered.filter(borrowing => 
          borrowing.status === filterStatus
        );
      }
    }

    // Filter by search term
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
  }, [allBorrowings, filterStatus, searchTerm]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getBorrowings = useCallback(async () => {
    const startTime = Date.now();
    const minLoadingTime = 800; // Reduced minimum loading time untuk mengurangi blink
    
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/borrowings`, {
        withCredentials: true
      });
      const newBorrowings = response.data || [];
      
      // Validasi dan log data yang diterima
      console.log("Received borrowings:", newBorrowings.length);
      
      // Pastikan setiap borrowing memiliki UUID - gunakan fallback jika tidak ada
      // JANGAN filter data, semua data harus ditampilkan
      const validatedBorrowings = newBorrowings.map((borrowing, index) => {
        // Pastikan borrowing adalah object
        if (!borrowing || typeof borrowing !== 'object') {
          console.error(`Borrowing at index ${index} is not a valid object:`, borrowing);
          return null;
        }
        
        // Cek UUID di berbagai kemungkinan lokasi
        let uuid = borrowing.uuid || borrowing.UUID || null;
        
        // Jika tidak ada UUID, gunakan ID sebagai fallback
        if (!uuid) {
          if (borrowing.id) {
            uuid = `temp-${borrowing.id}`;
            console.log(`[FRONTEND] Using fallback UUID for borrowing ID ${borrowing.id}: ${uuid}`);
          } else {
            // Jika tidak ada ID juga, generate UUID sementara
            uuid = `temp-${Date.now()}-${index}`;
            console.warn(`[FRONTEND] Borrowing at index ${index} has no UUID and no ID, using generated UUID:`, uuid);
          }
        }
        
        // Pastikan UUID adalah string
        if (typeof uuid !== 'string' || uuid.trim() === '') {
          // Generate UUID jika format tidak valid
          if (borrowing.id) {
            uuid = `temp-${borrowing.id}`;
          } else {
            uuid = `temp-${Date.now()}-${index}`;
          }
        }
        
        // Return borrowing dengan UUID yang sudah divalidasi
        return {
          ...borrowing,
          uuid: uuid // Pastikan UUID selalu ada
        };
      }).filter(borrowing => borrowing !== null);
      
      console.log(`[FRONTEND] Processed ${validatedBorrowings.length} borrowings from ${newBorrowings.length} total`);
      
      // Set data sekaligus untuk menghindari blink
      // Filter akan otomatis di-trigger oleh useEffect yang mendengarkan allBorrowings
      setAllBorrowings(validatedBorrowings);
      
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
  }, []);

  // Load borrowings only once on mount and when location changes
  useEffect(() => {
    if (location.pathname === "/borrowings") {
      getBorrowings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Removed getBorrowings from deps to prevent multiple calls

  // Auto-refresh (setiap 30 detik) - hanya refresh data, tidak trigger loading
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      axios.get(`${API_BASE_URL}/borrowings`, {
        withCredentials: true
      })
        .then(response => {
          const newBorrowings = response.data || [];
          
          // Validasi UUID untuk auto-refresh juga - dengan fallback
          const validatedBorrowings = newBorrowings.map((borrowing, index) => {
            if (!borrowing || typeof borrowing !== 'object') {
              console.error(`[AUTO-REFRESH] Borrowing at index ${index} is not a valid object:`, borrowing);
              return null;
            }
            
            let uuid = borrowing.uuid || borrowing.UUID || null;
            
            // Jika tidak ada UUID, gunakan ID sebagai fallback
            if (!uuid && borrowing.id) {
              uuid = `temp-${borrowing.id}`;
            }
            
            if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
              console.error(`[AUTO-REFRESH] Borrowing at index ${index} is missing UUID and ID:`, {
                borrowing,
                keys: Object.keys(borrowing)
              });
              return null;
            }
            
            return {
              ...borrowing,
              uuid: uuid
            };
          }).filter(borrowing => borrowing !== null);
          
          if (validatedBorrowings.length !== newBorrowings.length) {
            console.warn(`[AUTO-REFRESH] Filtered out ${newBorrowings.length - validatedBorrowings.length} borrowings without UUID`);
          }
          
          setAllBorrowings(validatedBorrowings);
          
          // Apply filters dengan data baru tanpa loading state
          let filtered = [...validatedBorrowings];

          if (filterStatus && filterStatus !== "all") {
            if (filterStatus === "active") {
              filtered = filtered.filter(borrowing => 
                ['dipinjam', 'terlambat'].includes(borrowing.status)
              );
            } else {
              filtered = filtered.filter(borrowing => 
                borrowing.status === filterStatus
              );
            }
          }

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
        })
        .catch((error) => {
          // Silent fail for auto-refresh, tapi log error
          console.error("[AUTO-REFRESH] Error:", error);
        });
    }, 30000); // 30 detik (30000ms)
    
    return () => clearInterval(refreshInterval);
  }, [filterStatus, searchTerm]);

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

  // Check if current user can return this borrowing
  const canReturnBorrowing = (borrowing) => {
    if (!user) return false;
    if (!borrowing) return false;
    
    // Admin can always return
    const isAdmin = user.role && user.role.toLowerCase() === 'admin';
    if (isAdmin) return true;
    
    // Borrower can return their own borrowing
    // Check if borrowerId matches user.id
    // Note: user.id might be in different format, so we need to check
    const isBorrower = borrowing.borrowerId && user.id && borrowing.borrowerId === user.id;
    
    return isBorrower;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    // Validasi borrowing object
    if (!borrowing) {
      console.error("Borrowing object is null or undefined");
      setError("Data peminjaman tidak valid");
      return;
    }
    
    // Jika UUID tidak ada, coba query dari backend
    if (!borrowing.uuid || borrowing.uuid.startsWith('temp-')) {
      console.warn("Borrowing UUID is missing or fallback, querying from backend:", {
        id: borrowing.id,
        uuid: borrowing.uuid
      });
      
      if (!borrowing.id) {
        setError("ID peminjaman tidak ditemukan. Silakan refresh halaman dan coba lagi.");
        return;
      }
      
      try {
        // Query UUID dari backend
        const response = await axios.get(`${API_BASE_URL}/borrowings`, {
          withCredentials: true
        });
        const allBorrowings = response.data || [];
        const foundBorrowing = allBorrowings.find(b => b.id === borrowing.id);
        
        if (foundBorrowing && foundBorrowing.uuid && !foundBorrowing.uuid.startsWith('temp-')) {
          // Update borrowing dengan UUID yang benar
          borrowing.uuid = foundBorrowing.uuid;
          console.log("Found valid UUID from backend:", borrowing.uuid);
        } else {
          // Jika masih tidak ditemukan, tetap buka modal tapi dengan warning
          console.warn("UUID still not found after query, opening modal with warning");
        }
      } catch (error) {
        console.error("Error fetching UUID:", error);
        // Tetap buka modal, tapi akan ada warning di modal
      }
    }
    
    console.log("Opening return confirm for borrowing:", {
      uuid: borrowing.uuid,
      id: borrowing.id,
      product: borrowing.product?.name,
      status: borrowing.status
    });
    
    setBorrowingToReturn(borrowing);
  };

  const closeReturnConfirm = () => {
    setBorrowingToReturn(null);
  };

  const confirmReturn = async () => {
    if (!borrowingToReturn) {
      console.error("borrowingToReturn is null");
      setError("Data peminjaman tidak ditemukan");
      return;
    }
    
    // Validasi dan dapatkan UUID yang benar
    let uuid = borrowingToReturn.uuid;
    const borrowingId = borrowingToReturn.id;
    
    // Pastikan minimal ada ID untuk fallback
    if (!borrowingId) {
      setError("ID peminjaman tidak ditemukan. Silakan refresh halaman dan coba lagi.");
      return;
    }
    
    // Jika UUID tidak ada atau adalah fallback (temp-), query UUID dari backend
    if (!uuid || uuid.startsWith('temp-')) {
      console.warn("UUID not found or is fallback, querying from backend:", {
        uuid,
        id: borrowingId
      });
      
      // Query UUID dari backend - refresh data untuk mendapatkan UUID yang benar
      try {
        const response = await axios.get(`${API_BASE_URL}/borrowings`, {
          withCredentials: true
        });
        const allBorrowings = response.data || [];
        const foundBorrowing = allBorrowings.find(b => b.id === borrowingId);
        
        if (foundBorrowing && foundBorrowing.uuid && !foundBorrowing.uuid.startsWith('temp-')) {
          uuid = foundBorrowing.uuid;
          console.log("Found valid UUID from backend:", uuid);
        } else {
          // Jika masih tidak ditemukan, gunakan fallback UUID (temp-{id})
          // Backend akan handle fallback UUID dan mencari berdasarkan ID
          uuid = `temp-${borrowingId}`;
          console.log("Using fallback UUID, backend will handle:", uuid);
        }
      } catch (error) {
        console.error("Error fetching UUID:", error);
        // Gunakan fallback UUID jika query gagal
        uuid = `temp-${borrowingId}`;
        console.log("Using fallback UUID due to query error:", uuid);
      }
    }
    
    // Pastikan UUID adalah string yang valid
    if (typeof uuid !== 'string' || uuid.trim() === '') {
      // Fallback ke temp-{id} jika UUID tidak valid
      uuid = `temp-${borrowingId}`;
      console.log("UUID invalid, using fallback:", uuid);
    }
    
    console.log("Confirming return for borrowing UUID:", uuid, "ID:", borrowingId);
    
    try {
      setIsReturning(true);
      setError("");
      setSuccess("");
      
      const url = `${API_BASE_URL}/borrowings/${uuid}/return`;
      console.log("Sending return request to:", url);
      
      const response = await axios.patch(
        url,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200 && response.data) {
        setSuccess(response.data.msg || "Barang berhasil dikembalikan!");
        closeReturnConfirm();
        
        // Refresh data setelah berhasil
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
      console.error("Error returning borrowing:", error);
      
      let errorMessage = "Gagal mengembalikan barang";
      
      if (error.response) {
        // Server responded with error status
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
        
        // Log detail error untuk debugging
        if (process.env.NODE_ENV === 'development') {
          console.error("Error response:", {
            status,
            data,
            headers: error.response.headers
          });
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Tidak ada respons dari server. Periksa koneksi internet Anda.";
        console.error("No response received:", error.request);
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
        console.error("Error setting up request:", error);
      }
      
      setError(errorMessage);
      
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div>
      <div className="level is-mobile mb-5" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s ease-in-out' }}>
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title is-4 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.25rem" }}>
                Manajemen Peminjaman
              </h1>
              <h2 className="subtitle is-6 has-text-grey" style={{ marginTop: "0" }}>
                Daftar semua peminjaman barang
              </h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link 
              to="/borrowings/add" 
              className="button is-primary"
              style={{ borderRadius: "4px" }}
              onClick={(e) => isLoading && e.preventDefault()}
            >
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span className="is-hidden-mobile">Tambah Peminjaman</span>
              <span className="is-hidden-tablet">+</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Section - Sembunyikan saat loading untuk menghindari blink */}
      {!isLoading && allBorrowings.length > 0 && (
        <div className="box mb-4" style={{ 
          borderRadius: "4px", 
          border: "1px solid #e0e0e0",
          padding: "1rem",
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}>
        <div className="columns is-mobile is-vcentered">
          <div className="column is-12-mobile is-6-tablet">
            <div className="field">
              <label className="label is-size-7 has-text-weight-semibold">
                <span className="icon mr-1">
                  <i className="fas fa-filter"></i>
                </span>
                Filter Status
              </label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ borderRadius: "4px" }}
                  >
                    <option value="active">Sedang Dipinjam (Aktif)</option>
                    <option value="all">Semua Status</option>
                    <option value="dipinjam">Dipinjam</option>
                    <option value="dikembalikan">Dikembalikan</option>
                    <option value="terlambat">Terlambat</option>
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
                Cari Peminjaman
              </label>
              <div className="control has-icons-left">
                <input
                  type="text"
                  className="input"
                  placeholder="Cari berdasarkan produk, peminjam..."
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
        {(filterStatus !== "active" || searchTerm.trim() !== "") && (
          <div className="notification is-info is-light mt-3">
            <button 
              className="delete" 
              onClick={() => {
                setFilterStatus("active");
                setSearchTerm("");
              }}
            ></button>
            <p className="is-size-7">
              Menampilkan {borrowings.length} dari {allBorrowings.length} peminjaman
              {filterStatus !== "active" && filterStatus !== "all" && ` (Status: ${filterStatus})`}
              {filterStatus === "active" && ` (Hanya yang sedang dipinjam)`}
              {filterStatus === "all" && ` (Semua status)`}
              {searchTerm.trim() !== "" && ` (Pencarian: "${searchTerm}")`}
            </p>
          </div>
        )}
        </div>
      )}

      {error && (
        <div className="notification is-danger is-light">
          <button className="delete" onClick={() => setError("")}></button>
          {error}
        </div>
      )}

      {success && (
        <div className="notification is-success is-light">
          <button className="delete" onClick={() => setSuccess("")}></button>
          {success}
        </div>
      )}

      {/* Info about borrowed products - Sembunyikan saat loading */}
      {!isLoading && (
        <div className="notification is-warning is-light" style={{ borderRadius: "8px", opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}>
          <div className="is-flex is-align-items-center">
            <span className="icon mr-3" style={{ fontSize: "1.5rem" }}>
              <i className="fas fa-exclamation-triangle"></i>
            </span>
            <div>
              <p className="has-text-weight-semibold mb-1">
                Barang yang sedang dipinjam
              </p>
              <p className="is-size-7">
                Halaman ini menampilkan semua barang yang sedang dipinjam. Barang yang sudah dikembalikan akan hilang dari daftar ini dan kembali muncul di menu{" "}
                <Link to="/products" className="has-text-weight-semibold" style={{ textDecoration: "underline" }}>
                  Barang
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="has-text-centered py-6" style={{ minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <span className="icon is-large mb-4">
            <i className="fas fa-spinner fa-spin fa-3x has-text-primary"></i>
          </span>
          <p className="is-size-5 has-text-weight-semibold mt-3">Memuat data peminjaman...</p>
          <p className="is-size-7 has-text-grey mt-2">Mohon tunggu sebentar</p>
        </div>
      ) : borrowings.length === 0 ? (
        <div className="notification is-info is-light">
          <p>Tidak ada peminjaman yang ditemukan.</p>
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
                  <th style={{ fontWeight: "600", color: "#495057", borderBottom: "2px solid #dee2e6" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((borrowing, index) => (
                  <tr 
                    key={borrowing.uuid}
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
                          <strong style={{ color: "#2c3e50" }}>{borrowing.product?.name || "-"}</strong>
                          <br className="is-hidden-tablet" />
                          <span className="is-size-7 has-text-grey is-hidden-tablet">
                            {borrowing.product?.merek || "-"} • {borrowing.product?.serialNumber || "-"}
                          </span>
                          <div className="is-hidden-mobile">
                            <span className="tag is-primary is-small" style={{ borderRadius: "4px" }}>
                              {borrowing.product?.merek || "-"}
                            </span>
                            <br />
                            <code className="has-text-info is-size-7" style={{ 
                              backgroundColor: "#f0f0f0",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px"
                            }}>
                              {borrowing.product?.serialNumber || "-"}
                            </code>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <strong>{borrowing.namaPeminjam || "-"}</strong>
                    </td>
                    <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="is-size-7 has-text-grey">
                        {formatDate(borrowing.borrowDate)}
                      </span>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="is-size-7 has-text-grey">
                        {formatDate(borrowing.expectedReturnDate)}
                      </span>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <span className="is-size-7 has-text-grey">
                        {borrowing.actualReturnDate ? formatDate(borrowing.actualReturnDate) : "-"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      {getStatusBadge(borrowing.status)}
                    </td>
                    <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                      <div className="buttons are-small is-flex-wrap-wrap">
                        {borrowing.status !== 'dikembalikan' && canReturnBorrowing(borrowing) && (
                          <button
                            onClick={() => openReturnConfirm(borrowing)}
                            className="button is-success is-light"
                            title="Kembalikan Barang"
                            style={{ borderRadius: "4px" }}
                          >
                            <span className="icon is-small">
                              <i className="fas fa-undo"></i>
                            </span>
                            <span className="is-hidden-mobile">Kembali</span>
                          </button>
                        )}
                        {borrowing.status !== 'dikembalikan' && !canReturnBorrowing(borrowing) && (
                          <span 
                            className="button is-static is-small"
                            title="Hanya peminjam atau admin yang dapat mengembalikan barang"
                            style={{ borderRadius: "4px", opacity: 0.6 }}
                          >
                            <span className="icon is-small">
                              <i className="fas fa-lock"></i>
                            </span>
                            <span className="is-hidden-mobile">Terkunci</span>
                          </span>
                        )}
                        <Link
                          to={`/borrowings/edit/${borrowing.uuid}`}
                          className="button is-info is-light"
                          title="Edit Peminjaman"
                          style={{ borderRadius: "4px" }}
                        >
                          <span className="icon is-small">
                            <i className="fas fa-edit"></i>
                          </span>
                          <span className="is-hidden-mobile">Edit</span>
                        </Link>
                        <button
                          onClick={() => openDeleteConfirm(borrowing)}
                          className="button is-danger is-light"
                          title="Hapus Peminjaman"
                          style={{ borderRadius: "4px" }}
                        >
                          <span className="icon is-small">
                            <i className="fas fa-trash"></i>
                          </span>
                          <span className="is-hidden-mobile">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
              Apakah Anda yakin ingin menghapus peminjaman ini?<br />
              <div className="box mt-3 mb-3" style={{ 
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                padding: "1rem"
              }}>
                <p className="mb-2">
                  <strong>Produk:</strong> {borrowingToDelete.product?.name || "-"}
                </p>
                <p className="mb-2">
                  <strong>Peminjam:</strong> {borrowingToDelete.namaPeminjam || "-"}
                </p>
                <p className="mb-0">
                  <strong>Status:</strong> {getStatusBadge(borrowingToDelete.status)}
                </p>
              </div>
              <span className="tag is-danger is-small">Tindakan ini tidak dapat dibatalkan!</span>
            </>
          ) : (
            "Apakah Anda yakin ingin menghapus peminjaman ini? Tindakan ini tidak dapat dibatalkan!"
          )
        }
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
        icon="fa-trash"
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
              Apakah Anda yakin ingin mengembalikan barang ini?<br />
              {(!borrowingToReturn.uuid || borrowingToReturn.uuid.startsWith('temp-')) && (
                <div className="notification is-warning is-light mt-2 mb-2" style={{ borderRadius: "8px" }}>
                  <p className="is-size-7">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    <strong>Catatan:</strong> UUID akan dicari otomatis dari database saat proses pengembalian.
                  </p>
                </div>
              )}
              <div className="box mt-3 mb-3" style={{ 
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                padding: "1rem"
              }}>
                <p className="mb-2">
                  <strong>Produk:</strong> {borrowingToReturn.product?.name || "-"}
                </p>
                <p className="mb-2">
                  <strong>Peminjam:</strong> {borrowingToReturn.namaPeminjam || "-"}
                </p>
                <p className="mb-2">
                  <strong>Tanggal Pinjam:</strong> {formatDate(borrowingToReturn.borrowDate)}
                </p>
                <p className="mb-0">
                  <strong>Tanggal Kembali Diharapkan:</strong> {formatDate(borrowingToReturn.expectedReturnDate)}
                </p>
              </div>
            </>
          ) : (
            "Apakah Anda yakin ingin mengembalikan barang ini?"
          )
        }
        confirmText="Kembalikan"
        cancelText="Batal"
        type="success"
        isLoading={isReturning}
        icon="fa-check-circle"
      />
    </div>
  );
};

export default BorrowingList;

