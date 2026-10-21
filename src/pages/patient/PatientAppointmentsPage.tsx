import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import MedicationIcon from "@mui/icons-material/Medication";
import PhoneIcon from "@mui/icons-material/Phone";

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";

import { getAppointmentsApi } from "../../services/appointment.api";
import { getMyPatientProfileApi } from "../../services/patient.api";
import { getMyReportsApi } from "../../services/report.api";
import type { AppointmentListItem } from "../../types/appointment.types";
import type { MedicalReport } from "../../types/report.types";

export const PatientAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportsApt, setReportsApt] = useState<AppointmentListItem | null>(null);
  const [tab, setTab] = useState<"active" | "deactive">("active");

  // Helpers
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getDateLabel = (apt: AppointmentListItem): { label: string; color: string; bg: string } => {
    if (!apt.appointmentDate) return { label: "Date Pending", color: "#B45309", bg: "#FEF3C7" };
    const d = new Date(apt.appointmentDate).toISOString().split("T")[0];
    const today = getTodayStr();
    if (d === today) return { label: "TODAY", color: "#1D4ED8", bg: "#DBEAFE" };
    if (d > today)   return { label: "UPCOMING", color: "#15803D", bg: "#DCFCE7" };
    return { label: "PAST", color: "#6B7280", bg: "#F1F5F9" };
  };
  const getFullFileUrl = (url: string) => url.startsWith("http") ? url : `http://localhost:5000${url}`;
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 1. Fetch Logged-in Patient Profile
  const { data: profileRes, isLoading: isProfileLoading } = useQuery({
    queryKey: ["myPatientProfile"],
    queryFn: () => getMyPatientProfileApi(),
  });

  const patientProfileId = profileRes?.data?.id;

  // 2. Fetch Patient Appointments
  const {
    data: appointmentsRes,
    isLoading: isAppointmentsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["patient", "appointments", patientProfileId],
    queryFn: () =>
      getAppointmentsApi({
        patientId: patientProfileId,
        limit: 100,
      }),
    enabled: !!patientProfileId,
  });

  // 3. Fetch all patient reports once
  const { data: reportsRes } = useQuery({
    queryKey: ["patient", "my-reports"],
    queryFn: getMyReportsApi,
    enabled: !!patientProfileId,
  });
  const allReports: MedicalReport[] = reportsRes?.data ?? [];

  const isLoading = isProfileLoading || isAppointmentsLoading;
  const allAppointments: AppointmentListItem[] = appointmentsRes?.appointments || [];

  const activeAppointments = allAppointments.filter((apt) =>
    ["PENDING", "CONFIRMED", "CHECKED_IN", "RESCHEDULED"].includes(apt.status)
  );

  const deactiveAppointments = allAppointments.filter((apt) =>
    ["COMPLETED", "CANCELLED"].includes(apt.status)
  );

  const displayedAppointments = tab === "active" ? activeAppointments : deactiveAppointments;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/patient")}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            My Appointments
          </Typography>
          <Typography color="text.secondary">
            Track your appointment requests, assigned doctors, and schedules.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <ToggleButtonGroup
            value={tab}
            exclusive
            onChange={(_, val) => val && setTab(val)}
            aria-label="Appointment Status Filter"
            sx={{
              backgroundColor: "#F1F5F9",
              borderRadius: "14px",
              p: 0.5,
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "10px",
                px: 2,
                py: 0.75,
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "none",
                color: "#64748B",
                "&.Mui-selected": {
                  backgroundColor: "#045E6A",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(4, 94, 106, 0.2)",
                  "&:hover": { backgroundColor: "#034953" },
                },
              },
            }}
          >
            <ToggleButton value="active">
              <CheckCircleIcon sx={{ fontSize: 18, mr: 0.75 }} />
              Active ({activeAppointments.length})
            </ToggleButton>
            <ToggleButton value="deactive">
              <HistoryIcon sx={{ fontSize: 18, mr: 0.75 }} />
              Deactive / Past ({deactiveAppointments.length})
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            onClick={() => navigate("/patient/hospitals")}
            sx={{ fontWeight: 700, borderRadius: "10px", backgroundColor: "#045E6A", "&:hover": { backgroundColor: "#034953" } }}
          >
            Book New
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {(error as { message?: string })?.message || "Failed to load your appointments."}
        </Alert>
      ) : displayedAppointments.length === 0 ? (
        <Card sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {tab === "active" ? "No active appointments found." : "No past or cancelled appointments found."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            {tab === "active"
              ? "You don't have any pending or confirmed upcoming appointments."
              : "Completed or cancelled consultations will be listed here."}
          </Typography>
          {tab === "active" && (
            <Button
              variant="contained"
              onClick={() => navigate("/patient/hospitals")}
              sx={{ fontWeight: 700, backgroundColor: "#045E6A", "&:hover": { backgroundColor: "#034953" } }}
            >
              Book Your First Appointment
            </Button>
          )}
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {displayedAppointments.map((apt) => {
            const formattedDate = apt.appointmentDate
              ? new Date(apt.appointmentDate).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date pending";

            const doctorName = apt.doctorFirstName
              ? `Dr. ${apt.doctorFirstName} ${apt.doctorLastName || ""}`.trim()
              : "Assigned Doctor Pending";

            return (
              <Card
                key={apt.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarTodayIcon sx={{ color: "#29C4E0", fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {formattedDate}
                      </Typography>
                      {apt.appointmentTime && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}>
                          <AccessTimeIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {apt.appointmentTime}
                          </Typography>
                        </Box>
                      )}
                      {/* Date label badge */}
                      {(() => { const dl = getDateLabel(apt); return <Chip label={dl.label} size="small" sx={{ ml: 1, fontWeight: 800, fontSize: "0.65rem", backgroundColor: dl.bg, color: dl.color, height: 20 }} />; })()}
                    </Box>

                    <Chip
                      label={apt.status.replace("_", " ")}
                      color={
                        apt.status === "CONFIRMED" ? "success"
                        : apt.status === "PENDING" ? "warning"
                        : apt.status === "CANCELLED" ? "error"
                        : apt.status === "CHECKED_IN" ? "info"
                        : apt.status === "COMPLETED" ? "success"
                        : "default"
                      }
                      sx={{ fontWeight: 700, borderRadius: "8px" }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" }, gap: 2, mt: 2 }}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <LocalHospitalIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Hospital</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{apt.hospitalName || "Hospital"}</Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <MedicalServicesIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Department</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{apt.departmentName || "Department"}</Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Doctor</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: apt.doctorFirstName ? "success.main" : "warning.main" }}>
                        {doctorName}
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Registered Mobile</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#045E6A" }}>
                        {apt.patientMobile || (profileRes?.data as any)?.mobile || user?.mobile || "—"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Reports & Prescription button */}
                  {(() => {
                    const aptReports = allReports.filter((r) => r.appointmentId === apt.id);
                    const prescription = aptReports.find((r) => r.category === "PRESCRIPTION");
                    const otherReports = aptReports.filter((r) => r.category !== "PRESCRIPTION");

                    if (aptReports.length === 0) return null;

                    return (
                      <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                        {prescription && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<MedicationIcon />}
                            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                            onClick={() => window.open(getFullFileUrl(prescription.fileUrl), "_blank")}
                            sx={{
                              backgroundColor: "#059669",
                              color: "#FFFFFF",
                              borderRadius: "10px",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
                              "&:hover": { backgroundColor: "#047857" },
                            }}
                          >
                            View Doctor Prescription
                          </Button>
                        )}
                        {otherReports.length > 0 && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DescriptionIcon />}
                            onClick={() => setReportsApt(apt)}
                            sx={{
                              color: "#045E6A", borderColor: "#2EBBD9", borderRadius: "10px",
                              textTransform: "none", fontWeight: 700, fontSize: "0.8rem",
                              "&:hover": { backgroundColor: "#DDF4F8" },
                            }}
                          >
                            View {otherReports.length} Uploaded Report{otherReports.length !== 1 ? "s" : ""}
                          </Button>
                        )}
                      </Box>
                    );
                  })()}

                  {apt.status === "CANCELLED" && (
                    <Collapse in>
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 2,
                          background: "rgba(211, 47, 47, 0.06)",
                          border: "1px solid rgba(211, 47, 47, 0.2)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 18, color: "error.main", mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                          This appointment has been cancelled. The doctor may have removed their availability for this day. Please book a new appointment.
                        </Typography>
                      </Box>
                    </Collapse>
                  )}

                  {apt.notes && (
                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, background: "rgba(0, 0, 0, 0.03)" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                        Your Notes:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        "{apt.notes}"
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Reports Dialog — Patient sees their uploaded files */}
      <Dialog
        open={!!reportsApt}
        onClose={() => setReportsApt(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "24px", p: 1 } } }}
      >
        <DialogTitle sx={{ color: "#111827", fontWeight: 800 }}>
          My Uploaded Medical Reports
          {reportsApt && (
            <Typography variant="caption" sx={{ display: "block", color: "#6B7280", mt: 0.3 }}>
              Appointment on {reportsApt.appointmentDate
                ? new Date(reportsApt.appointmentDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                : "—"}
              {reportsApt.appointmentTime ? ` · ${reportsApt.appointmentTime}` : ""}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {(() => {
            const aptReports = allReports.filter((r) => r.appointmentId === reportsApt?.id);
            if (aptReports.length === 0) {
              return (
                <Box sx={{ textAlign: "center", py: 5, backgroundColor: "#F8FAFC", borderRadius: "16px", border: "1px dashed #CBD5E1" }}>
                  <DescriptionIcon sx={{ fontSize: 44, color: "#94A3B8", mb: 1 }} />
                  <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>No reports for this appointment.</Typography>
                </Box>
              );
            }
            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                {aptReports.map((rep) => {
                  const isPresc = rep.category === "PRESCRIPTION";
                  return (
                    <Box
                      key={rep.id}
                      sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        p: 2, borderRadius: "14px",
                        backgroundColor: isPresc ? "rgba(16, 185, 129, 0.08)" : "#F8FAFC",
                        border: isPresc ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #E2E8F0",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: isPresc ? "rgba(16, 185, 129, 0.15)" : "#F0FDFA",
                          borderColor: isPresc ? "#10B981" : "#2EBBD9",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0, mr: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            backgroundColor: isPresc ? "#D1FAE5" : "#CCFBF1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isPresc ? (
                            <MedicationIcon sx={{ color: "#059669", fontSize: 22 }} />
                          ) : (
                            <DescriptionIcon sx={{ color: "#0D9488", fontSize: 22 }} />
                          )}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography variant="body2" sx={{ color: isPresc ? "#065F46" : "#1E293B", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {rep.originalFileName || rep.fileName}
                            </Typography>
                            {isPresc && (
                              <Chip
                                label="Doctor Prescription"
                                size="small"
                                sx={{ backgroundColor: "#D1FAE5", color: "#065F46", fontWeight: 800, fontSize: "0.68rem", height: 20 }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: "#64748B" }}>
                            {formatFileSize(rep.fileSize)}{!isPresc && rep.category ? ` · ${rep.category}` : ""}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = getFullFileUrl(rep.fileUrl);
                            a.download = rep.originalFileName || rep.fileName;
                            a.target = "_blank";
                            a.click();
                          }}
                          sx={{
                            color: isPresc ? "#059669" : "#045E6A",
                            borderColor: isPresc ? "#059669" : "#2EBBD9",
                            borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: "0.75rem", px: 1.5,
                            "&:hover": { backgroundColor: isPresc ? "rgba(16, 185, 129, 0.08)" : "#DDF4F8" },
                          }}
                        >
                          Download
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                          onClick={() => window.open(getFullFileUrl(rep.fileUrl), "_blank")}
                          sx={{
                            backgroundColor: isPresc ? "#059669" : "#045E6A",
                            color: "#FFFFFF",
                            borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: "0.75rem", px: 1.5,
                            "&:hover": { backgroundColor: isPresc ? "#047857" : "#034852" },
                          }}
                        >
                          Preview
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReportsApt(null)} sx={{ color: "#6B7280", fontWeight: 600 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientAppointmentsPage;
