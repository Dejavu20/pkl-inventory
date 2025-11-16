import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoPerson, IoPricetag, IoHome, IoLogOut, IoBook, IoGrid, IoTime } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const logout = () => {
    dispatch(LogOut());
    dispatch(reset());
    navigate("/");
  };

  return (
    <div>
      <aside className="menu pl-2 has-shadow has-background-white">
        <p className="menu-label has-text-grey">General</p>
        <ul className="menu-list">
          <li>
            <NavLink to={"/dashboard"} className="has-text-dark">
              <span className="icon mr-2">
                <IoHome />
              </span>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to={"/products"} className="has-text-dark">
              <span className="icon mr-2">
                <IoPricetag />
              </span>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to={"/borrowings"} className="has-text-dark">
              <span className="icon mr-2">
                <IoBook />
              </span>
              Peminjaman
            </NavLink>
          </li>
          <li>
            <NavLink to={"/borrowings/history"} className="has-text-dark">
              <span className="icon mr-2">
                <IoTime />
              </span>
              History Peminjaman
            </NavLink>
          </li>
        </ul>
        {user && user.role && user.role.toLowerCase() === "admin" && (
          <div>
            <p className="menu-label has-text-grey">Admin</p>
            <ul className="menu-list">
              <li>
                <NavLink to={"/users"} className="has-text-dark">
                  <span className="icon mr-2">
                    <IoPerson />
                  </span>
                  Kelola User
                </NavLink>
              </li>
              <li>
                <NavLink to={"/categories"} className="has-text-dark">
                  <span className="icon mr-2">
                    <IoGrid />
                  </span>
                  Kelola Kategori
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        <p className="menu-label has-text-grey">Settings</p>
        <ul className="menu-list">
          <li>
            <button onClick={logout} className="button is-white has-text-danger">
              <span className="icon mr-2">
                <IoLogOut />
              </span>
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
