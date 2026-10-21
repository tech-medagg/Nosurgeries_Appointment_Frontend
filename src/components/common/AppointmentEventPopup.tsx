import React, { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import MedicationIcon from "@mui/icons-material/Medication";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export interface AppointmentEventPopupProps {
  open: boolean;
  onClose: () => void;
  type: "ADMIN_NEW_BOOKING" | "DOCTOR_NEW_SCHEDULED" | "PATIENT_NEW_PRESCRIPTION";
  isOldPatient?: boolean;
  patientName?: string;
  doctorName?: string;
  hospitalName?: string;
  departmentName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  onAction?: () => void;
  autoHideDuration?: number; // ms, default 10000
}

export const AppointmentEventPopup: React.FC<AppointmentEventPopupProps> = ({
  open,
  onClose,
  type,
  isOldPatient = false,
  patientName,
  doctorName,
  hospitalName,
  departmentName,
  appointmentDate,
  appointmentTime,
  onAction,
  autoHideDuration = 12000,
}) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
    if (open && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!visible) return null;

  // Configuration based on type
  let badgeLabel = "";
  let badgeColor = "#10B981";
  let badgeBg = "rgba(16, 185, 129, 0.15)";
  let title = "";
  let description = "";
  let actionLabel = "";
  let icon = <EventAvailableIcon sx={{ color: "#38BDF8", fontSize: 28 }} />;
  let borderColor = "rgba(56, 189, 248, 0.35)";
  let glowColor = "rgba(56, 189, 248, 0.25)";

  if (type === "ADMIN_NEW_BOOKING") {
    if (isOldPatient) {
      badgeLabel = "Returning Patient";
      badgeColor = "#F59E0B";
      badgeBg = "rgba(245, 158, 11, 0.18)";
      title = "Old patient new enquiry";
      description = `${patientName || "Patient"} with prior appointment history submitted a new consultation enquiry for ${hospitalName || "Hospital"} · ${departmentName || "Department"}.`;
      icon = <HistoryEduIcon sx={{ color: "#F59E0B", fontSize: 28 }} />;
      borderColor = "rgba(245, 158, 11, 0.45)";
      glowColor = "rgba(245, 158, 11, 0.25)";
    } else {
      badgeLabel = "New Patient Enquiry";
      badgeColor = "#06B6D4";
      badgeBg = "rgba(6, 182, 212, 0.18)";
      title = "New Appointment Request Received";
      description = `New patient ${patientName || "Patient"} requested an appointment for ${hospitalName || "Hospital"} · ${departmentName || "Department"}.`;
      icon = <PersonIcon sx={{ color: "#06B6D4", fontSize: 28 }} />;
      borderColor = "rgba(6, 182, 212, 0.45)";
      glowColor = "rgba(6, 182, 212, 0.25)";
    }
    actionLabel = "Schedule Doctor Now";
  } else if (type === "DOCTOR_NEW_SCHEDULED") {
    if (isOldPatient) {
      badgeLabel = "Old Patient Enquiry";
      badgeColor = "#F59E0B";
      badgeBg = "rgba(245, 158, 11, 0.18)";
      title = "Old patient new enquiry";
      description = `Scheduled visit for returning patient ${patientName || "Patient"} on ${appointmentDate || "Date"}${appointmentTime ? ` at ${appointmentTime}` : ""}.`;
      icon = <HistoryEduIcon sx={{ color: "#F59E0B", fontSize: 28 }} />;
      borderColor = "rgba(245, 158, 11, 0.45)";
      glowColor = "rgba(245, 158, 11, 0.25)";
    } else {
      badgeLabel = "New Appointment Assigned";
      badgeColor = "#10B981";
      badgeBg = "rgba(16, 185, 129, 0.18)";
      title = "Received a new appointment";
      description = `Admin scheduled new appointment with ${patientName || "Patient"} on ${appointmentDate || "Date"}${appointmentTime ? ` at ${appointmentTime}` : ""}.`;
      icon = <EventAvailableIcon sx={{ color: "#10B981", fontSize: 28 }} />;
      borderColor = "rgba(16, 185, 129, 0.45)";
      glowColor = "rgba(16, 185, 129, 0.25)";
    }
    actionLabel = "View Appointment";
  } else if (type === "PATIENT_NEW_PRESCRIPTION") {
    badgeLabel = "Official Prescription Available";
    badgeColor = "#10B981";
    badgeBg = "rgba(16, 185, 129, 0.2)";
    title = "Doctor Prescription Uploaded";
    description = `Dr. ${doctorName || "your specialist"} has uploaded your official consultation prescription. Click below to preview and download.`;
    icon = <MedicationIcon sx={{ color: "#10B981", fontSize: 28 }} />;
    borderColor = "rgba(16, 185, 129, 0.5)";
    glowColor = "rgba(16, 185, 129, 0.3)";
    actionLabel = "Preview & Download";
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: { xs: "calc(100vw - 32px)", sm: 420 },
        width: "100%",
        animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "@keyframes slideInRight": {
          from: { transform: "translateX(110%)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          borderRadius: "18px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)",
          backdropFilter: "blur(20px)",
          border: `1.5px solid ${borderColor}`,
          boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 25px ${glowColor}`,
          p: 2.2,
          color: "#FFFFFF",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top glowing bar */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${badgeColor}, #38BDF8)`,
          }}
        />

        {/* Content */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              backgroundColor: badgeBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${borderColor}`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
              <Chip
                label={badgeLabel}
                size="small"
                sx={{
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  fontWeight: 800,
                  fontSize: "0.68rem",
                  height: 20,
                  border: `1px solid ${borderColor}`,
                }}
              />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25, mb: 0.4 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8", lineHeight: 1.35, display: "block" }}>
              {description}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            sx={{
              color: "#94A3B8",
              p: 0.5,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              "&:hover": { color: "#FFFFFF", backgroundColor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Action Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 0.5, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <Button
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            onClick={() => {
              setVisible(false);
              onClose();
              if (onAction) onAction();
            }}
            sx={{
              backgroundColor: badgeColor,
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.78rem",
              borderRadius: "10px",
              textTransform: "none",
              px: 2,
              py: 0.6,
              boxShadow: `0 4px 12px ${glowColor}`,
              "&:hover": { filter: "brightness(1.15)" },
            }}
          >
            {actionLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
