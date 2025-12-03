import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import {
  Home as HomeIcon,
  Inventory as InventoryIcon,
  Book as BookIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const logout = () => {
    dispatch(LogOut());
    dispatch(reset());
    navigate("/");
  };

  const menuItems = [
    {
      title: "General",
      items: [
        { text: "Dashboard", icon: <HomeIcon />, path: "/dashboard" },
        { text: "Products", icon: <InventoryIcon />, path: "/products" },
        { text: "Peminjaman", icon: <BookIcon />, path: "/borrowings" },
        {
          text: "History Peminjaman",
          icon: <HistoryIcon />,
          path: "/borrowings/history",
        },
      ],
    },
  ];

  if (user && user.role && user.role.toLowerCase() === "admin") {
    menuItems.push({
      title: "Admin",
      items: [
        { text: "Kelola User", icon: <PersonIcon />, path: "/users" },
        { text: "Kelola Kategori", icon: <CategoryIcon />, path: "/categories" },
      ],
    });
  }

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        p: 2,
      }}
    >
      {menuItems.map((section, sectionIndex) => (
        <Box key={sectionIndex} sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: "block",
              fontWeight: "bold",
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {section.title}
          </Typography>
          <List>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                      },
                      "&:hover": {
                        backgroundColor: "grey.100",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "white" : "text.secondary",
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? "bold" : "medium",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: "block",
            fontWeight: "bold",
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Settings
        </Typography>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{
            justifyContent: "flex-start",
            px: 2,
            py: 1.5,
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "grey.100",
              color: "text.primary",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
