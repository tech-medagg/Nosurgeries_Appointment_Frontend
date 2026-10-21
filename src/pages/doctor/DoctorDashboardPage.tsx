import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import { useQuery } from "@tanstack/react-query";
import { getMyDoctorProfileApi } from "../../services/doctor.api";
import { getAppointmentsApi } from "../../services/appointment.api";
import { useAuth } from "../../context/AuthContext";

const statusMeta: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: "#FEF3C7", color: "#B45309" },
  CONFIRMED:   { bg: "#DBEAFE", color: "#1D4ED8" },
  CHECKED_IN:  { bg: "#F3E8FF", color: "#6B21A8" },
  COMPLETED:   { bg: "#DCFCE7", color: "#15803D" },
  CANCELLED:   { bg: "#FEE2E2", color: "#B91C1C" },
  RESCHEDULED: { bg: "#DDF4F8", color: "#045E6A" },
};

const DoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["doctor", "me"],
    queryFn: getMyDoctorProfileApi,
  });

  const doctorProfile = profileData?.data;

  const { data: apptData, isLoading: apptLoading } = useQuery({
    queryKey: ["doctor", "appointments", doctorProfile?.id],
    queryFn: () =>
      getAppointmentsApi({
        doctorProfileId: doctorProfile!.id,
        limit: 100,
        order: "desc",
      }),
    enabled: !!doctorProfile?.id,
  });

  const appointments = apptData?.appointments ?? [];
  const todayStr = new Date().toISOString().split("T")[0];
  const todayApts = appointments.filter((a) => {
    const d = a.appointmentDate ? new Date(a.appointmentDate).toISOString().split("T")[0] : "";
    return d === todayStr;
  });

  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const pendingCount   = appointments.filter((a) => a.status === "PENDING").length;
  const recentAppointments = appointments.slice(0, 5);

  const greeting = new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening";

  const quickCards = [
    {
      title: "My Appointments",
      desc: "View and manage all your assigned patient appointments.",
      icon: <CalendarMonthIcon fontSize="large" />,
      path: "/doctor/appointments",
    },
    {
      title: "My Schedule",
      desc: "View your available time slots and weekly schedule.",
      icon: <EventNoteIcon fontSize="large" />,
      path: "/doctor/schedule",
    },
  ];

  const stats = [
    { label: "Total Assigned", value: appointments.length, icon: <MedicalServicesIcon />, color: "#045E6A", bg: "#DDF4F8" },
    { label: "Confirmed",      value: confirmedCount,      icon: <CheckCircleIcon />,   color: "#1D4ED8", bg: "#DBEAFE" },
    { label: "Completed",      value: completedCount,      icon: <HowToRegIcon />,      color: "#15803D", bg: "#DCFCE7" },
    { label: "Pending",        value: pendingCount,        icon: <PendingActionsIcon />, color: "#B45309", bg: "#FEF3C7" },
  ];

  if (profileLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#2EBBD9" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6, maxWidth: 1400, mx: "auto", px: { xs: 1, sm: 2, md: 3 } }}>

      {/* ── HERO BANNER */}
      <Box
        className="anim-fade-in-up"
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5, md: 4 },
          borderRadius: { xs: "18px", sm: "24px" },
          background: "linear-gradient(135deg, #045E6A 0%, #06454E 100%)",
          color: "#FFFFFF",
          boxShadow: "0 12px 35px -5px rgba(4, 94, 106, 0.35)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 2.5, sm: 3 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Avatar
          sx={{
            width: { xs: 52, sm: 64 },
            height: { xs: 52, sm: 64 },
            backgroundColor: "#98ECF8",
            color: "#045E6A",
            fontWeight: 900,
            fontSize: { xs: "1.4rem", sm: "1.8rem" },
            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            flexShrink: 0,
          }}
        >
          {doctorProfile?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "D"}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#FFFFFF",
              mb: 0.5,
              letterSpacing: "-0.5px",
              fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.1rem" },
              lineHeight: 1.2,
            }}
          >
            Good {greeting}, Dr. {doctorProfile?.firstName ?? user?.email ?? "Doctor"} 👋
          </Typography>
          <Typography sx={{ fontSize: { xs: "0.88rem", sm: "1.02rem" }, color: "#D5F5FA", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            {doctorProfile?.specialization && (
              <Chip
                label={doctorProfile.specialization}
                size="small"
                sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.75rem", height: 22 }}
              />
            )}
            <span>{todayApts.length} appointment{todayApts.length !== 1 ? "s" : ""} scheduled for today</span>
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="contained"
            startIcon={<CalendarMonthIcon sx={{ color: "#0A3F4C", fontSize: "1.2rem !important" }} />}
            onClick={() => navigate("/doctor/appointments")}
            sx={{
              flex: { xs: "1 1 100%", sm: "initial" },
              backgroundColor: "#98ECF8",
              color: "#0A3F4C",
              fontWeight: 800,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5 },
              py: 1.1,
              fontSize: { xs: "0.85rem", sm: "0.92rem" },
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              transition: "all 0.25s ease",
              "& .MuiButton-startIcon": { color: "#0A3F4C" },
              "&:hover": { backgroundColor: "#7DE2F0", transform: "translateY(-2px)" },
            }}
          >
            View Appointments
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/doctor/schedule")}
            sx={{
              flex: { xs: "1 1 100%", sm: "initial" },
              borderColor: "#98ECF8",
              color: "#FFFFFF",
              fontWeight: 700,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5 },
              py: 1.1,
              fontSize: { xs: "0.85rem", sm: "0.92rem" },
              textTransform: "none",
              transition: "all 0.25s ease",
              "&:hover": { borderColor: "#7DE2F0", backgroundColor: "rgba(255,255,255,0.12)", transform: "translateY(-2px)" },
            }}
          >
            My Schedule
          </Button>
        </Box>
      </Box>

      {/* ── STATS CARDS */}
      <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 6, md: 3 }} className={`anim-fade-in-up delay-${idx + 1}`}>
            <Card
              className="interactive-card"
              sx={{
                borderRadius: { xs: "16px", sm: "20px" },
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2EDF2",
                boxShadow: "0 8px 24px -4px rgba(46, 187, 217, 0.08)",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: { xs: "0.68rem", sm: "0.72rem" } }}>
                    {stat.label}
                  </Typography>
                  <Box sx={{ backgroundColor: stat.bg, color: stat.color, p: 0.8, borderRadius: "10px", display: "flex" }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ color: stat.color, fontWeight: 900, fontSize: { xs: "1.6rem", sm: "2rem" } }}>
                  {apptLoading ? <CircularProgress size={22} sx={{ color: stat.color }} /> : stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── QUICK ACTION CARDS */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        {quickCards.map((card, idx) => (
          <Grid key={card.path} size={{ xs: 12, sm: 6 }} className={`anim-fade-in-up delay-${idx + 3}`}>
            <Card
              className="interactive-card"
              sx={{
                borderRadius: { xs: "16px", sm: "20px" },
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2EDF2",
                boxShadow: "0 8px 24px -4px rgba(46, 187, 217, 0.08)",
              }}
            >
              <CardActionArea onClick={() => navigate(card.path)} sx={{ p: 0.5, borderRadius: "20px" }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      backgroundColor: "#DDF4F8",
                      color: "#1CA7C0",
                      display: "inline-flex",
                      mb: 2,
                      transition: "transform 0.2s ease",
                      "&:hover": { transform: "scale(1.08)" },
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" sx={{ color: "#111827", fontWeight: 800, mb: 0.75, fontSize: { xs: "1.05rem", sm: "1.15rem" } }}>{card.title}</Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.6, fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>{card.desc}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── RECENT APPOINTMENTS */}
      <Card
        sx={{
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2EDF2",
          boxShadow: "0 10px 30px -5px rgba(46, 187, 217, 0.1)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ color: "#111827", fontWeight: 800 }}>Recent Appointments</Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                Your latest assigned patient consultations
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#045E6A", cursor: "pointer", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}
              onClick={() => navigate("/doctor/appointments")}
            >
              View all →
            </Typography>
          </Box>

          {apptLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#2EBBD9" }} size={28} />
            </Box>
          ) : recentAppointments.length === 0 ? (
            <Alert
              severity="info"
              icon={<LocalHospitalIcon />}
              sx={{ backgroundColor: "#DDF4F8", color: "#045E6A", border: "1px solid #C4EEF5", borderRadius: "14px", fontWeight: 600 }}
            >
              No appointments assigned yet. They will appear here once admin confirms them.
            </Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {recentAppointments.map((apt) => {
                const patientName = `${apt.patientFirstName ?? "Patient"} ${apt.patientLastName ?? ""}`.trim();
                const dateStr = apt.appointmentDate
                  ? new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                  : "—";
                const sc = statusMeta[apt.status] ?? { bg: "#DDF4F8", color: "#045E6A" };

                return (
                  <Box
                    key={apt.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      borderRadius: "14px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2EDF2",
                      flexWrap: "wrap",
                      gap: 1.5,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: "#2EBBD9", backgroundColor: "#E6FAFC" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ backgroundColor: "#DDF4F8", color: "#045E6A", fontWeight: 800 }}>
                        {patientName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827" }}>
                          {patientName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          📅 {dateStr}{apt.appointmentTime ? ` · ⏰ ${apt.appointmentTime}` : ""}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={apt.status}
                      size="small"
                      sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 800, fontSize: "0.72rem" }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorDashboardPage;
