import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Grid,
  Chip,
  Paper,
} from "@mui/material";
import {
  Calendar as CalendarIcon,
  Info,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboardPage.css";

// Interface for Report Items
interface ReportItem {
  id: string;
  title: string;
  timeAgo: string;
  date: string;
}

// Interface for Doctor Schedule Items
interface DoctorScheduleItem {
  id: string;
  name: string;
  specialty: string;
  timeSlot: string;
  status: "Available" | "Unavailable";
  avatar: string;
}

// Interface for Task Cards
interface TaskItem {
  id: string;
  statusCategory: "Upcoming" | "In Progress" | "Completed";
  badgeCount: number;
  dateStr: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  avatars: string[];
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  // Active Date Filter in Doctor Schedule
  const [selectedDateDay, setSelectedDateDay] = useState(14);

  // Sample Reports List from approved reference design
  const reportsList: ReportItem[] = [
    { id: "1", title: "Critical Condition", timeAgo: "6 min ago", date: "July 15, 2026" },
    { id: "2", title: "Staff Schedule Review", timeAgo: "10 min ago", date: "July 15, 2026" },
    { id: "3", title: "Room 105 Light", timeAgo: "15 min ago", date: "July 15, 2026" },
    { id: "4", title: "Broken IV Stand", timeAgo: "1 days ago", date: "July 15, 2026" },
    { id: "5", title: "Lab Printer Error", timeAgo: "5 min ago", date: "July 15, 2026" },
    { id: "6", title: "Pharmacy AC Error", timeAgo: "15 min ago", date: "July 15, 2026" },
    { id: "7", title: "Doctors' Lounge Wi-Fi", timeAgo: "15 min ago", date: "July 15, 2026" },
    { id: "8", title: "ER Water Leak", timeAgo: "15 min ago", date: "July 15, 2026" },
  ];

  // Doctor Schedules List
  const doctorsList: DoctorScheduleItem[] = [
    {
      id: "1",
      name: "Dr. Alice Frank",
      specialty: "Pediatric Specialist",
      timeSlot: "08:00AM-12:00PM",
      status: "Available",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150",
    },
    {
      id: "2",
      name: "Dr. John Wilson",
      specialty: "General Practitioner",
      timeSlot: "08:00AM-12:00PM",
      status: "Available",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150",
    },
    {
      id: "3",
      name: "Dr. Mira Brown",
      specialty: "Pediatric Specialist",
      timeSlot: "08:00AM-12:00PM",
      status: "Unavailable",
      avatar: "https://images.unsplash.com/photo-1594824813566-78a99478f7e2?auto=format&fit=crop&q=80&w=150",
    },
    {
      id: "4",
      name: "Dr. Daniel Lee",
      specialty: "Orthodontist",
      timeSlot: "08:00AM-12:00PM",
      status: "Available",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150",
    },
    {
      id: "5",
      name: "Dr. Michael Brown",
      specialty: "General Specialist",
      timeSlot: "08:00AM-12:00PM",
      status: "Unavailable",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150",
    },
    {
      id: "6",
      name: "Dr. Michael Brown",
      specialty: "General Specialist",
      timeSlot: "08:00AM-12:00PM",
      status: "Available",
      avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=150",
    },
  ];

  // Tasks List
  const tasksList: TaskItem[] = [
    {
      id: "task-1",
      statusCategory: "Upcoming",
      badgeCount: 12,
      dateStr: "Tuesday, 14 July, 2026",
      title: "Update Patient Records",
      description: "Review and update dental history, allergies, and treatment plans for newly admitted patients.",
      priority: "Low",
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      ],
    },
    {
      id: "task-2",
      statusCategory: "In Progress",
      badgeCount: 8,
      dateStr: "Tuesday, 14 July, 2026",
      title: "Monthly Reports",
      description: "Analyze clinical performance, patient volume, and overall clinic occupancy rates.",
      priority: "Medium",
      avatars: [
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      ],
    },
    {
      id: "task-3",
      statusCategory: "Completed",
      badgeCount: 15,
      dateStr: "Tuesday, 14 July, 2026",
      title: "Team Meeting",
      description: "Review recently completed appointments, clinical outcomes, and prescriptions.",
      priority: "High",
      avatars: [
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80",
      ],
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Welcome Greeting Headline */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.8rem", sm: "2.4rem" } }}>
          Welcome back, <span style={{ color: "#2EBBD9" }}>{user?.fullName ? user.fullName.split(" ")[0] : (user?.email ? user.email.split("@")[0] : "Admin")}</span>
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, color: "#6B7280" }}>
          <CalendarIcon size={16} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Tuesday, 14 July, 2026
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4, alignItems: "stretch" }}>
        {/* COLUMN 1: REPORTS (Left: 3 Cols) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={0} className="dashboard-card" sx={{ p: 2.8, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 2 }}>
              Reports
            </Typography>

            <Box className="custom-scrollbar" sx={{ display: "flex", flexDirection: "column", gap: 1.8, maxHeight: 380, overflowY: "auto", pr: 0.5 }}>
              {reportsList.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    pb: 1.5,
                    borderBottom: "1px solid #F1F5F9",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "#DDF4F8",
                      color: "#1CA7C0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.2,
                    }}
                  >
                    <Info size={16} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.88rem" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
                      {item.timeAgo}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 500, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    {item.date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* COLUMN 2: PATIENTS FLOW CHART (Center: 6 Cols) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} className="dashboard-card" sx={{ p: 2.8, height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                Patients Flow
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#6B7280" }}>
                  Total count: <span style={{ fontWeight: 800, color: "#111827" }}>225</span>
                </Typography>
                <Chip
                  label="Weekly ⌄"
                  size="small"
                  sx={{ backgroundColor: "#045E6A", color: "#FFFFFF", fontWeight: 700, borderRadius: "20px", px: 0.5 }}
                />
              </Box>
            </Box>

            <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mb: 3 }}>
              Last week to increase <span style={{ color: "#2EBBD9", fontWeight: 700 }}>30%</span>
            </Typography>

            {/* Custom SVG Bar Chart */}
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", minHeight: 280, pt: 4 }}>
              {/* Thursday Highlighted Badge "76 Persons" */}
              <Box
                sx={{
                  position: "absolute",
                  left: "64%",
                  top: "35px",
                  transform: "translateX(-50%)",
                  backgroundColor: "#2EBBD9",
                  color: "#FFFFFF",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "14px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(46, 187, 217, 0.4)",
                  zIndex: 2,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid #2EBBD9",
                  },
                }}
              >
                76 Persons
              </Box>

              {/* Y-Axis Gridlines */}
              {[80, 60, 40, 20, 0].map((val) => (
                <Box key={val} sx={{ display: "flex", alignItems: "center", position: "absolute", width: "100%", top: `${(100 - val * 1.1)}%` }}>
                  <Typography variant="caption" sx={{ width: 25, color: "#9CA3AF", fontWeight: 600 }}>
                    {val}
                  </Typography>
                  <Box sx={{ flexGrow: 1, borderTop: "1px dashed #E2EDF2", ml: 1 }} />
                </Box>
              ))}

              {/* Bars Group */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", pl: 4, pr: 2, height: 210, zIndex: 1 }}>
                {[
                  { day: "Sun", height: "35%", active: false },
                  { day: "Mon", height: "65%", active: false },
                  { day: "Tue", height: "72%", active: false },
                  { day: "Wed", height: "78%", active: false },
                  { day: "Thu", height: "92%", active: true },
                  { day: "Fri", height: "68%", active: false },
                  { day: "Sat", height: "50%", active: false },
                ].map((bar, idx) => (
                  <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "11%" }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: bar.height,
                        borderRadius: "16px 16px 8px 8px",
                        background: bar.active
                          ? "linear-gradient(180deg, #2EBBD9 0%, #1CA7C0 100%)"
                          : "linear-gradient(180deg, #BAEEF5 0%, #D8F6FA 100%)",
                        boxShadow: bar.active ? "0 8px 20px rgba(46, 187, 217, 0.4)" : "none",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "scaleY(1.05)",
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 1.5, color: bar.active ? "#111827" : "#6B7280", fontWeight: bar.active ? 800 : 600 }}>
                      {bar.day}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* COLUMN 3: DOCTOR'S SCHEDULE (Right: 3 Cols) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={0} className="dashboard-card" sx={{ p: 2.8, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                Doctor's Schedule
              </Typography>
              <IconButton size="small">
                <MoreHorizontal size={18} color="#6B7280" />
              </IconButton>
            </Box>

            <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mb: 2 }}>
              Standard session: <span style={{ color: "#2EBBD9", fontWeight: 700 }}>30 Mins</span> / consultation
            </Typography>

            {/* Date Selection Carousel */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, px: 0.5 }}>
              {[
                { day: 12, name: "Sun" },
                { day: 13, name: "Mon" },
                { day: 14, name: "Tue" },
                { day: 15, name: "Wed" },
                { day: 16, name: "Thu" },
              ].map((item) => {
                const isSelected = selectedDateDay === item.day;
                return (
                  <Box
                    key={item.day}
                    onClick={() => setSelectedDateDay(item.day)}
                    sx={{
                      p: 1,
                      borderRadius: "14px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#2EBBD9" : "transparent",
                      color: isSelected ? "#FFFFFF" : "#6B7280",
                      boxShadow: isSelected ? "0 4px 12px rgba(46, 187, 217, 0.3)" : "none",
                      transition: "all 0.2s ease",
                      minWidth: 42,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                      {item.day}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Doctors List */}
            <Box className="custom-scrollbar" sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 260, overflowY: "auto" }}>
              {doctorsList.map((doc) => (
                <Box
                  key={doc.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.2,
                    borderRadius: "14px",
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Avatar src={doc.avatar} alt={doc.name} sx={{ width: 40, height: 40 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.85rem", lineHeight: 1.1 }}>
                        {doc.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.72rem", display: "block" }}>
                        {doc.specialty}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.68rem", display: "block", mb: 0.3 }}>
                      {doc.timeSlot}
                    </Typography>
                    <Chip
                      label={doc.status}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        backgroundColor: doc.status === "Available" ? "#2EBBD9" : "#FDE8E8",
                        color: doc.status === "Available" ? "#FFFFFF" : "#EF4444",
                        borderRadius: "10px",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* BOTTOM SECTION GRID: 3 - 3 - 3 - 3 ROW GRID */}
      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        {/* TASK OVERVIEW (9 COLS = 3 + 3 + 3 SUB-CARDS) */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper elevation={0} className="dashboard-card" sx={{ p: 2.8, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                Task overview
              </Typography>
              <IconButton size="small">
                <MoreHorizontal size={18} color="#6B7280" />
              </IconButton>
            </Box>

            {/* 3 SUB-CARDS IN 1 HORIZONTAL ROW */}
            <Grid container spacing={2}>
              {tasksList.map((task) => (
                <Grid key={task.id} size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      p: 2.2,
                      borderRadius: "18px",
                      backgroundColor: "#E6FAFC",
                      border: "1px solid #C4EEF5",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      {/* Status Header Badge */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.95rem" }}>
                          {task.statusCategory}
                        </Typography>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            backgroundColor: "#2EBBD9",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                          }}
                        >
                          {task.badgeCount}
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mb: 2 }}>
                        <CalendarIcon size={12} style={{ display: "inline", marginRight: 4 }} />
                        {task.dateStr}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", mb: 0.8 }}>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6B7280", fontSize: "0.78rem", lineHeight: 1.4, mb: 2 }}>
                        {task.description}
                      </Typography>
                    </Box>

                    <Box>
                      {/* Priority Badge & Stacked Avatars */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: "12px",
                            backgroundColor:
                              task.priority === "Low"
                                ? "#FFFFFF"
                                : task.priority === "Medium"
                                ? "#FEF3C7"
                                : "#FEE2E2",
                            color:
                              task.priority === "Low"
                                ? "#0284C7"
                                : task.priority === "Medium"
                                ? "#D97706"
                                : "#DC2626",
                          }}
                        />
                        <Box sx={{ display: "flex", ml: 1 }}>
                          {task.avatars.map((url, i) => (
                            <Avatar
                              key={i}
                              src={url}
                              sx={{
                                width: 28,
                                height: 28,
                                ml: i > 0 ? -1 : 0,
                                border: "2px solid #FFFFFF",
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Explicit Cyan Button (Class dentivo-btn-cyan prevents MUI purple override) */}
                      <Button
                        fullWidth
                        variant="contained"
                        className="dentivo-btn-cyan"
                        endIcon={<ChevronRight size={16} />}
                        sx={{
                          py: 0.8,
                          fontSize: "0.82rem",
                        }}
                      >
                        More details
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* TODAY'S SURGERIES / PROCEDURES CARD (3 COLS OUT OF 12) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={0}
            className="dashboard-card"
            sx={{
              height: "100%",
              minHeight: 280,
              position: "relative",
              overflow: "hidden",
              borderRadius: "20px",
              backgroundImage: `url("https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              flexDirection: "column",
              justify: "space-between",
              p: 3,
              color: "#FFFFFF",
            }}
          >
            {/* Soft dark top to vibrant cyan bottom gradient overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 40%, rgba(46,187,217,0.85) 100%)",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#FFFFFF", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                Today's Surgeries
              </Typography>
            </Box>

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography variant="h2" sx={{ fontWeight: 900, color: "#FFFFFF", display: "inline-block", mr: 1, lineHeight: 1 }}>
                5
              </Typography>
              <Typography variant="h6" sx={{ display: "inline-block", fontWeight: 700, color: "#E0F7FA" }}>
                Operations
              </Typography>
              <Typography variant="body2" sx={{ color: "#E0F7FA", mt: 0.5, fontWeight: 500 }}>
                3 Root Canals, 2 Implants
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
