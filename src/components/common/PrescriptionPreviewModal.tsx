import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MedicationIcon from "@mui/icons-material/Medication";

interface PrescriptionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  patientName?: string;
  doctorName?: string;
  appointmentDate?: string;
}

export const PrescriptionPreviewModal: React.FC<PrescriptionPreviewModalProps> = ({
  open,
  onClose,
  fileUrl,
  fileName,
  fileType,
  patientName,
  doctorName,
  appointmentDate,
}) => {
  if (!open || !fileUrl) return null;

  const fullUrl = fileUrl.startsWith("http") ? fileUrl : `http://localhost:5000${fileUrl}`;
  const isImage =
    (fileType && fileType.startsWith("image/")) ||
    (fileName && /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fileName));

  const handleDownload = async () => {
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "Prescription.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(fullUrl, "_blank");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "22px",
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.3)",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1.5,
          pt: 2,
          px: 3,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#131D36",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(16, 185, 129, 0.4)",
            }}
          >
            <MedicationIcon sx={{ color: "#10B981", fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.05rem" }}>
                Doctor Prescription Preview
              </Typography>
              <Chip
                label="Official Prescription"
                size="small"
                sx={{
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  color: "#34D399",
                  fontWeight: 800,
                  fontSize: "0.68rem",
                  height: 20,
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#94A3B8", display: "block" }}>
              {patientName ? `Patient: ${patientName}` : ""}
              {doctorName ? ` · Doctor: ${doctorName}` : ""}
              {appointmentDate ? ` · Date: ${new Date(appointmentDate).toLocaleDateString()}` : ""}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: "#94A3B8",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            "&:hover": { color: "#FFFFFF", backgroundColor: "rgba(255, 255, 255, 0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content Preview */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: "#060A17",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 360,
          maxHeight: "72vh",
          overflowY: "auto",
        }}
      >
        {isImage ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "14px",
              overflow: "hidden",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              p: 1,
            }}
          >
            <img
              src={fullUrl}
              alt={fileName || "Prescription"}
              style={{
                maxWidth: "100%",
                maxHeight: "65vh",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 5,
              borderRadius: "16px",
              border: "1px dashed rgba(16, 185, 129, 0.4)",
              backgroundColor: "rgba(16, 185, 129, 0.05)",
              maxWidth: 420,
              textAlign: "center",
            }}
          >
            <MedicationIcon sx={{ fontSize: 56, color: "#10B981", mb: 2 }} />
            <Typography variant="subtitle1" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 0.5 }}>
              {fileName || "Prescription Document"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#94A3B8", mb: 3 }}>
              This prescription document can be previewed in a new window or downloaded directly.
            </Typography>
            <Button
              variant="contained"
              startIcon={<OpenInNewIcon />}
              onClick={() => window.open(fullUrl, "_blank")}
              sx={{
                backgroundColor: "#10B981",
                color: "#FFFFFF",
                fontWeight: 800,
                borderRadius: "10px",
                textTransform: "none",
                "&:hover": { backgroundColor: "#059669" },
              }}
            >
              Open Document Viewer
            </Button>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#131D36",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(fullUrl, "_blank")}
            sx={{
              color: "#38BDF8",
              borderColor: "rgba(56, 189, 248, 0.4)",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              "&:hover": { borderColor: "#38BDF8", backgroundColor: "rgba(56, 189, 248, 0.08)" },
            }}
          >
            Open in New Tab
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              backgroundColor: "#10B981",
              color: "#FFFFFF",
              fontWeight: 800,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "0.88rem",
              px: 2.5,
              py: 0.9,
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
              "&:hover": { backgroundColor: "#059669", boxShadow: "0 6px 18px rgba(16, 185, 129, 0.5)" },
            }}
          >
            Download Prescription
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: "#94A3B8",
              borderColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              "&:hover": { color: "#FFFFFF", borderColor: "rgba(255, 255, 255, 0.3)" },
            }}
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
