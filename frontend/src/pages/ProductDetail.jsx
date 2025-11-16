import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const ProductDetail = () => {
  const { id } = useParams();
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

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem 1rem"
    }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="columns is-centered">
          <div className="column is-full-mobile is-10-tablet">
            {isLoading ? (
              <div className="box has-text-centered" style={{
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                border: "none"
              }}>
                <span className="icon is-large">
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                </span>
                <p className="mt-4">Memuat informasi produk...</p>
              </div>
            ) : error ? (
              <div className="box" style={{
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                border: "none"
              }}>
                <div className="notification is-danger is-light" style={{ borderRadius: "8px" }}>
                  <p className="title is-5">
                    <span className="icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>
                    Error
                  </p>
                  <p>{error}</p>
                  <div className="buttons mt-4">
                    <button 
                      className="button is-light" 
                      onClick={() => window.location.href = "/"}
                      style={{ borderRadius: "8px" }}
                    >
                      <span className="icon">
                        <i className="fas fa-home"></i>
                      </span>
                      <span>Kembali ke Home</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : product ? (
              <div className="box" style={{
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                border: "none",
                backgroundColor: "white"
              }}>
                <div className="has-text-centered mb-5">
                  {product.image ? (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          borderRadius: "12px",
                          border: "3px solid white",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                          objectFit: "cover"
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ 
                      width: "100px", 
                      height: "100px", 
                      borderRadius: "50%", 
                      display: "inline-flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      marginBottom: "1.5rem",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                    }}>
                      <span className="icon is-large has-text-white">
                        <i className="fas fa-box fa-2x"></i>
                      </span>
                    </div>
                  )}
                  <h1 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.5rem" }}>
                    Informasi Produk
                  </h1>
                  <p className="subtitle is-6 has-text-grey">
                    Detail produk dari QR Code Scan
                  </p>
                </div>

                <div className="content">
                  <div className="box mb-4" style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <div className="media">
                      <div className="media-left">
                        <div style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          backgroundColor: "#667eea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <span className="icon has-text-white">
                            <i className="fas fa-tag fa-lg"></i>
                          </span>
                        </div>
                      </div>
                      <div className="media-content">
                        <p className="heading has-text-weight-semibold" style={{ color: "#495057" }}>
                          Nama Produk
                        </p>
                        <p className="title is-4" style={{ color: "#2c3e50" }}>{product.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="box mb-4" style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <div className="media">
                      <div className="media-left">
                        <div style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          backgroundColor: "#48c6ef",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <span className="icon has-text-white">
                            <i className="fas fa-industry fa-lg"></i>
                          </span>
                        </div>
                      </div>
                      <div className="media-content">
                        <p className="heading has-text-weight-semibold" style={{ color: "#495057" }}>
                          Merek
                        </p>
                        <p className="title is-5">
                          <span className="tag is-info is-medium" style={{ borderRadius: "6px" }}>
                            {product.merek}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="box mb-4" style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <div className="media">
                      <div className="media-left">
                        <div style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          backgroundColor: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <span className="icon has-text-white">
                            <i className="fas fa-barcode fa-lg"></i>
                          </span>
                        </div>
                      </div>
                      <div className="media-content">
                        <p className="heading has-text-weight-semibold" style={{ color: "#495057" }}>
                          Serial Number
                        </p>
                        <p className="title is-5">
                          <code style={{
                            fontSize: "1.1rem",
                            backgroundColor: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "6px",
                            border: "1px solid #e0e0e0",
                            color: "#2c3e50",
                            fontWeight: "600"
                          }}>
                            {product.serialNumber}
                          </code>
                        </p>
                      </div>
                    </div>
                  </div>

                  {product.kategori && (
                    <div className="box mb-4" style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#f8f9fa"
                    }}>
                      <div className="media">
                        <div className="media-left">
                          <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            backgroundColor: "#8b5cf6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <span className="icon has-text-white">
                              <i className="fas fa-folder fa-lg"></i>
                            </span>
                          </div>
                        </div>
                        <div className="media-content">
                          <p className="heading has-text-weight-semibold" style={{ color: "#495057" }}>
                            Kategori
                          </p>
                          <p className="title is-5">
                            <span className="tag is-primary is-medium" style={{ borderRadius: "6px" }}>
                              {product.kategori}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="box mb-4" style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <div className="media">
                      <div className="media-left">
                        <div style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          backgroundColor: product.status === 'tersedia' ? "#10b981" : "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <span className="icon has-text-white">
                            <i className={`fas ${product.status === 'tersedia' ? 'fa-check-circle' : 'fa-exclamation-circle'} fa-lg`}></i>
                          </span>
                        </div>
                      </div>
                      <div className="media-content">
                        <p className="heading has-text-weight-semibold" style={{ color: "#495057" }}>
                          Status
                        </p>
                        <p className="title is-5">
                          <span className={`tag is-medium ${product.status === 'tersedia' ? 'is-success' : 'is-danger'}`} style={{ borderRadius: "6px" }}>
                            {product.status === 'tersedia' ? 'Tersedia' : 'Dipinjam'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {product.activeBorrowing && (
                    <div className="box mb-4" style={{
                      borderRadius: "8px",
                      border: "2px solid #f59e0b",
                      backgroundColor: "#fffbeb"
                    }}>
                      <div className="media">
                        <div className="media-left">
                          <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            backgroundColor: "#f59e0b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <span className="icon has-text-white">
                              <i className="fas fa-hand-holding fa-lg"></i>
                            </span>
                          </div>
                        </div>
                        <div className="media-content">
                          <p className="heading has-text-weight-semibold" style={{ color: "#92400e" }}>
                            Status Peminjaman
                          </p>
                          <p className="title is-5" style={{ color: "#78350f" }}>
                            {product.activeBorrowing.status === 'terlambat' ? (
                              <span className="tag is-danger is-medium" style={{ borderRadius: "6px" }}>
                                Terlambat
                              </span>
                            ) : (
                              <span className="tag is-warning is-medium" style={{ borderRadius: "6px" }}>
                                Sedang Dipinjam
                              </span>
                            )}
                          </p>
                          <div className="content is-small mt-3">
                            <p className="mb-2">
                              <strong>Peminjam:</strong> {product.activeBorrowing.namaPeminjam}
                            </p>
                            {product.activeBorrowing.borrowDate && (
                              <p className="mb-2">
                                <strong>Tanggal Pinjam:</strong> {new Date(product.activeBorrowing.borrowDate).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                            {product.activeBorrowing.expectedReturnDate && (
                              <p className="mb-2">
                                <strong>Tanggal Kembali (Diharapkan):</strong> {new Date(product.activeBorrowing.expectedReturnDate).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {product.user && (
                    <div className="box mb-4" style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#f8f9fa"
                    }}>
                      <div className="media">
                        <div className="media-left">
                          <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            backgroundColor: "#6366f1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <span className="icon has-text-white">
                              <i className="fas fa-user fa-lg"></i>
                            </span>
                          </div>
                        </div>
                        <div className="media-content">
                          <p className="heading has-text-weight-semibold" style={{ color: "#495057" }}>
                            Dibuat Oleh
                          </p>
                          <p className="title is-5" style={{ color: "#2c3e50" }}>{product.user.name}</p>
                          {product.user.email && (
                            <p className="subtitle is-6 has-text-grey">{product.user.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {product.createdAt && (
                    <div className="box mb-4" style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#f8f9fa"
                    }}>
                      <div className="media">
                        <div className="media-left">
                          <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            backgroundColor: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <span className="icon has-text-white">
                              <i className="fas fa-calendar fa-lg"></i>
                            </span>
                          </div>
                        </div>
                        <div className="media-content">
                          <p className="heading has-text-weight-semibold" style={{ color: "#495057" }}>
                            Tanggal Dibuat
                          </p>
                          <p className="title is-6" style={{ color: "#2c3e50" }}>
                            {new Date(product.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="notification is-success is-light mt-5" style={{ borderRadius: "8px" }}>
                  <p className="is-size-7">
                    <i className="fas fa-check-circle mr-2"></i>
                    Informasi produk berhasil dimuat dari QR Code
                  </p>
                </div>

                <div className="buttons is-centered mt-5">
                  <button 
                    className="button is-primary" 
                    onClick={() => window.location.href = "/"}
                    style={{
                      borderRadius: "8px",
                      padding: "0.75rem 2rem",
                      fontSize: "1rem",
                      fontWeight: "600"
                    }}
                  >
                    <span className="icon">
                      <i className="fas fa-home"></i>
                    </span>
                    <span>Kembali ke Home</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

