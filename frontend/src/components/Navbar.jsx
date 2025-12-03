import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Chip,
  Button,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon,
  ExpandMore,
} from "@mui/icons-material";

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const logout = () => {
    dispatch(LogOut());
    dispatch(reset());
    navigate("/");
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        borderBottom: 1,
        borderColor: "divider",
        color: "text.primary",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
          <NavLink
            to="/dashboard"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InventoryIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: "text.primary" }}>
                Inventory System
              </Typography>
            </Box>
          </NavLink>

          <IconButton
            aria-label="menu"
            onClick={onMenuClick}
            sx={{
              display: { md: "none" },
              color: "text.primary",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user && user.name ? (
            <>
              <Button
                onClick={handleMenuOpen}
                startIcon={<AccountCircle sx={{ color: "text.secondary" }} />}
                endIcon={<ExpandMore sx={{ color: "text.secondary" }} />}
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                  "&:hover": {
                    backgroundColor: "grey.100",
                  },
                }}
              >
                {user.name}
                <Chip
                  label={user.role}
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: "grey.100",
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    height: 20,
                    fontWeight: 500,
                  }}
                />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email || "-"}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={logout} sx={{ color: "error.main" }}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{
                color: "text.primary",
                backgroundColor: "grey.100",
                "&:hover": {
                  backgroundColor: "grey.200",
                },
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
