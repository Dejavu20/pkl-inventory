import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import QRScanListener from "../components/QRScanListener";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <React.Fragment>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f5f7fa",
        paddingTop: "4rem"
      }}>
        <div className="columns is-gapless" style={{ margin: 0, minHeight: "calc(100vh - 4rem)" }}>
          <div className={`column is-2 is-hidden-mobile ${sidebarOpen ? 'is-hidden' : ''}`} style={{ 
            backgroundColor: "#ffffff",
            borderRight: "1px solid #e8e8e8",
            padding: "1.5rem 0"
          }}>
            <Sidebar />
          </div>
          {sidebarOpen && (
            <div 
              className="modal is-active is-hidden-tablet" 
              onClick={() => setSidebarOpen(false)}
              style={{ zIndex: 1000 }}
            >
              <div className="modal-background"></div>
              <div className="modal-content" style={{ width: "80%", maxWidth: "300px", margin: "4rem auto 0" }}>
                <div className="box" style={{ padding: 0 }}>
                  <Sidebar />
                </div>
              </div>
            </div>
          )}
          <div 
            className="column is-10-mobile" 
            style={{ 
              padding: "1.5rem 1rem",
              minHeight: "calc(100vh - 4rem)",
              maxWidth: "100%",
              overflowX: "hidden"
            }}
          >
            <main>{children}</main>
          </div>
        </div>
      </div>
      <QRScanListener />
    </React.Fragment>
  );
};

export default Layout;
