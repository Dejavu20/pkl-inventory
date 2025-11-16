import React, { useState, useEffect } from "react";

const CSVDownloadModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Download CSV",
  defaultStartDate = "",
  defaultEndDate = "",
  defaultStatus = "all",
  isLoading = false,
  currentDataCount = 0
}) => {
  const [csvStartDate, setCsvStartDate] = useState(defaultStartDate);
  const [csvEndDate, setCsvEndDate] = useState(defaultEndDate);
  const [csvStatus, setCsvStatus] = useState(defaultStatus);

  // Update dates when defaults change
  useEffect(() => {
    if (defaultStartDate) setCsvStartDate(defaultStartDate);
    if (defaultEndDate) setCsvEndDate(defaultEndDate);
    if (defaultStatus) setCsvStatus(defaultStatus);
  }, [defaultStartDate, defaultEndDate, defaultStatus]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      startDate: csvStartDate,
      endDate: csvEndDate,
      status: csvStatus
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal is-active" style={{ zIndex: 9999 }}>
      <div 
        className="modal-background" 
        onClick={!isLoading ? onClose : undefined}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      ></div>
      <div className="modal-content" style={{ maxWidth: "600px", margin: "0 1rem" }}>
        <div 
          className="box" 
          style={{ 
            borderRadius: "16px", 
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            border: "none",
            padding: "2rem",
            animation: "modalSlideIn 0.3s ease-out"
          }}
        >
          <style>
            {`
              @keyframes modalSlideIn {
                from {
                  transform: scale(0.9) translateY(-20px);
                  opacity: 0;
                }
                to {
                  transform: scale(1) translateY(0);
                  opacity: 1;
                }
              }
            `}
          </style>

          {/* Header */}
          <div className="has-text-centered mb-4">
            <div 
              className="icon is-large mb-3"
              style={{ 
                color: "#48c774",
                fontSize: "3.5rem"
              }}
            >
              <i className="fas fa-download fa-3x"></i>
            </div>
            <h2 
              className="title is-4 has-text-weight-bold" 
              style={{ color: "#2c3e50", marginBottom: "0.5rem" }}
            >
              {title}
            </h2>
            <p 
              className="subtitle is-6" 
              style={{ color: "#6c757d", marginTop: "0.5rem" }}
            >
              Pilih periode dan filter untuk export data
            </p>
          </div>

          {/* Date Range Selection */}
          <div className="box mb-4" style={{ 
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            border: "1px solid #e0e0e0"
          }}>
            <h3 className="title is-6 mb-4" style={{ color: "#2c3e50" }}>
              <span className="icon mr-2">
                <i className="fas fa-calendar-alt"></i>
              </span>
              Pilih Periode Tanggal
            </h3>
            
            <div className="columns is-multiline">
              <div className="column is-6">
                <label className="label is-size-7 has-text-weight-semibold">
                  Tanggal Mulai
                </label>
                <div className="control has-icons-left">
                  <input
                    className="input"
                    type="date"
                    value={csvStartDate}
                    onChange={(e) => setCsvStartDate(e.target.value)}
                    style={{ borderRadius: "8px", border: "1px solid #e0e0e0" }}
                    disabled={isLoading}
                  />
                  <span className="icon is-small is-left">
                    <i className="fas fa-calendar"></i>
                  </span>
                </div>
              </div>
              
              <div className="column is-6">
                <label className="label is-size-7 has-text-weight-semibold">
                  Tanggal Akhir
                </label>
                <div className="control has-icons-left">
                  <input
                    className="input"
                    type="date"
                    value={csvEndDate}
                    onChange={(e) => setCsvEndDate(e.target.value)}
                    min={csvStartDate || undefined}
                    style={{ borderRadius: "8px", border: "1px solid #e0e0e0" }}
                    disabled={isLoading}
                  />
                  <span className="icon is-small is-left">
                    <i className="fas fa-calendar-check"></i>
                  </span>
                </div>
              </div>
            </div>

            {csvStartDate && csvEndDate && new Date(csvEndDate) < new Date(csvStartDate) && (
              <div className="notification is-danger is-light mt-3" style={{ borderRadius: "8px" }}>
                <p className="is-size-7">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Tanggal akhir harus setelah tanggal mulai
                </p>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="box mb-4" style={{ 
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            border: "1px solid #e0e0e0"
          }}>
            <h3 className="title is-6 mb-4" style={{ color: "#2c3e50" }}>
              <span className="icon mr-2">
                <i className="fas fa-filter"></i>
              </span>
              Filter Status
            </h3>
            
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  value={csvStatus}
                  onChange={(e) => setCsvStatus(e.target.value)}
                  style={{ 
                    borderRadius: "8px", 
                    border: "1px solid #e0e0e0",
                    width: "100%"
                  }}
                  disabled={isLoading}
                >
                  <option value="all">Semua Status</option>
                  <option value="dipinjam">Dipinjam</option>
                  <option value="dikembalikan">Dikembalikan</option>
                  <option value="terlambat">Terlambat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="notification is-info is-light mb-4" style={{ 
            borderRadius: "12px",
            backgroundColor: "#effaf3",
            border: "1px solid #48c77420"
          }}>
            <div className="content is-small">
              <p className="has-text-weight-semibold mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Ringkasan Export:
              </p>
              <ul style={{ marginLeft: "1.5rem" }}>
                <li>
                  <strong>Periode:</strong> {
                    csvStartDate && csvEndDate 
                      ? `${formatDate(csvStartDate)} - ${formatDate(csvEndDate)}`
                      : csvStartDate 
                        ? `Dari ${formatDate(csvStartDate)}`
                        : csvEndDate
                          ? `Hingga ${formatDate(csvEndDate)}`
                          : "Semua periode"
                  }
                </li>
                <li>
                  <strong>Status:</strong> {
                    csvStatus === "all" ? "Semua Status" :
                    csvStatus === "dipinjam" ? "Dipinjam" :
                    csvStatus === "dikembalikan" ? "Dikembalikan" :
                    csvStatus === "terlambat" ? "Terlambat" : csvStatus
                  }
                </li>
                {currentDataCount > 0 && (
                  <li>
                    <strong>Data yang ditampilkan:</strong> {currentDataCount} peminjaman
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="buttons is-centered" style={{ marginTop: "1.5rem" }}>
            <button
              className="button is-light"
              onClick={onClose}
              disabled={isLoading}
              style={{ 
                borderRadius: "8px",
                minWidth: "120px",
                border: "1px solid #e0e0e0"
              }}
            >
              <span>Batal</span>
            </button>
            <button
              className="button is-success"
              onClick={handleConfirm}
              disabled={isLoading || (csvStartDate && csvEndDate && new Date(csvEndDate) < new Date(csvStartDate))}
              style={{ 
                borderRadius: "8px",
                minWidth: "120px",
                boxShadow: "0 4px 12px #48c77440"
              }}
            >
              {isLoading ? (
                <>
                  <span className="icon is-small">
                    <i className="fas fa-spinner fa-spin"></i>
                  </span>
                  <span>Mengunduh...</span>
                </>
              ) : (
                <>
                  <span className="icon is-small">
                    <i className="fas fa-download"></i>
                  </span>
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={!isLoading ? onClose : undefined}
        disabled={isLoading}
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      ></button>
    </div>
  );
};

export default CSVDownloadModal;

