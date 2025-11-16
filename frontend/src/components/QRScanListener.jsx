import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import { useNavigate } from "react-router-dom";

const QRScanListener = () => {
  const [scanEvents, setScanEvents] = useState([]);
  const [lastSeenId, setLastSeenId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [currentScan, setCurrentScan] = useState(null);
  const navigate = useNavigate();
  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    const checkScans = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/qr-scans`);
        const events = response.data;
        
        if (events.length > 0) {
          setScanEvents(events);
          
          // Check for new scans
          if (lastSeenId === null) {
            // First load, just set the last seen ID
            setLastSeenId(events[0].id);
          } else {
            // Check if there's a new scan
            const newScans = events.filter(event => event.id !== lastSeenId && 
              !scanEvents.some(existing => existing.id === event.id));
            
            if (newScans.length > 0) {
              // Show notification for the newest scan
              const newestScan = newScans[0];
              setCurrentScan(newestScan);
              setShowNotification(true);
              setLastSeenId(newestScan.id);
              
              // Auto-redirect to product detail after 2 seconds
              setTimeout(() => {
                if (newestScan.productUuid) {
                  navigate(`/products/detail/${newestScan.productUuid}`);
                  setShowNotification(false);
                }
              }, 2000);
              
              // Auto-hide notification after 10 seconds (fallback)
              if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
              }
              notificationTimeoutRef.current = setTimeout(() => {
                setShowNotification(false);
              }, 10000);
            }
          }
        }
      } catch (error) {
        // Silent fail - don't disrupt user experience
        console.error("Failed to check QR scans:", error);
      }
    };

    // Check immediately
    checkScans();

    // Poll every 2 seconds
    const interval = setInterval(checkScans, 2000);

    return () => {
      clearInterval(interval);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [lastSeenId, scanEvents]);

  const handleViewProduct = () => {
    if (currentScan) {
      navigate(`/products/detail/${currentScan.productUuid}`);
      setShowNotification(false);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  };

  if (!showNotification || !currentScan) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 9999,
        maxWidth: "400px",
        animation: "slideInRight 0.3s ease-out"
      }}
    >
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div className="box" style={{
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        border: "2px solid #48c774",
        backgroundColor: "#ffffff",
        padding: "1.25rem"
      }}>
        <div className="level is-mobile mb-3">
          <div className="level-left">
            <div className="level-item">
              <div className="icon is-large" style={{ color: "#48c774" }}>
                <i className="fas fa-qrcode fa-2x"></i>
              </div>
            </div>
            <div className="level-item">
              <div>
                <h3 className="title is-5 has-text-weight-bold" style={{ color: "#2c3e50", marginBottom: "0.25rem" }}>
                  QR Code Di-Scan!
                </h3>
                <p className="subtitle is-7 has-text-grey" style={{ marginTop: "0" }}>
                  Barang baru saja di-scan
                </p>
              </div>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <button
                className="delete"
                onClick={handleCloseNotification}
                aria-label="close"
              ></button>
            </div>
          </div>
        </div>

        <div className="box mb-3" style={{
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          backgroundColor: "#f8f9fa",
          padding: "1rem"
        }}>
          <div className="content is-small">
            <p className="mb-2">
              <strong>Produk:</strong> {currentScan.productName}
            </p>
            <p className="mb-2">
              <strong>Merek:</strong> {currentScan.productMerek}
            </p>
            <p className="mb-2">
              <strong>Serial:</strong> <code>{currentScan.productSerialNumber}</code>
            </p>
            <p className="is-size-7 has-text-grey">
              <i className="fas fa-clock mr-1"></i>
              {new Date(currentScan.scannedAt).toLocaleString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="buttons">
          <button
            className="button is-primary is-small"
            onClick={handleViewProduct}
            style={{ borderRadius: "6px" }}
          >
            <span className="icon is-small">
              <i className="fas fa-eye"></i>
            </span>
            <span>Lihat Detail</span>
          </button>
          <button
            className="button is-light is-small"
            onClick={handleCloseNotification}
            style={{ borderRadius: "6px" }}
          >
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanListener;


