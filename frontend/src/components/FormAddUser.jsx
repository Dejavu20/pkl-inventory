import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormAddUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("User");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const saveUser = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    // Validation
    if (!name || !email || !password || !confPassword || !role) {
      setMsg("Semua field harus diisi");
      setIsLoading(false);
      return;
    }

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

    try {
      await axios.post(`${API_BASE_URL}/users`, {
        name: name,
        email: email,
        password: password,
        confPassword: confPassword,
        role: role,
      });
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal menambahkan user");
      } else {
        setMsg("Gagal menambahkan user");
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
                Tambah User Baru
              </h1>
              <h2 className="subtitle is-6 has-text-grey">
                Buat user baru untuk sistem
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
              <form onSubmit={saveUser}>
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
                  <label className="label has-text-weight-semibold">
                    Password <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
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
                  <p className="help">Password minimal 6 karakter</p>
                </div>

                <div className="field">
                  <label className="label has-text-weight-semibold">
                    Konfirmasi Password <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      className="input"
                      value={confPassword}
                      onChange={(e) => setConfPassword(e.target.value)}
                      placeholder="Ulangi password"
                      required
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
                          <span>Simpan</span>
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

export default FormAddUser;
