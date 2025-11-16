import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoginUser, reset } from "../features/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user || isSuccess) {
      navigate("/dashboard");
    }
    dispatch(reset());
  }, [user, isSuccess, dispatch, navigate]);

  const Auth = (e) => {
    e.preventDefault();
    dispatch(LoginUser({ email, password }));
  };

  return (
    <section 
      className="hero is-fullheight" 
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div className="container" style={{ width: "100%", maxWidth: "450px" }}>
        <div className="box" style={{
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          border: "none",
          padding: "2.5rem 2rem"
        }}>
          <form onSubmit={Auth}>
            <div className="has-text-centered mb-5">
              <div className="icon is-large mb-4" style={{ color: "#667eea" }}>
                <i className="fas fa-boxes fa-3x"></i>
              </div>
              <h1 className="title is-3 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.5rem" }}>
                Inventory System
              </h1>
              <p className="subtitle is-6 has-text-grey">
                Silakan masuk untuk melanjutkan
              </p>
            </div>

            {isError && (
              <div className="notification is-danger is-light" style={{ borderRadius: "8px" }}>
                <button className="delete" onClick={() => {}}></button>
                <p className="has-text-centered">{message}</p>
              </div>
            )}

            <div className="field">
              <label className="label has-text-weight-semibold">
                Email
              </label>
              <div className="control has-icons-left">
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  required
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    padding: "0.75rem 0.75rem 0.75rem 2.5rem"
                  }}
                />
                <span className="icon is-small is-left" style={{ 
                  left: "0.5rem",
                  pointerEvents: "none",
                  zIndex: 1
                }}>
                  <i className="fas fa-envelope"></i>
                </span>
              </div>
            </div>

            <div className="field">
              <label className="label has-text-weight-semibold">
                Password
              </label>
              <div className="control has-icons-left">
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  required
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    padding: "0.75rem 0.75rem 0.75rem 2.5rem"
                  }}
                />
                <span className="icon is-small is-left" style={{ 
                  left: "0.5rem",
                  pointerEvents: "none",
                  zIndex: 1
                }}>
                  <i className="fas fa-lock"></i>
                </span>
              </div>
            </div>

            <div className="field mt-5">
              <button
                type="submit"
                className="button is-primary is-fullwidth"
                disabled={isLoading}
                style={{
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                }}
              >
                {isLoading ? (
                  <>
                    <span className="icon">
                      <i className="fas fa-spinner fa-spin"></i>
                    </span>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span className="icon">
                      <i className="fas fa-sign-in-alt"></i>
                    </span>
                    <span>Masuk</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
