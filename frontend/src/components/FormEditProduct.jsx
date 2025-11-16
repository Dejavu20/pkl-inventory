import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormEditProduct = () => {
  const [name, setName] = useState("");
  const [merek, setMerek] = useState("");
  const [kategori, setKategori] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Continue even if categories fail to load
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMsg("File harus berupa gambar");
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMsg("Ukuran gambar maksimal 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage("");
    setImagePreview("");
  };

  useEffect(() => {
    const getProductById = async () => {
      try {
        setIsFetching(true);
        setMsg("");
        const response = await axios.get(
          `${API_BASE_URL}/products/${id}`
        );
        setName(response.data.name || "");
        setMerek(response.data.merek || "");
        setKategori(response.data.kategori || "");
        setSerialNumber(response.data.serialNumber || "");
        setImage(response.data.image || "");
        setImagePreview(response.data.image || "");
      } catch (error) {
        if (error.response) {
          setMsg(error.response.data.msg || "Gagal memuat data produk");
        } else {
          setMsg("Gagal memuat data produk");
        }
      } finally {
        setIsFetching(false);
      }
    };
    getProductById();
  }, [id]);

  const updateProduct = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    // Validasi client-side
    if (!name || !merek) {
      setMsg("Nama dan Merek harus diisi");
      setIsLoading(false);
      return;
    }

    if (name.trim().length < 3) {
      setMsg("Nama produk minimal 3 karakter");
      setIsLoading(false);
      return;
    }

    if (name.trim().length > 100) {
      setMsg("Nama produk maksimal 100 karakter");
      setIsLoading(false);
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/products/${id}`, {
        name: name.trim(),
        merek: merek.trim(),
        kategori: kategori.trim() || null,
        image: image || null,
      });
      navigate("/products");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal mengupdate produk");
      } else {
        setMsg("Gagal mengupdate produk");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container">
        <div className="has-text-centered py-6">
          <span className="icon is-large">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </span>
          <p className="mt-3">Memuat data produk...</p>
        </div>
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
                Edit Produk
              </h1>
              <h2 className="subtitle is-6 has-text-grey">
                Update informasi produk
              </h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link 
              to="/products" 
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
              <form onSubmit={updateProduct}>
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
                    Nama Produk <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama produk"
                      required
                      minLength="3"
                      maxLength="100"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-box"></i>
                    </span>
                  </div>
                  <p className="help">
                    Nama produk harus antara 3 hingga 100 karakter
                  </p>
                  {name && name.length < 3 && (
                    <p className="help has-text-danger">
                      Nama produk minimal 3 karakter (tersisa {3 - name.length} karakter)
                    </p>
                  )}
                  {name && name.length > 100 && (
                    <p className="help has-text-danger">
                      Nama produk maksimal 100 karakter (kelebihan {name.length - 100} karakter)
                    </p>
                  )}
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">
                    Merek <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={merek}
                      onChange={(e) => setMerek(e.target.value)}
                      placeholder="Masukkan merek produk"
                      required
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-tag"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">
                    Kategori
                  </label>
                  <div className="control has-icons-left">
                    {isLoadingCategories ? (
                      <div className="select is-fullwidth is-loading" style={{ borderRadius: "8px" }}>
                        <select disabled style={{ borderRadius: "8px" }}>
                          <option>Memuat kategori...</option>
                        </select>
                      </div>
                    ) : (
                      <div className="select is-fullwidth">
                        <select
                          value={kategori}
                          onChange={(e) => setKategori(e.target.value)}
                          style={{ 
                            width: "100%",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0"
                          }}
                        >
                          <option value="">Pilih Kategori (Opsional)</option>
                          {categories.map((cat) => (
                            <option key={cat.uuid} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                          {/* Show current kategori if it's not in the list */}
                          {kategori && !categories.find(cat => cat.name === kategori) && (
                            <option value={kategori} disabled>
                              {kategori} (tidak tersedia)
                            </option>
                          )}
                        </select>
                      </div>
                    )}
                    <span className="icon is-small is-left" style={{ pointerEvents: "none" }}>
                      <i className="fas fa-filter"></i>
                    </span>
                  </div>
                  <p className="help">
                    Pilih kategori dari daftar yang tersedia. Admin dapat menambahkan kategori baru di halaman Categories.
                  </p>
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">
                    Gambar Produk
                  </label>
                  <div className="control">
                    {!imagePreview ? (
                      <div className="file has-name is-fullwidth">
                        <label className="file-label">
                          <input
                            ref={fileInputRef}
                            className="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <span className="file-cta" style={{
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0"
                          }}>
                            <span className="file-icon">
                              <i className="fas fa-upload"></i>
                            </span>
                            <span className="file-label">
                              Pilih Gambar
                            </span>
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div>
                        <div className="box" style={{
                          padding: "0.5rem",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          position: "relative",
                          display: "inline-block"
                        }}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              borderRadius: "8px",
                              objectFit: "cover"
                            }}
                          />
                          <button
                            type="button"
                            className="button is-danger is-small"
                            onClick={removeImage}
                            style={{
                              position: "absolute",
                              top: "0.5rem",
                              right: "0.5rem",
                              borderRadius: "50%",
                              width: "32px",
                              height: "32px",
                              padding: 0
                            }}
                          >
                            <span className="icon is-small">
                              <i className="fas fa-times"></i>
                            </span>
                          </button>
                        </div>
                        <button
                          type="button"
                          className="button is-light is-small mt-2"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ borderRadius: "8px" }}
                        >
                          <span className="icon">
                            <i className="fas fa-edit"></i>
                          </span>
                          <span>Ganti Gambar</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          className="file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: "none" }}
                        />
                      </div>
                    )}
                  </div>
                  <p className="help">
                    Upload gambar produk (JPG, PNG, maksimal 2MB)
                  </p>
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">Serial Number</label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={serialNumber || ""}
                      placeholder="Serial Number (read-only)"
                      disabled
                      readOnly
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "#f5f5f5"
                      }}
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-barcode"></i>
                    </span>
                  </div>
                  <p className="help">Serial number dibuat otomatis dan tidak dapat diubah</p>
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
                          <span>Update</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="control">
                    <Link to="/products" className="button is-light" style={{ borderRadius: "8px" }}>
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

export default FormEditProduct;
