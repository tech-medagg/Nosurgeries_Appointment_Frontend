import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import type { DoctorAvailability } from "../../types/appointment.types";

interface DoctorSelectorModalProps {
  open: boolean;
  onClose: () => void;
  doctors: DoctorAvailability[];
  loading: boolean;
  error?: string | null;
  selectedDoctorId?: string | null;
  onSelectDoctor: (doctor: DoctorAvailability) => void;
}

export const DoctorSelectorModal: React.FC<DoctorSelectorModalProps> = ({
  open,
  onClose,
  doctors,
  loading,
  error,
  selectedDoctorId,
  onSelectDoctor,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = doctors.filter((doc) =>
    doc.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" }}>
            <MedicalServicesIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
              Select Doctor
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Choose an available doctor for this appointment
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search doctor by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              color: "#fff",
              "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
              "& input": { color: "#fff" },
            }}
          />
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#3b82f6" }} />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert severity="error" sx={{ borderRadius: "12px", mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && filteredDoctors.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, opacity: 0.8 }}>
            <Typography variant="body1" sx={{ color: "#94a3b8", textAlign: "center" }}>
              No available doctors found for this date & department.
            </Typography>
          </Box>
        )}

        {/* Doctors Grid */}
        {!loading && !error && filteredDoctors.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 2,
            }}
          >
            {filteredDoctors.map((doc) => {
              const isSelected = selectedDoctorId === doc.doctorProfileId;

              return (
                <Box
                  key={doc.doctorProfileId}
                  onClick={() => onSelectDoctor(doc)}
                  className={`doctor-select-card ${isSelected ? "selected" : ""}`}
                  sx={{
                    backgroundColor: isSelected
                      ? "rgba(46, 187, 217, 0.22) !important"
                      : "rgba(15, 23, 42, 0.85) !important",
                    border: isSelected
                      ? "2px solid #2EBBD9 !important"
                      : "1.5px solid rgba(255, 255, 255, 0.12) !important",
                    borderRadius: "14px",
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(46, 187, 217, 0.16) !important",
                      borderColor: "#2EBBD9 !important",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: isSelected ? "#2EBBD9" : "rgba(46, 187, 217, 0.2)",
                        color: isSelected ? "#FFFFFF" : "#38bdf8",
                        fontWeight: 800,
                        fontSize: "1.15rem",
                      }}
                    >
                      {doc.firstName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#FFFFFF !important", fontSize: "1rem" }}>
                        Dr. {doc.doctorName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8 !important", display: "block", mt: 0.2 }}>
                        Max Capacity: {doc.maxPatients} patients/day
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip
                          label={`${doc.availableSlots.length} Slots Available`}
                          size="small"
                          sx={{
                            background: "rgba(16, 185, 129, 0.18)",
                            color: "#34d399",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}
                        />
                      </Box>
                    </Box>
                    {isSelected && <CheckCircleIcon sx={{ color: "#2EBBD9", fontSize: 26 }} />}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <Button onClick={onClose} sx={{ color: "#94a3b8" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
