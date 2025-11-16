import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormAddProduct = () => {
  const [name, setName] = useState("");
  const [merek, setMerek] = useState("");
  const [kategori, setKategori] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMsg("File harus berupa gambar");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMsg("Ukuran file maksimal 5MB");
        return;
      }
      
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setMsg("");
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSaving(true);
    
    try {
      let imageBase64 = null;
      
      // Convert image to base64 if exists
      if (image) {
        imageBase64 = await convertImageToBase64(image);
      }
      
      await axios.post(`${API_BASE_URL}/products`, {
        name: name.trim(),
        merek: merek.trim(),
        kategori: kategori && kategori !== "all" ? kategori.trim() : null,
        image: imageBase64,
      }, {
        withCredentials: true
      });
      navigate("/products");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal menambahkan produk");
      } else {
        setMsg("Gagal menambahkan produk");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="title">Products</h1>
      <h2 className="subtitle">Add New Product</h2>
      <div className="card is-shadowless">
        <div className="card-content">
          <div className="content">
            <form onSubmit={saveProduct}>
              {msg && (
                <div className="notification is-danger is-light">
                  <button className="delete" onClick={() => setMsg("")}></button>
                  {msg}
                </div>
              )}
              <div className="notification is-info is-light">
                <p className="is-size-7">
                  <strong>Catatan:</strong> Produk baru akan otomatis diset sebagai <strong>"Tersedia"</strong> dan Serial Number akan otomatis dibuat.
                </p>
              </div>
              <div className="field">
                <label className="label">Nama Produk <span className="has-text-danger">*</span></label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama produk"
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Merek <span className="has-text-danger">*</span></label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={merek}
                    onChange={(e) => setMerek(e.target.value)}
                    placeholder="Masukkan merek produk"
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Kategori</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="input"
                      style={{ width: "100%", borderRadius: "4px" }}
                    >
                      <option value="">Pilih Kategori (Opsional)</option>
                      {isLoadingCategories ? (
                        <option disabled>Memuat kategori...</option>
                      ) : (
                        categories.map((category) => (
                          <option key={category.uuid} value={category.name}>
                            {category.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                <p className="help">Pilih kategori untuk produk ini (opsional)</p>
              </div>

              <div className="field">
                <label className="label">Foto Produk</label>
                <div className="control">
                  {!imagePreview ? (
                    <div className="file has-name is-fullwidth">
                      <label className="file-label">
                        <input
                          className="file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <span className="file-cta">
                          <span className="file-icon">
                            <i className="fas fa-upload"></i>
                          </span>
                          <span className="file-label">Pilih Foto</span>
                        </span>
                        <span className="file-name">Tidak ada file dipilih</span>
                      </label>
                    </div>
                  ) : (
                    <div className="box" style={{ padding: "1rem", borderRadius: "8px" }}>
                      <div className="is-flex is-align-items-center">
                        <figure className="image is-128x128 mr-3" style={{ margin: 0 }}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              objectFit: "cover",
                              borderRadius: "8px",
                              width: "100%",
                              height: "100%"
                            }}
                          />
                        </figure>
                        <div className="is-flex-grow-1">
                          <p className="is-size-7 has-text-grey mb-2">
                            {image?.name || "Preview"}
                          </p>
                          <button
                            type="button"
                            className="button is-danger is-small"
                            onClick={removeImage}
                            style={{ borderRadius: "4px" }}
                          >
                            <span className="icon is-small">
                              <i className="fas fa-trash"></i>
                            </span>
                            <span>Hapus Foto</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="help">Upload foto produk (opsional, maksimal 5MB)</p>
              </div>

              <div className="field is-grouped">
                <div className="control">
                  <button 
                    type="submit" 
                    className="button is-success" 
                    style={{ borderRadius: "4px" }}
                    disabled={isSaving}
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
                  <button
                    type="button"
                    className="button is-light"
                    onClick={() => navigate("/products")}
                    style={{ borderRadius: "4px" }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormAddProduct;
