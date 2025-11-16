import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormEditBorrowing = () => {
  const { id } = useParams();
  const [productId, setProductId] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [borrowTime, setBorrowTime] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [expectedReturnTime, setExpectedReturnTime] = useState("");
  const [actualReturnDate, setActualReturnDate] = useState("");
  const [actualReturnTime, setActualReturnTime] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchBorrowing();
  }, [id]);

  // Auto-fill actualReturnTime when actualReturnDate is set, clear when date is removed
  useEffect(() => {
    if (actualReturnDate && !actualReturnTime) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setActualReturnTime(`${hours}:${minutes}`);
    } else if (!actualReturnDate) {
      setActualReturnTime("");
    }
  }, [actualReturnDate, actualReturnTime]);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      // Filter hanya produk yang tersedia atau produk yang sedang dipinjam (untuk edit)
      // Ini memungkinkan edit borrowing meskipun produk sedang dipinjam
      const availableProducts = response.data.filter(product => {
        const status = product.status;
        // Include produk yang tersedia atau produk yang sedang dipinjam (untuk edit)
        return status === 'tersedia' || status === 'dipinjam' || !status || status === null || status === undefined || status === '';
      });
      setProducts(availableProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setMsg("Gagal memuat daftar produk");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchBorrowing = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/borrowings/${id}`);
      const borrowing = response.data;
      
      setProductId(borrowing.product?.uuid || "");
      setBorrowerName(borrowing.namaPeminjam || borrowing.borrowerName || "");
      
      // Format dates and times for input
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const formatTimeForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };
      
      setBorrowDate(formatDateForInput(borrowing.borrowDate));
      setBorrowTime(formatTimeForInput(borrowing.borrowDate));
      setExpectedReturnDate(formatDateForInput(borrowing.expectedReturnDate));
      setExpectedReturnTime(formatTimeForInput(borrowing.expectedReturnDate));
      setActualReturnDate(formatDateForInput(borrowing.actualReturnDate || borrowing.returnDate));
      setActualReturnTime(formatTimeForInput(borrowing.actualReturnDate || borrowing.returnDate));
      setStatus(borrowing.status || "");
      setNotes(borrowing.notes || "");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal memuat data peminjaman");
      } else {
        setMsg("Gagal memuat data peminjaman");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateBorrowing = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSaving(true);

    // Validation
    if (!productId || !borrowerName || !borrowDate || !expectedReturnDate) {
      setMsg("Produk, Nama Peminjam, Tanggal Pinjam, dan Tanggal Kembali harus diisi");
      setIsSaving(false);
      return;
    }

    if (borrowerName.trim().length < 2) {
      setMsg("Nama peminjam minimal 2 karakter");
      setIsSaving(false);
      return;
    }

    if (borrowerName.trim().length > 100) {
      setMsg("Nama peminjam maksimal 100 karakter");
      setIsSaving(false);
      return;
    }

    const borrow = new Date(borrowDate);
    const expectedReturn = new Date(expectedReturnDate);

    if (expectedReturn <= borrow) {
      setMsg("Tanggal kembali harus setelah tanggal pinjam");
      setIsSaving(false);
      return;
    }

    // Validation: if actualReturnDate is filled, actualReturnTime should also be filled
    if (actualReturnDate && !actualReturnTime) {
      setMsg("Jika tanggal kembali aktual diisi, jam pengembalian juga harus diisi");
      setIsSaving(false);
      return;
    }

    // Combine date and time
    const borrowDateTime = borrowTime ? `${borrowDate}T${borrowTime}:00` : `${borrowDate}T00:00:00`;
    const expectedReturnDateTime = expectedReturnTime ? `${expectedReturnDate}T${expectedReturnTime}:00` : `${expectedReturnDate}T00:00:00`;
    const actualReturnDateTime = actualReturnDate && actualReturnTime 
      ? `${actualReturnDate}T${actualReturnTime}:00` 
      : null;

    try {
      await axios.patch(`${API_BASE_URL}/borrowings/${id}`, {
        productId: productId.trim(),
        namaPeminjam: borrowerName.trim(),
        borrowDate: borrowDateTime,
        expectedReturnDate: expectedReturnDateTime,
        actualReturnDate: actualReturnDateTime,
        status: status,
        notes: notes.trim() || null,
      });
      navigate("/borrowings");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal mengupdate peminjaman");
      } else {
        setMsg("Gagal mengupdate peminjaman");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="has-text-centered py-6">
        <span className="icon is-large">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
        </span>
        <p className="mt-3">Memuat data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.75rem" }}>
      <div className="level is-mobile mb-5">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50" }}>
                Edit Peminjaman
              </h1>
              <h2 className="subtitle is-6 has-text-grey">
                Edit data peminjaman
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
            <form onSubmit={updateBorrowing}>
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
                    minLength="2"
                    maxLength="100"
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
                  Masukkan nama peminjam (minimal 2 karakter, maksimal 100 karakter)
                </p>
                {borrowerName && borrowerName.length < 2 && (
                  <p className="help has-text-danger">
                    Nama peminjam minimal 2 karakter (tersisa {2 - borrowerName.length} karakter)
                  </p>
                )}
                {borrowerName && borrowerName.length > 100 && (
                  <p className="help has-text-danger">
                    Nama peminjam maksimal 100 karakter (kelebihan {borrowerName.length - 100} karakter)
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

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label has-text-weight-semibold">
                      Tanggal Kembali (Aktual)
                    </label>
                    <div className="control has-icons-left">
                      <input
                        type="date"
                        className="input"
                        value={actualReturnDate}
                        onChange={(e) => setActualReturnDate(e.target.value)}
                        min={borrowDate}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-calendar-times"></i>
                      </span>
                    </div>
                    <p className="help">
                      Kosongkan jika barang belum dikembalikan. Jika diisi, jam pengembalian juga harus diisi.
                    </p>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label has-text-weight-semibold">
                      Jam Pengembalian (Aktual)
                    </label>
                    <div className="control has-icons-left">
                      <input
                        type="time"
                        className="input"
                        value={actualReturnTime}
                        onChange={(e) => setActualReturnTime(e.target.value)}
                        disabled={!actualReturnDate}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          opacity: !actualReturnDate ? 0.5 : 1
                        }}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-clock"></i>
                      </span>
                    </div>
                    <p className="help">
                      Jam kapan barang dikembalikan (jika sudah dikembalikan)
                    </p>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label has-text-weight-semibold">
                  Status
                </label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{ 
                        width: "100%",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                    >
                      <option value="dipinjam">Dipinjam</option>
                      <option value="dikembalikan">Dikembalikan</option>
                      <option value="terlambat">Terlambat</option>
                    </select>
                  </div>
                </div>
                <p className="help">
                  Status akan otomatis diupdate berdasarkan tanggal jika tidak diubah manual
                </p>
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
              </div>

              <div className="field is-grouped mt-5">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-primary"
                    disabled={isSaving}
                    style={{ borderRadius: "8px" }}
                  >
                    {isSaving ? (
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

export default FormEditBorrowing;

