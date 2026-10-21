import { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  Divider,
  Alert,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import PhoneIcon from "@mui/icons-material/Phone";

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getAppointmentsApi, getDoctorAvailabilityApi } from "../../services/appointment.api";
import { getMyPatientProfileApi } from "../../services/patient.api";
import { getHospitalsApi } from "../../services/hospital.api";
import { getDepartmentsApi } from "../../services/department.api";
import { getMyReportsApi } from "../../services/report.api";
import type { DoctorAvailability, AppointmentListItem } from "../../types/appointment.types";
import type { MedicalReport } from "../../types/report.types";
import { isSlotInPast } from "../../utils/date.utils";

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: "#fffbeb", color: "#b45309" },
  CONFIRMED:   { bg: "#ecfdf5", color: "#047857" },
  CHECKED_IN:  { bg: "#f0f9ff", color: "#0369a1" },
  COMPLETED:   { bg: "#f5f3ff", color: "#6d28d9" },
  CANCELLED:   { bg: "#fef2f2", color: "#b91c1c" },
  RESCHEDULED: { bg: "#e6fafc", color: "#045e6a" },
};

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#FFFFFF",
    color: "#111827",
    "& fieldset": { borderColor: "#CBD5E1" },
    "&:hover fieldset": { borderColor: "#2EBBD9" },
    "&.Mui-focused fieldset": { borderColor: "#045E6A" },
    "& .MuiSelect-select": { color: "#111827", fontWeight: 700 },
    "& .MuiInputBase-input": { color: "#111827", fontWeight: 700 },
  },
  "& .MuiInputLabel-root": { color: "#045E6A", fontWeight: 700, fontSize: "0.95rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#045E6A" },
};

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTomorrow());
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showAllSlotsMap, setShowAllSlotsMap] = useState<Record<string, boolean>>({});

  const toggleShowAll = (doctorId: string) => {
    setShowAllSlotsMap((prev) => ({ ...prev, [doctorId]: !prev[doctorId] }));
  };

  const [appointmentTab, setAppointmentTab] = useState<"active" | "deactive">("active");
  const [reportsApt, setReportsApt] = useState<AppointmentListItem | null>(null);

  // Helpers
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getDateLabel = (apt: AppointmentListItem): { label: string; color: string; bg: string } => {
    if (!apt.appointmentDate) return { label: "Date Pending", color: "#B45309", bg: "#FEF3C7" };
    const d = new Date(apt.appointmentDate).toISOString().split("T")[0];
    const today = getTodayStr();
    if (d === today) return { label: "TODAY", color: "#1D4ED8", bg: "#DBEAFE" };
    if (d > today) return { label: "UPCOMING", color: "#15803D", bg: "#DCFCE7" };
    return { label: "PAST", color: "#6B7280", bg: "#F1F5F9" };
  };
  const getFullFileUrl = (url: string) => (url.startsWith("http") ? url : `http://localhost:5000${url}`);
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const { data: profileData } = useQuery({
    queryKey: ["patient", "me"],
    queryFn: getMyPatientProfileApi,
    enabled: !!user?.id,
  });

  const patientId = profileData?.data?.id;

  const { data: apptData, isLoading: apptLoading } = useQuery({
    queryKey: ["patient", "appointments", "all", patientId],
    queryFn: () => getAppointmentsApi({ patientId: patientId!, limit: 100, order: "desc" }),
    enabled: !!patientId,
  });

  const allAppointments: AppointmentListItem[] = apptData?.appointments ?? [];

  const { data: reportsRes } = useQuery({
    queryKey: ["patient", "my-reports", patientId],
    queryFn: getMyReportsApi,
    enabled: !!patientId,
  });
  const allReports: MedicalReport[] = reportsRes?.data ?? [];

  const activeAppointments = allAppointments.filter((apt) =>
    ["PENDING", "CONFIRMED", "CHECKED_IN", "RESCHEDULED"].includes(apt.status)
  );

  const deactiveAppointments = allAppointments.filter((apt) =>
    ["COMPLETED", "CANCELLED"].includes(apt.status)
  );

  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: ["hospitals", "list"],
    queryFn: () => getHospitalsApi({ limit: 100 }),
  });

  const hospitalsList = hospitalsData?.data ?? [];

  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments", "list"],
    queryFn: () => getDepartmentsApi({ limit: 100 }),
  });

  const departmentsList = departmentsData?.data ?? [];

  const {
    data: availabilityData,
    isLoading: availabilityLoading,
    error: availabilityError,
  } = useQuery({
    queryKey: ["doctorAvailability", selectedHospitalId, selectedDepartmentId, selectedDate],
    queryFn: () =>
      getDoctorAvailabilityApi(
        selectedHospitalId || undefined,
        selectedDepartmentId || undefined,
        selectedDate
      ),
    enabled: !!selectedDate,
  });

  const availableDoctors: DoctorAvailability[] = availabilityData?.data ?? [];

  const filteredDoctors = availableDoctors.filter((doc) => {
    if (!doctorSearch.trim()) return true;
    const query = doctorSearch.toLowerCase();
    return (
      doc.doctorName.toLowerCase().includes(query) ||
      (doc.firstName && doc.firstName.toLowerCase().includes(query)) ||
      (doc.lastName && doc.lastName.toLowerCase().includes(query)) ||
      (doc.hospitalName && doc.hospitalName.toLowerCase().includes(query)) ||
      (doc.departmentName && doc.departmentName.toLowerCase().includes(query))
    );
  });

  const handleSelectSlot = (doc: DoctorAvailability, slotTime: string) => {
    const hospId = doc.hospitalId || selectedHospitalId;
    const deptId = doc.departmentId || selectedDepartmentId;
    navigate(
      `/patient/book-appointment?hospitalId=${encodeURIComponent(
        hospId
      )}&departmentId=${encodeURIComponent(
        deptId
      )}&doctorProfileId=${encodeURIComponent(
        doc.doctorProfileId
      )}&appointmentDate=${encodeURIComponent(
        selectedDate
      )}&appointmentTime=${encodeURIComponent(slotTime)}`
    );
  };

  const handleSelectDoctorFull = (doc: DoctorAvailability) => {
    const hospId = doc.hospitalId || selectedHospitalId;
    const deptId = doc.departmentId || selectedDepartmentId;
    navigate(
      `/patient/slots?hospitalId=${encodeURIComponent(
        hospId
      )}&departmentId=${encodeURIComponent(
        deptId
      )}&doctorProfileId=${encodeURIComponent(
        doc.doctorProfileId
      )}&appointmentDate=${encodeURIComponent(selectedDate)}`
    );
  };

  const dashboardCards = [
    {
      title: "Find Doctors & Slots",
      description: "Check live doctor schedules, real-time slot availability, and book immediately.",
      icon: <MedicalServicesIcon fontSize="large" />,
      action: () => {
        const el = document.getElementById("doctor-availability-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
      highlight: true,
    },
    {
      title: "Book by Hospital",
      description: "Explore hospital facilities and browse available healthcare departments.",
      icon: <LocalHospitalIcon fontSize="large" />,
      action: () => navigate("/patient/hospitals"),
    },
    {
      title: "My Appointments",
      description: "Manage upcoming schedules, review booking history, or reschedule.",
      icon: <EventAvailableIcon fontSize="large" />,
      action: () => navigate("/patient/appointments"),
    },
    {
      title: "Medical Profile",
      description: "Update personal contact details, medical background, and emergency contacts.",
      icon: <PersonIcon fontSize="large" />,
      action: () => navigate("/patient/profile"),
    },
  ];

  return (
    <Box sx={{ pb: 6, maxWidth: 1400, mx: "auto", px: { xs: 1, sm: 2, md: 3 } }}>
      {/* HEADER BANNER - RESPONSIVE HERO */}
      <Box
        className="anim-fade-in-up"
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5, md: 4.5 },
          borderRadius: { xs: "18px", sm: "24px" },
          background: "linear-gradient(135deg, #045E6A 0%, #06454E 100%)",
          color: "#FFFFFF",
          boxShadow: "0 12px 35px -5px rgba(4, 94, 106, 0.35)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: 2.5, md: 3 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow orbs */}
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(46, 187, 217, 0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 1,
              color: "#FFFFFF",
              letterSpacing: "-0.5px",
              fontSize: { xs: "1.45rem", sm: "1.85rem", md: "2.2rem" },
              lineHeight: 1.2,
            }}
          >
            Welcome, {user?.fullName || "Patient"} 👋
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.92rem", sm: "1.02rem" },
              color: "#D5F5FA",
              maxWidth: 620,
              lineHeight: 1.5,
            }}
          >
            Find top doctors, check real-time availability, and schedule appointments with ease.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            width: { xs: "100%", sm: "auto" },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Button
            variant="contained"
            fullWidth={false}
            startIcon={<CalendarMonthIcon />}
            onClick={() => {
              const el = document.getElementById("doctor-availability-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            sx={{
              flex: { xs: "1 1 100%", sm: "initial" },
              backgroundColor: "#98ECF8",
              color: "#0A3F4C",
              fontWeight: 800,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5 },
              py: 1.2,
              fontSize: { xs: "0.88rem", sm: "0.95rem" },
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              transition: "all 0.25s ease",
              "&:hover": { backgroundColor: "#7DE2F0", transform: "translateY(-2px)", boxShadow: "0 6px 18px rgba(0,0,0,0.22)" },
            }}
          >
            Check Availability
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/patient/appointments")}
            sx={{
              flex: { xs: "1 1 100%", sm: "initial" },
              borderColor: "#98ECF8",
              color: "#FFFFFF",
              fontWeight: 700,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5 },
              py: 1.2,
              fontSize: { xs: "0.88rem", sm: "0.95rem" },
              textTransform: "none",
              transition: "all 0.25s ease",
              "&:hover": { borderColor: "#7DE2F0", backgroundColor: "rgba(255,255,255,0.12)", transform: "translateY(-2px)" },
            }}
          >
            My Appointments
          </Button>
        </Box>
      </Box>

      {/* DASHBOARD ACTION CARDS - RESPONSIVE GRID */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 5 }}>
        {dashboardCards.map((card, idx) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }} className={`anim-fade-in-up delay-${idx + 1}`}>
            <Card
              className="interactive-card"
              sx={{
                height: "100%",
                borderRadius: { xs: "16px", sm: "20px" },
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2EDF2",
                boxShadow: "0 8px 24px -4px rgba(46, 187, 217, 0.08)",
              }}
            >
              <CardActionArea onClick={card.action} sx={{ height: "100%", p: { xs: 2, sm: 2.5 } }}>
                <CardContent sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        backgroundColor: "#DDF4F8",
                        color: "#1CA7C0",
                        display: "inline-flex",
                        transition: "transform 0.2s ease",
                        "&:hover": { transform: "scale(1.08)" },
                      }}
                    >
                      {card.icon}
                    </Box>
                    {card.highlight && (
                      <Chip
                        label="Live Slots"
                        size="small"
                        sx={{ backgroundColor: "#98ECF8", color: "#0A3F4C", fontWeight: 800, fontSize: "0.7rem", height: 22 }}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 0.75, fontSize: { xs: "1rem", sm: "1.05rem" } }}>
                    {card.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.5, fontSize: { xs: "0.85rem", sm: "0.88rem" }, flexGrow: 1 }}>
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DOCTOR AVAILABILITY SECTION */}
      <Box id="doctor-availability-section" sx={{ mb: 5 }}>
        <Card
          sx={{
            borderRadius: "24px",
            p: { xs: 2.5, md: 3.5 },
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            boxShadow: "0 10px 30px -5px rgba(46, 187, 217, 0.1), 0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <AccessTimeIcon sx={{ color: "#2EBBD9" }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827" }}>
                  Doctor Availability & Slots
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Select your preferred hospital, department, and appointment date to view available doctors and real-time open slots.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate("/patient/hospitals")}
              sx={{ borderColor: "#2EBBD9", color: "#045E6A", fontWeight: 700, borderRadius: "10px", textTransform: "none" }}
            >
              Browse All Hospitals →
            </Button>
          </Box>

          <Divider sx={{ mb: 3, borderColor: "#E2EDF2" }} />

          {/* FILTERS BAR WITH BLACK TYPOGRAPHY */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Hospital"
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                disabled={hospitalsLoading}
                sx={inputStyle}
                slotProps={{
                  inputLabel: { shrink: true },
                  select: {
                    displayEmpty: true,
                    renderValue: (val: unknown) => {
                      const vStr = val as string;
                      if (!vStr) {
                        return <span style={{ color: "#045E6A", fontWeight: 700 }}>All Hospitals</span>;
                      }
                      const match = hospitalsList.find((h) => h.id === vStr);
                      return match ? match.name : vStr;
                    },
                  },
                }}
              >
                <MenuItem value="" sx={{ color: "#045E6A", fontWeight: 700 }}>
                  🏥 All Hospitals (Show All)
                </MenuItem>
                {hospitalsList.length > 0 &&
                  hospitalsList.map((h) => (
                    <MenuItem key={h.id} value={h.id} sx={{ color: "#111827", fontWeight: 700 }}>
                      {h.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Department"
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                disabled={departmentsLoading}
                sx={inputStyle}
                slotProps={{
                  inputLabel: { shrink: true },
                  select: {
                    displayEmpty: true,
                    renderValue: (val: unknown) => {
                      const vStr = val as string;
                      if (!vStr) {
                        return <span style={{ color: "#045E6A", fontWeight: 700 }}>All Departments</span>;
                      }
                      const match = departmentsList.find((d) => d.id === vStr);
                      return match ? match.name : vStr;
                    },
                  },
                }}
              >
                <MenuItem value="" sx={{ color: "#045E6A", fontWeight: 700 }}>
                  🩺 All Departments (Show All)
                </MenuItem>
                {departmentsList.length > 0 &&
                  departmentsList.map((d) => (
                    <MenuItem key={d.id} value={d.id} sx={{ color: "#111827", fontWeight: 700 }}>
                      {d.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField
                type="date"
                fullWidth
                size="small"
                label="Select Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                sx={inputStyle}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: getToday() },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search Doctor..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                sx={inputStyle}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon fontSize="small" sx={{ color: "#045E6A", mr: 1 }} />,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* CONTENT */}
          {!selectedDate ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                px: 2,
                backgroundColor: "#F8FAFC",
                borderRadius: "16px",
                border: "1px dashed #CBD5E1",
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 44, color: "#2EBBD9", mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
                Select an Appointment Date
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 460, mx: "auto" }}>
                Choose a date above to check all available doctors. You can optionally filter by Hospital or Department.
              </Typography>
            </Box>
          ) : availabilityLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
              <CircularProgress size={36} sx={{ color: "#2EBBD9" }} />
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Checking live doctor schedules...
              </Typography>
            </Box>
          ) : availabilityError ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
              Failed to load doctor availability. Please try again.
            </Alert>
          ) : filteredDoctors.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2, backgroundColor: "#F8FAFC", borderRadius: "16px", border: "1px dashed #CBD5E1" }}>
              <MedicalServicesIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
                No Available Doctors Found
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", maxWidth: 460, mx: "auto" }}>
                There are no scheduled doctors available on {selectedDate}
                {selectedHospitalId ? ` at ${hospitalsList.find((h) => h.id === selectedHospitalId)?.name || "selected hospital"}` : ""}
                {selectedDepartmentId ? ` in ${departmentsList.find((d) => d.id === selectedDepartmentId)?.name || "selected department"}` : ""}.
                Try choosing another date or clearing filters above.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredDoctors.map((doc) => {
                const allSlots = doc.availableSlots;
                const futureSlots = allSlots.filter((s) => !isSlotInPast(selectedDate, s));
                const showAll = showAllSlotsMap[doc.doctorProfileId] ?? false;
                const displaySlots = showAll ? allSlots : futureSlots;

                return (
                  <Grid key={doc.doctorProfileId} size={{ xs: 12, lg: 6 }}>
                    <Card
                      sx={{
                        p: 2.5,
                        borderRadius: "20px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2EDF2",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(46, 187, 217, 0.15)",
                          borderColor: "#2EBBD9",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, gap: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              backgroundColor: "#DDF4F8",
                              color: "#045E6A",
                              fontWeight: 800,
                              fontSize: "1.1rem",
                            }}
                          >
                            {doc.firstName ? doc.firstName[0] : "D"}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
                              Dr. {doc.doctorName}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                              {(doc.hospitalName || doc.departmentName) && (
                                <Chip
                                  label={`🏥 ${doc.hospitalName || "Hospital"} · ${doc.departmentName || "Department"}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#DDF4F8",
                                    color: "#045E6A",
                                    fontWeight: 700,
                                    fontSize: "0.68rem",
                                    height: 20,
                                  }}
                                />
                              )}
                              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                                {doc.startTime} - {doc.endTime} ({doc.slotDuration} min/slot)
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Chip
                          label={futureSlots.length > 0 ? `${futureSlots.length} Available` : "Fully Booked"}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            backgroundColor: futureSlots.length > 0 ? "#DCFCE7" : "#FEE2E2",
                            color: futureSlots.length > 0 ? "#15803D" : "#B91C1C",
                          }}
                        />
                      </Box>

                      <Box sx={{ my: 1.5, flexGrow: 1 }}>
                        {/* Slot header row with Show All toggle */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                            {showAll ? `All Slots (${allSlots.length})` : `Available Slots (${futureSlots.length})`} · {selectedDate}
                          </Typography>
                          <Chip
                            label={showAll ? "Future Only" : "Show All"}
                            size="small"
                            onClick={() => toggleShowAll(doc.doctorProfileId)}
                            clickable
                            sx={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              height: 22,
                              backgroundColor: showAll ? "#FEF3C7" : "#DDF4F8",
                              color: showAll ? "#B45309" : "#045E6A",
                              cursor: "pointer",
                              "&:hover": { opacity: 0.85 },
                            }}
                          />
                        </Box>

                        {/* No future slots message */}
                        {!showAll && futureSlots.length === 0 && (
                          <Box
                            sx={{
                              py: 1.5,
                              px: 2,
                              borderRadius: "10px",
                              backgroundColor: "#FEF2F2",
                              border: "1px dashed #FECACA",
                              textAlign: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: "#B91C1C", fontWeight: 700 }}>
                              ⏰ All slots for today have passed. Select a future date or click "Show All" to view.
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, maxHeight: 110, overflowY: "auto" }}>
                          {displaySlots.map((slot) => {
                            const isPast = isSlotInPast(selectedDate, slot);
                            return (
                              <Chip
                                key={slot}
                                label={slot}
                                size="small"
                                disabled={isPast}
                                onClick={() => !isPast && handleSelectSlot(doc, slot)}
                                clickable={!isPast}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  borderRadius: "8px",
                                  opacity: isPast ? 0.45 : 1,
                                  borderColor: isPast ? "#E2E8F0" : "#2EBBD9",
                                  color: isPast ? "#94A3B8" : "#045E6A",
                                  backgroundColor: isPast ? "#F1F5F9" : "#DDF4F8",
                                  textDecoration: isPast ? "line-through" : "none",
                                  "&:hover": !isPast ? { backgroundColor: "#2EBBD9", color: "#FFFFFF" } : {},
                                  "&.Mui-disabled": {
                                    opacity: 0.45,
                                    color: "#94A3B8 !important",
                                    backgroundColor: "#F1F5F9 !important",
                                  },
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: "#E2EDF2" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>
                          {doc.bookedPatients} patients booked
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          endIcon={<ArrowForwardIcon fontSize="small" />}
                          onClick={() => handleSelectDoctorFull(doc)}
                          sx={{
                            backgroundColor: "#045E6A",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            borderRadius: "10px",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#034953" },
                          }}
                        >
                          View Slots & Book
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Card>
      </Box>

      {/* PATIENT APPOINTMENTS SECTION (ACTIVE & DEACTIVE TOGGLE) */}
      <Card
        sx={{
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2EDF2",
          boxShadow: "0 10px 30px -5px rgba(46, 187, 217, 0.1)",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <EventAvailableIcon sx={{ color: "#2EBBD9", fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827" }}>
                  My Appointments
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Switch between your active upcoming slots and past appointment history
              </Typography>
            </Box>

            {/* ACTIVE / DEACTIVE TOGGLE BUTTON */}
            <ToggleButtonGroup
              value={appointmentTab}
              exclusive
              onChange={(_, val) => val && setAppointmentTab(val)}
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
              <ToggleButton value="active" aria-label="Active Appointments">
                <CheckCircleIcon sx={{ fontSize: 18, mr: 0.75 }} />
                Active ({activeAppointments.length})
              </ToggleButton>
              <ToggleButton value="deactive" aria-label="Deactive Appointments">
                <HistoryIcon sx={{ fontSize: 18, mr: 0.75 }} />
                Deactive / Past ({deactiveAppointments.length})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {apptLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#2EBBD9" }} />
            </Box>
          ) : appointmentTab === "active" ? (
            /* ACTIVE APPOINTMENTS TAB */
            activeAppointments.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: "16px",
                  backgroundColor: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                }}
              >
                <EventAvailableIcon sx={{ fontSize: 44, color: "#94A3B8", mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#334155" }}>
                  No Active Appointments Found
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5, mb: 2.5, maxWidth: 450, mx: "auto" }}>
                  You don't have any pending or confirmed upcoming bookings right now. Check doctor availability above to schedule a consultation.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    const el = document.getElementById("doctor-availability-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  sx={{
                    backgroundColor: "#045E6A",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    borderRadius: "12px",
                    px: 3,
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#034953" },
                  }}
                >
                  Book New Slot
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {activeAppointments.map((apt) => {
                  const sc = statusColors[apt.status] ?? { bg: "#DDF4F8", color: "#045E6A" };
                  const formattedDate = apt.appointmentDate
                    ? new Date(apt.appointmentDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date Pending";
                  const doctorName = apt.doctorFirstName
                    ? `Dr. ${apt.doctorFirstName} ${apt.doctorLastName ?? ""}`.trim()
                    : "Doctor assignment in progress";
                  const aptReports = allReports.filter((r) => r.appointmentId === apt.id);
                  const dl = getDateLabel(apt);

                  return (
                    <Card
                      key={apt.id}
                      sx={{
                        borderRadius: "18px",
                        border: "1px solid #E2EDF2",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#2EBBD9",
                          boxShadow: "0 8px 24px rgba(46, 187, 217, 0.12)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                        {/* Header Row: Date/Time + Badges */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <CalendarTodayIcon sx={{ color: "#2EBBD9", fontSize: 20 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827" }}>
                              {formattedDate}
                            </Typography>
                            {apt.appointmentTime && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 0.5 }}>
                                <AccessTimeIcon sx={{ color: "#64748B", fontSize: 18 }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#045E6A" }}>
                                  {apt.appointmentTime}
                                </Typography>
                              </Box>
                            )}
                            <Chip
                              label={dl.label}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.68rem",
                                backgroundColor: dl.bg,
                                color: dl.color,
                                height: 22,
                                borderRadius: "6px",
                              }}
                            />
                          </Box>

                          <Chip
                            label={apt.status.replace("_", " ")}
                            sx={{
                              backgroundColor: sc.bg,
                              color: sc.color,
                              fontWeight: 800,
                              fontSize: "0.78rem",
                              borderRadius: "8px",
                              px: 0.5,
                            }}
                          />
                        </Box>

                        <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

                        {/* Details Grid */}
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" }, gap: 2, my: 1.5 }}>
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                              <LocalHospitalIcon sx={{ fontSize: 18, color: "#64748B" }} />
                              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                                Hospital
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "#1E293B" }}>
                              {apt.hospitalName || "Hospital"}
                            </Typography>
                          </Box>

                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                              <MedicalServicesIcon sx={{ fontSize: 18, color: "#64748B" }} />
                              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                                Department
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "#1E293B" }}>
                              {apt.departmentName || "General Consultation"}
                            </Typography>
                          </Box>

                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                              <PersonIcon sx={{ fontSize: 18, color: "#64748B" }} />
                              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                                Assigned Doctor
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: apt.doctorFirstName ? "#047857" : "#B45309",
                              }}
                            >
                              {doctorName}
                            </Typography>
                          </Box>

                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 18, color: "#64748B" }} />
                              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                                Registered Mobile
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: "#045E6A",
                              }}
                            >
                              {apt.patientMobile || (profileData?.data as any)?.mobile || user?.mobile || "—"}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Bottom Actions Row */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mt: 2, pt: 1 }}>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {aptReports.length > 0 && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DescriptionIcon />}
                                onClick={() => setReportsApt(apt)}
                                sx={{
                                  color: "#045E6A",
                                  borderColor: "#2EBBD9",
                                  borderRadius: "10px",
                                  textTransform: "none",
                                  fontWeight: 700,
                                  fontSize: "0.8rem",
                                  "&:hover": { backgroundColor: "#DDF4F8" },
                                }}
                              >
                                View {aptReports.length} Uploaded Report{aptReports.length !== 1 ? "s" : ""}
                              </Button>
                            )}
                          </Box>

                          <Button
                            size="small"
                            variant="text"
                            onClick={() => navigate("/patient/appointments")}
                            sx={{
                              color: "#045E6A",
                              fontWeight: 700,
                              textTransform: "none",
                              "&:hover": { backgroundColor: "#F0F9FF" },
                            }}
                          >
                            Full Details →
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )
          ) : (
            /* DEACTIVE / PAST APPOINTMENTS TAB */
            deactiveAppointments.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: "16px",
                  backgroundColor: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                }}
              >
                <HistoryIcon sx={{ fontSize: 44, color: "#94A3B8", mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#334155" }}>
                  No Past or Deactive Appointments
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                  Any completed or cancelled consultations will appear here in your history.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {deactiveAppointments.map((apt) => {
                  const sc = statusColors[apt.status] ?? { bg: "#F1F5F9", color: "#64748B" };
                  const formattedDate = apt.appointmentDate
                    ? new Date(apt.appointmentDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";
                  const doctorName = apt.doctorFirstName
                    ? `Dr. ${apt.doctorFirstName} ${apt.doctorLastName ?? ""}`.trim()
                    : "—";
                  const aptReports = allReports.filter((r) => r.appointmentId === apt.id);

                  return (
                    <Card
                      key={apt.id}
                      sx={{
                        borderRadius: "18px",
                        border: "1px solid #E2EDF2",
                        backgroundColor: "#FAFAFA",
                        boxShadow: "none",
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CalendarTodayIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#475569" }}>
                              {formattedDate} {apt.appointmentTime ? `· ${apt.appointmentTime}` : ""}
                            </Typography>
                          </Box>

                          <Chip
                            label={apt.status.replace("_", " ")}
                            sx={{
                              backgroundColor: sc.bg,
                              color: sc.color,
                              fontWeight: 800,
                              fontSize: "0.75rem",
                              borderRadius: "8px",
                            }}
                          />
                        </Box>

                        <Typography variant="body2" sx={{ color: "#64748B", mb: 1.5 }}>
                          Hospital: <strong>{apt.hospitalName || "Hospital"}</strong> · Department: <strong>{apt.departmentName || "General"}</strong> · Doctor: <strong>{doctorName}</strong>
                          {(apt.patientMobile || (user as any)?.mobile) && (
                            <> · Registered Mobile: <strong>{apt.patientMobile || (user as any)?.mobile}</strong></>
                          )}
                        </Typography>

                        {aptReports.length > 0 && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DescriptionIcon />}
                            onClick={() => setReportsApt(apt)}
                            sx={{
                              color: "#64748B",
                              borderColor: "#CBD5E1",
                              borderRadius: "10px",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            View {aptReports.length} Uploaded Report{aptReports.length !== 1 ? "s" : ""}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )
          )}
        </CardContent>
      </Card>

      {/* REPORT PREVIEW & DOWNLOAD DIALOG */}
      <Dialog
        open={Boolean(reportsApt)}
        onClose={() => setReportsApt(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 800, pb: 1 }}>
          <DescriptionIcon sx={{ color: "#2EBBD9" }} />
          Uploaded Medical Reports
        </DialogTitle>
        <DialogContent dividers>
          {reportsApt && (() => {
            const aptReports = allReports.filter((r) => r.appointmentId === reportsApt.id);
            if (aptReports.length === 0) {
              return <Typography sx={{ color: "text.secondary" }}>No files uploaded for this appointment.</Typography>;
            }
            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {aptReports.map((report) => {
                  const fileUrl = getFullFileUrl(report.fileUrl);
                  const isPdf = report.fileType?.includes("pdf") || report.fileName?.endsWith(".pdf");
                  const isImage = report.fileType?.includes("image") || /\.(png|jpe?g|webp)$/i.test(report.fileName || "");

                  return (
                    <Box
                      key={report.id}
                      sx={{
                        p: 2.5,
                        borderRadius: "16px",
                        border: "1px solid #E2EDF2",
                        backgroundColor: "#F8FAFC",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827" }}>
                            {report.originalFileName || report.fileName || "Medical Report"}
                          </Typography>
                          {report.category && (
                            <Chip
                              label={report.category}
                              size="small"
                              sx={{ fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#DDF4F8", color: "#045E6A" }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          {report.fileName} {report.fileSize ? `· ${formatFileSize(report.fileSize)}` : ""}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<OpenInNewIcon />}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderColor: "#2EBBD9",
                            color: "#045E6A",
                            fontWeight: 700,
                            borderRadius: "10px",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#DDF4F8" },
                          }}
                        >
                          {isImage ? "View Image" : isPdf ? "View PDF" : "Open File"}
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DownloadIcon />}
                          href={fileUrl}
                          download={report.fileName || "report"}
                          target="_blank"
                          sx={{
                            backgroundColor: "#045E6A",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            borderRadius: "10px",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#034953" },
                          }}
                        >
                          Download
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReportsApt(null)} sx={{ fontWeight: 700, color: "#64748B" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientDashboardPage;