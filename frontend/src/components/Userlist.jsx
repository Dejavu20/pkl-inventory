import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const Userlist = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat data user");
      } else {
        setError("Gagal memuat data user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`);
      setDeleteConfirm(null);
      getUsers();
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus user");
      } else {
        setError("Gagal menghapus user");
      }
    }
  };

  const confirmDelete = (userId, userName) => {
    setDeleteConfirm({ userId, userName });
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="level is-mobile mb-5">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50" }}>
                Manajemen User
              </h1>
              <h2 className="subtitle is-6 has-text-grey">
                Daftar semua user dalam sistem
              </h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link 
              to="/users/add" 
              className="button is-primary"
              style={{ borderRadius: "8px" }}
            >
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span className="is-hidden-mobile">Tambah User</span>
              <span className="is-hidden-tablet">+</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="notification is-danger is-light" style={{ borderRadius: "8px" }}>
          <button className="delete" onClick={() => setError("")}></button>
          {error}
        </div>
      )}

      {deleteConfirm && (
        <div className="modal is-active">
          <div className="modal-background" onClick={cancelDelete}></div>
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
                  Konfirmasi Hapus User
                </h2>
                <p className="subtitle is-6 has-text-grey mb-4">
                  Apakah Anda yakin ingin menghapus user ini?
                </p>
              </div>
              
              <div className="notification is-danger is-light" style={{ borderRadius: "8px" }}>
                <p className="has-text-weight-semibold mb-2">
                  <span className="icon mr-2">
                    <i className="fas fa-info-circle"></i>
                  </span>
                  User yang akan dihapus:
                </p>
                <p className="is-size-6">
                  <strong>{deleteConfirm.userName}</strong>
                </p>
              </div>

              <div className="notification is-warning is-light mt-4" style={{ borderRadius: "8px" }}>
                <p className="is-size-7">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan.
                  User akan dihapus secara permanen.
                </p>
              </div>

              <div className="buttons is-centered mt-5">
                <button
                  className="button is-light"
                  onClick={cancelDelete}
                  style={{ borderRadius: "8px", minWidth: "120px" }}
                >
                  <span className="icon">
                    <i className="fas fa-times"></i>
                  </span>
                  <span>Batal</span>
                </button>
                <button
                  className="button is-danger"
                  onClick={() => deleteUser(deleteConfirm.userId)}
                  style={{ borderRadius: "8px", minWidth: "120px" }}
                >
                  <span className="icon">
                    <i className="fas fa-trash"></i>
                  </span>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="has-text-centered py-6">
          <span className="icon is-large">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </span>
          <p className="mt-3">Memuat data...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="notification is-info is-light">
          <p>Tidak ada user yang ditemukan.</p>
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
                  }}>Nama</th>
                  <th className="is-hidden-mobile" style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>Email</th>
                  <th style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>Role</th>
                  <th className="has-text-centered" style={{
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr 
                    key={user.uuid}
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
                      <strong style={{ color: "#2c3e50" }}>{user.name}</strong>
                      <br className="is-hidden-tablet" />
                      <span className="is-size-7 has-text-grey is-hidden-tablet">
                        {user.email}
                      </span>
                    </td>
                    <td className="is-hidden-mobile" style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <span className="has-text-grey">{user.email || "-"}</span>
                    </td>
                    <td style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <span
                        className={`tag ${
                          user.role && user.role.toLowerCase() === "admin"
                            ? "is-danger"
                            : "is-info"
                        }`}
                        style={{ borderRadius: "6px" }}
                      >
                        {user.role || "User"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 0.75rem", verticalAlign: "middle" }}>
                      <div className="buttons are-small is-flex-wrap-wrap">
                        <Link
                          to={`/users/edit/${user.uuid}`}
                          className="button is-info is-light"
                          title="Edit User"
                          style={{ borderRadius: "6px" }}
                        >
                          <span className="icon">
                            <i className="fas fa-edit"></i>
                          </span>
                          <span className="is-hidden-mobile">Edit</span>
                        </Link>
                        <button
                          onClick={() => confirmDelete(user.uuid, user.name)}
                          className="button is-danger is-light"
                          title="Hapus User"
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
    </div>
  );
};

export default Userlist;
