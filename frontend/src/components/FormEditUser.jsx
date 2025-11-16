import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormEditUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("User");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getUserById = async () => {
      try {
        setIsFetching(true);
        setMsg("");
        const response = await axios.get(`${API_BASE_URL}/users/${id}`);
        setName(response.data.name || "");
        setEmail(response.data.email || "");
        setRole(response.data.role || "User");
      } catch (error) {
        if (error.response) {
          setMsg(error.response.data.msg || "Gagal memuat data user");
        } else {
          setMsg("Gagal memuat data user");
        }
      } finally {
        setIsFetching(false);
      }
    };
    getUserById();
  }, [id]);

  const updateUser = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    // Validation
    if (!name || !email || !role) {
      setMsg("Nama, Email, dan Role harus diisi");
      setIsLoading(false);
      return;
    }

    // Only validate password if it's provided
    if (password || confPassword) {
      if (password !== confPassword) {
        setMsg("Password dan Konfirmasi Password tidak cocok");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setMsg("Password minimal 6 karakter");
        setIsLoading(false);
        return;
      }
    }

    try {
      await axios.patch(`${API_BASE_URL}/users/${id}`, {
        name: name,
        email: email,
        password: password || "",
        confPassword: confPassword || "",
        role: role,
      });
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal mengupdate user");
      } else {
        setMsg("Gagal mengupdate user");
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
          <p className="mt-3">Memuat data user...</p>
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
                Edit User
              </h1>
              <h2 className="subtitle is-6 has-text-grey">
                Update informasi user
              </h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link 
              to="/users" 
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
              <form onSubmit={updateUser}>
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
                    Nama <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama"
                      required
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-user"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">
                    Email <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email"
                      required
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-envelope"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">Password</label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak ingin mengubah password"
                      minLength="6"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-lock"></i>
                    </span>
                  </div>
                  <p className="help">
                    Kosongkan jika tidak ingin mengubah password
                  </p>
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">Konfirmasi Password</label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      className="input"
                      value={confPassword}
                      onChange={(e) => setConfPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      minLength="6"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-lock"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">
                    Role <span className="has-text-danger">*</span>
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <p className="help">
                    Admin memiliki akses penuh untuk mengelola user
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
                          <span>Update</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="control">
                    <Link to="/users" className="button is-light" style={{ borderRadius: "8px" }}>
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

export default FormEditUser;
