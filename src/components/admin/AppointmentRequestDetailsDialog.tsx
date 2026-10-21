import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PersonIcon from "@mui/icons-material/Person";
import NotesIcon from "@mui/icons-material/Notes";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MedicationIcon from "@mui/icons-material/Medication";

import type { AppointmentListItem } from "../../types/appointment.types";
import type { MedicalReport } from "../../types/report.types";
import { getAdminAppointmentReportsApi } from "../../services/report.api";

interface AppointmentRequestDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentListItem | null;
  onStartSchedule?: () => void;
}

export const AppointmentRequestDetailsDialog: React.FC<
  AppointmentRequestDetailsDialogProps
> = ({ open, onClose, appointment, onStartSchedule }) => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      if (!open || !appointment?.id) {
        setReports([]);
        return;
      }
      try {
        setLoadingReports(true);
        const res = await getAdminAppointmentReportsApi(appointment.id);
        if (res.success && Array.isArray(res.data)) {
          setReports(res.data);
        }
      } catch (err) {
        console.error("Failed to load appointment reports:", err);
      } finally {
        setLoadingReports(false);
      }
    };
    void loadReports();
  }, [open, appointment?.id]);

  if (!appointment) return null;

  const patientName = `${appointment.patientFirstName || "Patient"} ${
    appointment.patientLastName || ""
  }`.trim();
  const doctorName = appointment.doctorFirstName
    ? `Dr. ${appointment.doctorFirstName} ${appointment.doctorLastName || ""}`.trim()
    : "Not Assigned Yet";

  const formattedDate = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  const getFullFileUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
              background: "rgba(59, 130, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa",
            }}
          >
            <CalendarTodayIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
              Appointment Request Details
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              ID: {appointment.id}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          {/* Patient Details */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PersonIcon sx={{ color: "#60a5fa" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#60a5fa" }}>
                Patient Information
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff", mb: 0.5 }}>
              {patientName}
            </Typography>
            {appointment.patientMobile && (
              <Typography variant="body2" sx={{ color: "#38bdf8", fontWeight: 700, mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                📞 Mobile: {appointment.patientMobile}
              </Typography>
            )}
            {appointment.patientEmail && (
              <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.3 }}>
                ✉️ Email: {appointment.patientEmail}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.8 }}>
              Patient Profile ID: {appointment.patientId}
            </Typography>
          </Box>

          {/* Status & Priority */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#94a3b8", textTransform: "uppercase", mb: 1 }}>
              Current Status
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={appointment.status}
                color={
                  appointment.status === "CONFIRMED"
                    ? "success"
                    : appointment.status === "PENDING"
                    ? "warning"
                    : "default"
                }
                sx={{ fontWeight: 700, borderRadius: "8px" }}
              />
            </Box>
          </Box>

          {/* Requested Healthcare Center & Speciality */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <LocalHospitalIcon sx={{ color: "#38bdf8" }} />
              <Typography variant="subtitle2" sx={{ color: "#38bdf8", fontWeight: 700 }}>
                Requested Hospital
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>
              {appointment.hospitalName || "Selected Hospital"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <MedicalServicesIcon sx={{ color: "#a78bfa" }} />
              <Typography variant="subtitle2" sx={{ color: "#a78bfa", fontWeight: 700 }}>
                Department
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>
              {appointment.departmentName || "Medical Department"}
            </Typography>
          </Box>

          {/* Assigned Doctor & Timing */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <CalendarTodayIcon sx={{ color: "#f472b6" }} />
              <Typography variant="subtitle2" sx={{ color: "#f472b6", fontWeight: 700 }}>
                Requested Date & Time
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>
              {formattedDate}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                {appointment.appointmentTime || "Slot Pending Assignment"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Typography variant="subtitle2" sx={{ color: "#34d399", fontWeight: 700, mb: 1 }}>
              Assigned Doctor
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>
              {doctorName}
            </Typography>
          </Box>

          {/* Patient Notes */}
          {appointment.notes && (
            <Box
              sx={{
                gridColumn: { xs: "1", md: "1 / -1" },
                p: 2.5,
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <NotesIcon sx={{ color: "#fbbf24" }} />
                <Typography variant="subtitle2" sx={{ color: "#fbbf24", fontWeight: 700 }}>
                  Patient Symptom Notes
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                "{appointment.notes}"
              </Typography>
            </Box>
          )}

          {/* Uploaded Medical Reports */}
          <Box
            sx={{
              gridColumn: { xs: "1", md: "1 / -1" },
              p: 2.5,
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DescriptionIcon sx={{ color: "#2EBBD9" }} />
                <Typography variant="subtitle2" sx={{ color: "#2EBBD9", fontWeight: 700 }}>
                  Uploaded Medical Reports & Prescriptions ({reports.length})
                </Typography>
              </Box>
            </Box>

            {loadingReports ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
                <CircularProgress size={20} sx={{ color: "#2EBBD9" }} />
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>Loading reports...</Typography>
              </Box>
            ) : reports.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                No medical reports or prescriptions uploaded for this appointment.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                {reports.map((rep) => {
                  const isPresc = rep.category === "PRESCRIPTION";
                  return (
                    <Box
                      key={rep.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        borderRadius: "10px",
                        background: isPresc ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.04)",
                        border: isPresc ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background: isPresc ? "rgba(16, 185, 129, 0.2)" : "rgba(46, 187, 217, 0.08)",
                          borderColor: isPresc ? "#10B981" : "#2EBBD9",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1, mr: 2 }}>
                        {isPresc ? (
                          <MedicationIcon sx={{ color: "#34D399", fontSize: 22 }} />
                        ) : (
                          <DescriptionIcon sx={{ color: "#2EBBD9", fontSize: 22 }} />
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#FFFFFF",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {rep.originalFileName || rep.fileName}
                            </Typography>
                            {isPresc && (
                              <Chip
                                label="Doctor Prescription"
                                size="small"
                                sx={{
                                  backgroundColor: "rgba(16, 185, 129, 0.25)",
                                  color: "#34D399",
                                  fontWeight: 800,
                                  fontSize: "0.68rem",
                                  height: 20,
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                            {formatFileSize(rep.fileSize)} {!isPresc && rep.category ? `· ${rep.category}` : ""}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        onClick={() => window.open(getFullFileUrl(rep.fileUrl), "_blank")}
                        sx={{
                          color: isPresc ? "#34D399" : "#2EBBD9",
                          borderColor: isPresc ? "rgba(16, 185, 129, 0.6)" : "rgba(46, 187, 217, 0.4)",
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          "&:hover": {
                            borderColor: isPresc ? "#10B981" : "#2EBBD9",
                            background: isPresc ? "rgba(16, 185, 129, 0.15)" : "rgba(46, 187, 217, 0.12)",
                          },
                        }}
                      >
                        {isPresc ? "View Prescription" : "View Report"}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

      <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
        <Button onClick={onClose} sx={{ color: "#94a3b8" }}>
          Close
        </Button>
        {onStartSchedule && (
          <Button
            variant="contained"
            onClick={() => {
              onClose();
              onStartSchedule();
            }}
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              fontWeight: 700,
              px: 3,
              borderRadius: "10px",
            }}
          >
            Assign Doctor & Slot
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
