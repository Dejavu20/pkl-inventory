import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

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
  icon = null,
}) => {
  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case "success":
        return <CheckCircleIcon sx={{ fontSize: 60 }} />;
      case "warning":
        return <WarningIcon sx={{ fontSize: 60 }} />;
      case "danger":
        return <ErrorIcon sx={{ fontSize: 60 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 60 }} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "info"; // Use info color for softer warning
      case "danger":
        return "error";
      default:
        return "info";
    }
  };

  const getConfirmIcon = () => {
    if (type === "danger") return <DeleteIcon />;
    if (type === "success") return <CheckIcon />;
    return <CheckCircleIcon />;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                color:
                  type === "warning"
                    ? "text.secondary"
                    : `${getColor()}.main`,
              }}
            >
              {getIcon()}
            </Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          {!isLoading && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {typeof message === "string" ? (
          <Typography>{message}</Typography>
        ) : (
          message
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading} variant="outlined">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color={getColor()}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              getConfirmIcon()
            )
          }
        >
          {isLoading ? "Memproses..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
