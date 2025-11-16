import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import ConfirmModal from "./ConfirmModal";

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showCSVConfirm, setShowCSVConfirm] = useState(false);
  const [showQRDownloadConfirm, setShowQRDownloadConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();

  const getCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Filter products when filter criteria change
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    let filtered = allProducts.filter(product => {
      const status = product.status;
      if (status === 'dipinjam') {
        return false;
      }
      return status === 'tersedia' || !status || status === null || status === undefined || status === '';
    });

    // Filter by kategori
    if (selectedKategori && selectedKategori !== "all") {
      filtered = filtered.filter(product => 
        product.kategori && product.kategori.toLowerCase() === selectedKategori.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        (product.name && product.name.toLowerCase().includes(search)) ||
        (product.merek && product.merek.toLowerCase().includes(search)) ||
        (product.serialNumber && product.serialNumber.toLowerCase().includes(search)) ||
        (product.kategori && product.kategori.toLowerCase().includes(search))
      );
    }

    setProducts(filtered);
  }, [allProducts, selectedKategori, searchTerm]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getProducts = useCallback(async () => {
    const startTime = Date.now();
    const minLoadingTime = 800; // Reduced minimum loading time untuk mengurangi blink
    
    try {
      setIsLoadingProducts(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      const productsWithStatus = response.data.map(product => {
        let normalizedStatus = product.status;
        if (!normalizedStatus || normalizedStatus === null || normalizedStatus === undefined || normalizedStatus === '') {
          normalizedStatus = 'tersedia';
        }
        return {
          ...product,
          status: normalizedStatus
        };
      });
      
      // Set data sekaligus untuk menghindari blink
      setAllProducts(productsWithStatus);
      
      // Filter akan otomatis di-trigger oleh useEffect yang mendengarkan allProducts
      
      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      
      // Ensure minimum loading time even on error
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, []);

  // Load products only once on mount and when location changes
  useEffect(() => {
    if (location.pathname === "/products") {
      getProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Removed getProducts from deps to prevent multiple calls

  const openDeleteConfirm = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setProductToDelete(null);
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setIsDeleting(true);
      await axios.delete(`${API_BASE_URL}/products/${productToDelete.uuid}`, {
        withCredentials: true
      });
      closeDeleteConfirm();
      getProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus produk");
      } else {
        setError("Gagal menghapus produk");
      }
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const showQRCode = async (product) => {
    try {
      setIsLoadingQR(true);
      setSelectedProduct(product);
      const response = await axios.get(`${API_BASE_URL}/products/${product.uuid}/qrcode`);
      setQrCodeData(response.data);
      setShowQRModal(true);
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat QR code");
      } else {
        setError("Gagal memuat QR code");
      }
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setQrCodeData(null);
    setSelectedProduct(null);
  };

  const downloadQRCode = () => {
    if (!qrCodeData || !qrCodeData.qrCode || !selectedProduct) return;
    
    const link = document.createElement('a');
    link.href = qrCodeData.qrCode;
    link.download = `QR-${selectedProduct.name}-${selectedProduct.serialNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowQRDownloadConfirm(false);
  };

  const openQRDownloadConfirm = () => {
    setShowQRDownloadConfirm(true);
  };

  const confirmDownloadCSV = () => {
    setShowCSVConfirm(false);
    downloadCSV();
  };

  const downloadCSV = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products/export/csv`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      // Create blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'products.csv';
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
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="notification is-danger is-light" style={{ borderRadius: "8px", marginBottom: "1rem" }}>
          <button className="delete" onClick={() => setError("")}></button>
          {error}
        </div>
      )}

      {success && (
        <div className="notification is-success is-light" style={{ borderRadius: "8px", marginBottom: "1rem" }}>
          <button className="delete" onClick={() => setSuccess("")}></button>
          {success}
        </div>
      )}

      <div className="level" style={{ opacity: isLoadingProducts ? 0.5 : 1, transition: 'opacity 0.3s ease-in-out' }}>
        <div className="level-left">
          <div>
            <h1 className="title">Products</h1>
            <h2 className="subtitle">List of Products</h2>
          </div>
        </div>
        <div className="level-right">
          <div className="buttons">
            <button
              onClick={() => setShowCSVConfirm(true)}
              className="button is-success"
              disabled={isLoading || isLoadingProducts || products.length === 0}
              style={{ borderRadius: "8px" }}
              title="Download data produk dalam format CSV"
            >
              <span className="icon">
                <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
              </span>
              <span className="is-hidden-mobile">Download CSV</span>
            </button>
            <Link 
              to="/products/add" 
              className="button is-primary" 
              style={{ borderRadius: "8px" }}
              onClick={(e) => isLoadingProducts && e.preventDefault()}
            >
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Add New Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Section - Sembunyikan saat loading untuk menghindari blink */}
      {!isLoadingProducts && allProducts.length > 0 && (
        <div className="box mb-4" style={{
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          padding: "1rem",
          opacity: isLoadingProducts ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
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
                    value={selectedKategori}
                    onChange={(e) => setSelectedKategori(e.target.value)}
                    style={{ borderRadius: "4px" }}
                  >
                    <option value="all">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category.uuid} value={category.name}>
                        {category.name}
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
                Cari Produk
              </label>
              <div className="control has-icons-left">
                <input
                  type="text"
                  className="input"
                  placeholder="Cari berdasarkan nama, merek, serial..."
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
        {(selectedKategori !== "all" || searchTerm.trim() !== "") && (
          <div className="notification is-info is-light mt-3">
            <button 
              className="delete" 
              onClick={() => {
                setSelectedKategori("all");
                setSearchTerm("");
              }}
            ></button>
            <p className="is-size-7">
              Menampilkan {products.length} dari {allProducts.length} produk
              {selectedKategori !== "all" && ` (Kategori: ${selectedKategori})`}
              {searchTerm.trim() !== "" && ` (Pencarian: "${searchTerm}")`}
            </p>
          </div>
        )}
        </div>
      )}

      {isLoadingProducts ? (
        <div className="card">
          <div className="card-content">
            <div className="has-text-centered py-6" style={{ minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <span className="icon is-large mb-4">
                <i className="fas fa-spinner fa-spin fa-3x has-text-primary"></i>
              </span>
              <p className="is-size-5 has-text-weight-semibold mt-3">Memuat data produk...</p>
              <p className="is-size-7 has-text-grey mt-2">Mohon tunggu sebentar</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-content">
            <div className="table-container">
              <table className="table is-striped is-hoverable is-fullwidth">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Foto</th>
                    <th>Product Name</th>
                    <th>Merek</th>
                    <th>Kategori</th>
                    <th>Serial Number</th>
                    <th>Created By</th>
                    <th>QR Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="has-text-centered has-text-grey">
                        {allProducts.length === 0 ? "No products found" : "Tidak ada produk yang sesuai dengan filter"}
                      </td>
                    </tr>
                  ) : (
                  products.map((product, index) => (
                    <tr key={product.uuid}>
                      <td>{index + 1}</td>
                      <td style={{ padding: "0.75rem", verticalAlign: "middle" }}>
                        <div 
                          className="is-flex is-align-items-center is-justify-content-center"
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "8px",
                            backgroundColor: product.image ? "transparent" : "#f5f5f5",
                            border: "2px solid #e0e0e0",
                            overflow: "hidden",
                            position: "relative"
                          }}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
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
                              display: product.image ? "none" : "flex"
                            }}
                          >
                            <span className="icon has-text-grey">
                              <i className="fas fa-box fa-lg"></i>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                      </td>
                      <td>
                        <span className="tag is-primary">{product.merek}</span>
                      </td>
                      <td>
                        {product.kategori ? (
                          <span className="tag is-info" style={{ borderRadius: "4px" }}>
                            {product.kategori}
                          </span>
                        ) : (
                          <span className="has-text-grey">-</span>
                        )}
                      </td>
                      <td>
                        <code>{product.serialNumber}</code>
                      </td>
                      <td>{product.user?.name || "-"}</td>
                      <td>
                        <button
                          onClick={() => showQRCode(product)}
                          className="button is-warning is-light is-small"
                          title="Tampilkan QR Code"
                          style={{ borderRadius: "4px" }}
                        >
                          <span className="icon is-small">
                            <i className="fas fa-qrcode"></i>
                          </span>
                          <span className="is-hidden-mobile">QR</span>
                        </button>
                      </td>
                      <td>
                        <div className="buttons are-small">
                          <Link
                            to={`/products/edit/${product.uuid}`}
                            className="button is-info is-small"
                            style={{ borderRadius: "4px" }}
                          >
                            <span className="icon is-small">
                              <i className="fas fa-edit"></i>
                            </span>
                            <span className="is-hidden-mobile">Edit</span>
                          </Link>
                          <button
                            onClick={() => openDeleteConfirm(product)}
                            className="button is-danger is-small"
                            style={{ borderRadius: "4px" }}
                          >
                            <span className="icon is-small">
                              <i className="fas fa-trash"></i>
                            </span>
                            <span className="is-hidden-mobile">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeQRModal}></div>
          <div className="modal-card" style={{ maxWidth: "500px", borderRadius: "12px" }}>
            <header className="modal-card-head" style={{ borderRadius: "12px 12px 0 0" }}>
              <p className="modal-card-title">
                <span className="icon mr-2">
                  <i className="fas fa-qrcode"></i>
                </span>
                QR Code Produk
              </p>
              <button
                className="delete"
                aria-label="close"
                onClick={closeQRModal}
              ></button>
            </header>
            <section className="modal-card-body" style={{ padding: "2rem" }}>
              {isLoadingQR ? (
                <div className="has-text-centered">
                  <span className="icon is-large">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                  </span>
                  <p className="mt-4">Memuat QR Code...</p>
                </div>
              ) : qrCodeData && selectedProduct ? (
                <div>
                  <div className="has-text-centered mb-4">
                    <img
                      src={qrCodeData.qrCode}
                      alt="QR Code"
                      style={{
                        maxWidth: "300px",
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        border: "2px solid #e0e0e0"
                      }}
                    />
                  </div>
                  <div className="box" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <div className="content is-small">
                      <p className="mb-2">
                        <strong>Nama Produk:</strong> {selectedProduct.name}
                      </p>
                      <p className="mb-2">
                        <strong>Merek:</strong> {selectedProduct.merek}
                      </p>
                      <p className="mb-2">
                        <strong>Serial Number:</strong> <code>{selectedProduct.serialNumber}</code>
                      </p>
                      <p className="is-size-7 has-text-grey mt-3">
                        <i className="fas fa-info-circle mr-1"></i>
                        Scan QR code ini untuk melihat detail produk
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
            <footer className="modal-card-foot" style={{ borderRadius: "0 0 12px 12px" }}>
              <div className="buttons" style={{ width: "100%", flexWrap: "wrap" }}>
                {selectedProduct && (
                  <Link
                    to={`/products/detail/${selectedProduct.uuid}`}
                    className="button is-primary"
                    onClick={closeQRModal}
                    style={{ borderRadius: "8px", flex: 1, minWidth: "150px" }}
                  >
                    <span className="icon">
                      <i className="fas fa-info-circle"></i>
                    </span>
                    <span>Lihat Detail Produk</span>
                  </Link>
                )}
                {qrCodeData && (
                  <button
                    className="button is-success"
                    onClick={openQRDownloadConfirm}
                    style={{ borderRadius: "8px", flex: 1, minWidth: "150px" }}
                  >
                    <span className="icon">
                      <i className="fas fa-download"></i>
                    </span>
                    <span>Download QR</span>
                  </button>
                )}
                <button
                  className="button is-light"
                  onClick={closeQRModal}
                  style={{ borderRadius: "8px", flex: 1, minWidth: "150px" }}
                >
                  <span>Tutup</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* CSV Download Confirmation Modal */}
      <ConfirmModal
        isOpen={showCSVConfirm}
        onClose={() => setShowCSVConfirm(false)}
        onConfirm={confirmDownloadCSV}
        title="Download CSV"
        message={`Anda akan mengunduh data produk dalam format CSV. File akan berisi ${products.length} produk yang sedang ditampilkan.`}
        confirmText="Download"
        cancelText="Batal"
        type="success"
        isLoading={isLoading}
        icon="fa-download"
      />

      {/* QR Download Confirmation Modal */}
      <ConfirmModal
        isOpen={showQRDownloadConfirm}
        onClose={() => setShowQRDownloadConfirm(false)}
        onConfirm={downloadQRCode}
        title="Download QR Code"
        message={
          selectedProduct ? (
            <>
              Anda akan mengunduh QR Code untuk produk:<br />
              <strong>{selectedProduct.name}</strong><br />
              <span className="is-size-7 has-text-grey">Serial: {selectedProduct.serialNumber}</span>
            </>
          ) : (
            "Anda akan mengunduh QR Code produk ini."
          )
        }
        confirmText="Download"
        cancelText="Batal"
        type="success"
        icon="fa-download"
      />

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        message={
          productToDelete ? (
            <>
              Apakah Anda yakin ingin menghapus produk ini?<br />
              <strong>{productToDelete.name}</strong><br />
              <span className="is-size-7 has-text-grey">Serial: {productToDelete.serialNumber}</span><br />
              <span className="tag is-danger is-small mt-2">Tindakan ini tidak dapat dibatalkan!</span>
            </>
          ) : (
            "Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan!"
          )
        }
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
        icon="fa-trash"
      />
    </div>
  );
};

export default ProductList;
