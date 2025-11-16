import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormAddBorrowing = () => {
  const [productId, setProductId] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [borrowTime, setBorrowTime] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [expectedReturnTime, setExpectedReturnTime] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      // Filter hanya produk yang tersedia (status 'tersedia' atau null/undefined)
      const availableProducts = response.data.filter(product => {
        const status = product.status;
        return status === 'tersedia' || !status || status === null || status === undefined || status === '';
      });
      setProducts(availableProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setMsg("Gagal memuat daftar produk");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set default dates and times - hanya sekali saat mount
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    setBorrowDate(formatDate(today));
    setBorrowTime(formatTime(today));
    setExpectedReturnDate(formatDate(tomorrow));
    setExpectedReturnTime("17:00"); // Default jam 17:00 untuk pengembalian
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveBorrowing = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    // Validation
    if (!productId || !borrowerName || !borrowDate || !expectedReturnDate) {
      setMsg("Semua field wajib harus diisi");
      setIsLoading(false);
      return;
    }

    if (borrowerName.trim().length < 3) {
      setMsg("Nama peminjam minimal 3 karakter");
      setIsLoading(false);
      return;
    }

    if (borrowerName.trim().length > 255) {
      setMsg("Nama peminjam maksimal 255 karakter");
      setIsLoading(false);
      return;
    }

    const borrow = new Date(borrowDate);
    const expectedReturn = new Date(expectedReturnDate);

    if (expectedReturn <= borrow) {
      setMsg("Tanggal kembali harus setelah tanggal pinjam");
      setIsLoading(false);
      return;
    }

    // Combine date and time
    const borrowDateTime = borrowTime ? `${borrowDate}T${borrowTime}:00` : `${borrowDate}T00:00:00`;
    const expectedReturnDateTime = expectedReturnTime ? `${expectedReturnDate}T${expectedReturnTime}:00` : `${expectedReturnDate}T00:00:00`;

    try {
      await axios.post(`${API_BASE_URL}/borrowings`, {
        productId: productId.trim(),
        namaPeminjam: borrowerName.trim(),
        borrowDate: borrowDateTime,
        expectedReturnDate: expectedReturnDateTime,
        notes: notes.trim() || null,
      }, {
        withCredentials: true
      });
      navigate("/borrowings");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal menambahkan peminjaman");
      } else {
        setMsg("Gagal menambahkan peminjaman");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "0.75rem" }}>
      <div className="level is-mobile mb-5">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50" }}>
                Tambah Peminjaman Baru
              </h1>
              <h2 className="subtitle is-6 has-text-grey">
                Buat peminjaman barang baru
              </h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link 
              to="/borrowings" 
              className="button is-light"
              style={{ borderRadius: "8px" }}
            >
              <span className="icon">
                <i className="fas fa-arrow-left"></i>
              </span>
              <span className="is-hidden-mobile">Kembali</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="columns is-centered">
        <div className="column is-full-mobile is-8-tablet is-6-desktop">
          <div className="box" style={{
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            border: "none"
          }}>
            <form onSubmit={saveBorrowing}>
              {msg && (
                <div className="notification is-danger is-light" style={{ borderRadius: "8px" }}>
                  <button
                    className="delete"
                    onClick={() => setMsg("")}
                  ></button>
                  {msg}
                </div>
              )}

              <div className="field">
                <label className="label has-text-weight-semibold">
                  Produk <span className="has-text-danger">*</span>
                </label>
                <div className="control has-icons-left">
                  {isLoadingProducts ? (
                    <div className="select is-fullwidth is-loading" style={{ borderRadius: "8px" }}>
                      <select disabled style={{ borderRadius: "8px" }}>
                        <option>Memuat produk...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="select is-fullwidth">
                      <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        required
                        style={{ 
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      >
                        <option value="">Pilih Produk</option>
                        {products.map((product) => (
                          <option key={product.uuid} value={product.uuid}>
                            {product.name} - {product.merek} ({product.serialNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <span className="icon is-small is-left" style={{ pointerEvents: "none" }}>
                    <i className="fas fa-box"></i>
                  </span>
                </div>
                <p className="help">
                  Pilih produk yang akan dipinjam
                </p>
              </div>

              <div className="field">
                <label className="label has-text-weight-semibold">
                  Nama Peminjam <span className="has-text-danger">*</span>
                </label>
                <div className="control has-icons-left">
                  <input
                    type="text"
                    className="input"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="Masukkan nama peminjam"
                    required
                    minLength="3"
                    maxLength="255"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0"
                    }}
                  />
                  <span className="icon is-small is-left">
                    <i className="fas fa-user"></i>
                  </span>
                </div>
                <p className="help">
                  Masukkan nama peminjam (minimal 3 karakter, maksimal 255 karakter)
                </p>
                {borrowerName && borrowerName.length > 0 && borrowerName.length < 3 && (
                  <p className="help has-text-danger">
                    Nama peminjam minimal 3 karakter (tersisa {3 - borrowerName.length} karakter)
                  </p>
                )}
                {borrowerName && borrowerName.length > 255 && (
                  <p className="help has-text-danger">
                    Nama peminjam maksimal 255 karakter (kelebihan {borrowerName.length - 255} karakter)
                  </p>
                )}
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label has-text-weight-semibold">
                      Tanggal Pinjam <span className="has-text-danger">*</span>
                    </label>
                    <div className="control has-icons-left">
                      <input
                        type="date"
                        className="input"
                        value={borrowDate}
                        onChange={(e) => setBorrowDate(e.target.value)}
                        required
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-calendar"></i>
                      </span>
                    </div>
                    <p className="help">
                      Tanggal kapan barang dipinjam
                    </p>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label has-text-weight-semibold">
                      Jam Pengambilan <span className="has-text-danger">*</span>
                    </label>
                    <div className="control has-icons-left">
                      <input
                        type="time"
                        className="input"
                        value={borrowTime}
                        onChange={(e) => setBorrowTime(e.target.value)}
                        required
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-clock"></i>
                      </span>
                    </div>
                    <p className="help">
                      Jam kapan barang diambil
                    </p>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label has-text-weight-semibold">
                      Tanggal Kembali (Diharapkan) <span className="has-text-danger">*</span>
                    </label>
                    <div className="control has-icons-left">
                      <input
                        type="date"
                        className="input"
                        value={expectedReturnDate}
                        onChange={(e) => setExpectedReturnDate(e.target.value)}
                        required
                        min={borrowDate}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-calendar-check"></i>
                      </span>
                    </div>
                    <p className="help">
                      Tanggal kapan barang diharapkan dikembalikan
                    </p>
                    {borrowDate && expectedReturnDate && new Date(expectedReturnDate) <= new Date(borrowDate) && (
                      <p className="help has-text-danger">
                        Tanggal kembali harus setelah tanggal pinjam
                      </p>
                    )}
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label has-text-weight-semibold">
                      Jam Pengembalian (Diharapkan) <span className="has-text-danger">*</span>
                    </label>
                    <div className="control has-icons-left">
                      <input
                        type="time"
                        className="input"
                        value={expectedReturnTime}
                        onChange={(e) => setExpectedReturnTime(e.target.value)}
                        required
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-clock"></i>
                      </span>
                    </div>
                    <p className="help">
                      Jam kapan barang diharapkan dikembalikan
                    </p>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label has-text-weight-semibold">
                  Catatan
                </label>
                <div className="control">
                  <textarea
                    className="textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan (opsional)"
                    rows="3"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0"
                    }}
                  />
                </div>
                <p className="help">
                  Tambahkan catatan tambahan tentang peminjaman ini (opsional)
                </p>
              </div>

              <div className="field is-grouped mt-5">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-primary"
                    disabled={isLoading}
                    style={{ borderRadius: "8px" }}
                  >
                    {isLoading ? (
                      <>
                        <span className="icon">
                          <i className="fas fa-spinner fa-spin"></i>
                        </span>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <span className="icon">
                          <i className="fas fa-save"></i>
                        </span>
                        <span>Simpan</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="control">
                  <Link to="/borrowings" className="button is-light" style={{ borderRadius: "8px" }}>
                    Batal
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormAddBorrowing;

