import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat data kategori");
      } else {
        setError("Gagal memuat data kategori");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: "", description: "" });
    setShowAddModal(true);
    setError("");
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ name: "", description: "" });
    setError("");
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setError("");
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setError("");
  };

  const openDeleteConfirm = (category) => {
    setCategoryToDelete(category);
  };

  const closeDeleteConfirm = () => {
    setCategoryToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation
    if (!formData.name || formData.name.trim() === "") {
      setError("Nama kategori harus diisi");
      setIsSubmitting(false);
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Nama kategori minimal 2 karakter");
      setIsSubmitting(false);
      return;
    }

    if (formData.name.trim().length > 50) {
      setError("Nama kategori maksimal 50 karakter");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingCategory) {
        // Update category
        await axios.patch(`${API_BASE_URL}/categories/${editingCategory.uuid}`, {
          name: formData.name.trim(),
          description: formData.description.trim() || null
        });
        setSuccess("Kategori berhasil diupdate!");
      } else {
        // Create category
        await axios.post(`${API_BASE_URL}/categories`, {
          name: formData.name.trim(),
          description: formData.description.trim() || null
        });
        setSuccess("Kategori berhasil ditambahkan!");
      }
      closeAddModal();
      closeEditModal();
      getCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menyimpan kategori");
      } else {
        setError("Gagal menyimpan kategori");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      setError("");
      setSuccess("");
      await axios.delete(`${API_BASE_URL}/categories/${categoryToDelete.uuid}`);
      setSuccess("Kategori berhasil dihapus!");
      closeDeleteConfirm();
      getCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus kategori");
      } else {
        setError("Gagal menghapus kategori");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="level is-mobile mb-5">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50" }}>
                Manajemen Kategori
              </h1>
              <h2 className="subtitle is-6 has-text-grey">
                Kelola kategori produk
              </h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button
              onClick={openAddModal}
              className="button is-primary"
              style={{ borderRadius: "8px" }}
            >
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Tambah Kategori</span>
            </button>
          </div>
        </div>
      </div>

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

      {isLoading ? (
        <div className="has-text-centered py-6">
          <span className="icon is-large">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </span>
          <p className="mt-3">Memuat data...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="notification is-info is-light">
          <p>Tidak ada kategori. Klik "Tambah Kategori" untuk menambahkan kategori pertama.</p>
        </div>
      ) : (
        <div className="box" style={{
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "none"
        }}>
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table className="table is-fullwidth" style={{ margin: 0 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>No</th>
                  <th style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>Nama Kategori</th>
                  <th style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>Deskripsi</th>
                  <th className="has-text-centered" style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr
                    key={category.uuid}
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
                      <strong style={{ color: "#2c3e50" }}>{category.name}</strong>
                    </td>
                    <td style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <span className="has-text-grey">
                        {category.description || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <div className="buttons are-small is-flex-wrap-wrap">
                        <button
                          onClick={() => openEditModal(category)}
                          className="button is-info is-light"
                          title="Edit Kategori"
                          style={{ borderRadius: "6px" }}
                        >
                          <span className="icon">
                            <i className="fas fa-edit"></i>
                          </span>
                          <span className="is-hidden-mobile">Edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(category)}
                          className="button is-danger is-light"
                          title="Hapus Kategori"
                          style={{ borderRadius: "6px" }}
                        >
                          <span className="icon">
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

      {/* Add/Edit Modal */}
      {(showAddModal || editingCategory) && (
        <div className="modal is-active">
          <div className="modal-background" onClick={editingCategory ? closeEditModal : closeAddModal}></div>
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="box" style={{
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              border: "none"
            }}>
              <h2 className="title is-4 has-text-weight-bold" style={{ color: "#2c3e50" }}>
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h2>

              {error && (
                <div className="notification is-danger is-light">
                  <button className="delete" onClick={() => setError("")}></button>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">
                    Nama Kategori <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama kategori"
                      required
                      minLength="2"
                      maxLength="50"
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-tag"></i>
                    </span>
                  </div>
                  <p className="help">
                    Nama kategori harus antara 2 hingga 50 karakter
                  </p>
                </div>

                <div className="field">
                  <label className="label">Deskripsi</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Masukkan deskripsi kategori (opsional)"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="field is-grouped mt-5">
                  <div className="control">
                    <button
                      type="submit"
                      className="button is-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
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
                      onClick={editingCategory ? closeEditModal : closeAddModal}
                      disabled={isSubmitting}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={editingCategory ? closeEditModal : closeAddModal}
            disabled={isSubmitting}
          ></button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeDeleteConfirm}></div>
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="box" style={{
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              border: "none"
            }}>
              <div className="has-text-centered">
                <div className="icon is-large mb-4" style={{ color: "#f14668" }}>
                  <i className="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <h2 className="title is-4 has-text-weight-bold" style={{ color: "#2c3e50" }}>
                  Konfirmasi Hapus Kategori
                </h2>
                <p className="subtitle is-6 has-text-grey mb-4">
                  Apakah Anda yakin ingin menghapus kategori ini?
                </p>

                <div className="notification is-danger is-light" style={{
                  textAlign: "left",
                  borderRadius: "8px"
                }}>
                  <p className="has-text-weight-semibold mb-2">
                    <span className="icon mr-2">
                      <i className="fas fa-info-circle"></i>
                    </span>
                    Kategori yang akan dihapus:
                  </p>
                  <div className="content is-small">
                    <p className="mb-1">
                      <strong>Nama:</strong> {categoryToDelete.name}
                    </p>
                    {categoryToDelete.description && (
                      <p className="mb-1">
                        <strong>Deskripsi:</strong> {categoryToDelete.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="notification is-warning is-light mt-4" style={{ borderRadius: "8px" }}>
                  <p className="is-size-7">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan.
                    Kategori akan dihapus secara permanen.
                  </p>
                </div>
              </div>

              <div className="buttons is-centered mt-5">
                <button
                  className="button is-light"
                  onClick={closeDeleteConfirm}
                  disabled={isDeleting}
                  style={{ borderRadius: "8px", minWidth: "120px" }}
                >
                  <span className="icon">
                    <i className="fas fa-times"></i>
                  </span>
                  <span>Batal</span>
                </button>
                <button
                  onClick={confirmDelete}
                  className="button is-danger"
                  disabled={isDeleting}
                  style={{ borderRadius: "8px", minWidth: "120px" }}
                >
                  {isDeleting ? (
                    <>
                      <span className="icon">
                        <i className="fas fa-spinner fa-spin"></i>
                      </span>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <span className="icon">
                        <i className="fas fa-trash"></i>
                      </span>
                      <span>Hapus</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={closeDeleteConfirm}
            disabled={isDeleting}
          ></button>
        </div>
      )}
    </div>
  );
};

export default CategoryList;







