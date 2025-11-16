import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); 

  const logout = () => {
    dispatch(LogOut());
    dispatch(reset());
    navigate("/");
  };

  return (
    <nav
      className="navbar is-fixed-top has-shadow"
      role="navigation"
      aria-label="main navigation"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "4rem"
      }}
    >
      <div className="navbar-brand" style={{ marginLeft: "1rem" }}>
        <NavLink 
          to="/dashboard" 
          className="navbar-item"
          style={{ 
            color: "white",
            fontWeight: "bold",
            fontSize: "1.25rem",
            padding: "0.75rem 1rem"
          }}
        >
          <span className="icon mr-2" style={{ color: "white" }}>
            <i className="fas fa-boxes fa-lg"></i>
          </span>
          <span>Inventory System</span>
        </NavLink>

        <a
          href="!#"
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          onClick={(e) => {
            e.preventDefault();
            if (onMenuClick) onMenuClick();
          }}
          style={{ color: "white" }}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-end" style={{ marginRight: "1rem" }}>
          {user && user.name && (
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link" style={{ color: "white" }}>
                <span className="icon mr-2">
                  <i className="fas fa-user-circle"></i>
                </span>
                <span>{user.name}</span>
                <span className="tag is-light ml-2" style={{ fontSize: "0.7rem" }}>
                  {user.role}
                </span>
              </a>
              <div className="navbar-dropdown is-right">
                <div className="navbar-item">
                  <div>
                    <p className="has-text-weight-semibold">{user.name}</p>
                    <p className="has-text-grey is-size-7">{user.email || "-"}</p>
                  </div>
                </div>
                <hr className="navbar-divider" />
                <a className="navbar-item" onClick={logout}>
                  <span className="icon mr-2 has-text-danger">
                    <i className="fas fa-sign-out-alt"></i>
                  </span>
                  <span>Logout</span>
                </a>
              </div>
            </div>
          )}

          {!user && (
            <div className="navbar-item">
              <div className="buttons">
                <button onClick={logout} className="button is-light">
                  <span className="icon">
                    <i className="fas fa-sign-out-alt"></i>
                  </span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;