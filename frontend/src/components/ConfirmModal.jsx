import React from "react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  type = "info", // info, success, warning, danger
  isLoading = false,
  icon = null
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      color: "#3273dc",
      icon: icon || "fa-info-circle",
      bgColor: "#e8f4f8"
    },
    success: {
      color: "#48c774",
      icon: icon || "fa-check-circle",
      bgColor: "#effaf3"
    },
    warning: {
      color: "#ffdd57",
      icon: icon || "fa-exclamation-triangle",
      bgColor: "#fffbf0"
    },
    danger: {
      color: "#f14668",
      icon: icon || "fa-exclamation-circle",
      bgColor: "#feecf0"
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="modal is-active" style={{ zIndex: 9999 }}>
      <div 
        className="modal-background" 
        onClick={!isLoading ? onClose : undefined}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      ></div>
      <div className="modal-content" style={{ maxWidth: "500px", margin: "0 1rem" }}>
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
                color: config.color,
                fontSize: "3.5rem"
              }}
            >
              <i className={`fas ${config.icon} fa-3x`}></i>
            </div>
            <h2 
              className="title is-4 has-text-weight-bold" 
              style={{ color: "#2c3e50", marginBottom: "0.5rem" }}
            >
              {title}
            </h2>
            {message && (
              <p 
                className="subtitle is-6" 
                style={{ color: "#6c757d", marginTop: "0.5rem" }}
              >
                {message}
              </p>
            )}
          </div>

          {/* Content */}
          <div 
            className="notification is-light mb-4" 
            style={{ 
              borderRadius: "12px",
              backgroundColor: config.bgColor,
              border: `1px solid ${config.color}20`
            }}
          >
            <div className="content">
              {typeof message === 'string' ? (
                <p className="has-text-centered" style={{ margin: 0 }}>
                  {message}
                </p>
              ) : (
                message
              )}
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
              <span>{cancelText}</span>
            </button>
            <button
              className={`button ${type === 'danger' ? 'is-danger' : type === 'warning' ? 'is-warning' : type === 'success' ? 'is-success' : 'is-primary'}`}
              onClick={onConfirm}
              disabled={isLoading}
              style={{ 
                borderRadius: "8px",
                minWidth: "120px",
                boxShadow: `0 4px 12px ${config.color}40`
              }}
            >
              {isLoading ? (
                <>
                  <span className="icon is-small">
                    <i className="fas fa-spinner fa-spin"></i>
                  </span>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span className="icon is-small">
                    <i className={`fas ${type === 'danger' ? 'fa-trash' : type === 'success' ? 'fa-check' : 'fa-check-circle'}`}></i>
                  </span>
                  <span>{confirmText}</span>
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

export default ConfirmModal;

