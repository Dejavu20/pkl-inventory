import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import QRScanListener from "../components/QRScanListener";
import { Box, Drawer } from "@mui/material";

const drawerWidth = 256;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar onMenuClick={handleDrawerToggle} />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          mt: "64px", // AppBar height
          backgroundColor: "background.default",
        }}
      >
        {/* Desktop Sidebar */}
        <Box
          component="nav"
          sx={{
            width: { md: drawerWidth },
            flexShrink: { md: 0 },
            display: { xs: "none", md: "block" },
          }}
        >
          <Box
            sx={{
              width: drawerWidth,
              position: "fixed",
              height: "calc(100vh - 64px)",
              overflow: "auto",
            }}
          >
            <Sidebar />
          </Box>
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <Sidebar />
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            width: { md: `calc(100% - ${drawerWidth}px)` },
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
      <QRScanListener />
    </Box>
  );
};

export default Layout;
