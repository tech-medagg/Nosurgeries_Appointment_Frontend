import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import type { AppointmentListItem, DoctorAvailability } from "../../types/appointment.types";

interface ConfirmScheduleModalProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentListItem | null;
  doctor: DoctorAvailability | null;
  selectedDate: string;
  selectedTimeSlot: string | null;
  onConfirm: () => void;
  submitting: boolean;
  error?: string | null;
}

export const ConfirmScheduleModal: React.FC<ConfirmScheduleModalProps> = ({
  open,
  onClose,
  appointment,
  doctor,
  selectedDate,
  selectedTimeSlot,
  onConfirm,
  submitting,
  error,
}) => {
  if (!appointment || !doctor || !selectedTimeSlot) return null;

  const patientName = `${appointment.patientFirstName || "Patient"} ${
    appointment.patientLastName || ""
  }`.trim();

  const formattedDate = new Date(selectedDate).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
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
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#34d399",
            }}
          >
            <CheckCircleOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
              Confirm Appointment Schedule
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Review details before finalizing confirmation
            </Typography>
          </Box>
        </Box>
        {!submitting && (
          <IconButton onClick={onClose} sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: "12px", mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            p: 2.5,
            borderRadius: "14px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Patient */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon sx={{ color: "#60a5fa" }} />
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Patient:
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: "#fff" }}>
                {patientName}
              </Typography>
              {appointment.patientMobile && (
                <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 700, display: "block" }}>
                  📞 {appointment.patientMobile}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)" }} />

          {/* Hospital */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocalHospitalIcon sx={{ color: "#38bdf8" }} />
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Hospital:
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>
              {appointment.hospitalName || "Hospital"}
            </Typography>
          </Box>

          {/* Department */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MedicalServicesIcon sx={{ color: "#a78bfa" }} />
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Department:
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>
              {appointment.departmentName || "Department"}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)" }} />

          {/* Doctor */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Assigned Doctor:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#34d399" }}>
              Dr. {doctor.doctorName}
            </Typography>
          </Box>

          {/* Scheduled Date & Time */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EventAvailableIcon sx={{ color: "#fbbf24" }} />
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Date & Time:
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: "#fff" }}>
                {formattedDate}
              </Typography>
              <Chip
                label={selectedTimeSlot}
                size="small"
                sx={{
                  mt: 0.5,
                  background: "rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                  fontWeight: 700,
                }}
              />
            </Box>
          </Box>

          {/* New Status */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Resulting Status:
            </Typography>
            <Chip
              label="CONFIRMED"
              color="success"
              sx={{ fontWeight: 800, borderRadius: "8px" }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: "#94a3b8" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={submitting}
          onClick={onConfirm}
          sx={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            fontWeight: 700,
            borderRadius: "10px",
            px: 3,
          }}
        >
          {submitting ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Confirm Appointment"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
