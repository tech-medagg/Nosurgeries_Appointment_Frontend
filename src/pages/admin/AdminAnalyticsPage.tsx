import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  InputBase,
} from "@mui/material";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ArrowUpDown,
  Search,
  TrendingUp,
  FileText,
  Users,
  MoreHorizontal,
  Star,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ======================================================
   Types & Interfaces
====================================================== */

export interface DoctorPerformance {
  id: string;
  doctorName: string;
  specialist: string;
  patients: number;
  phoneNumber: string;
  hoursWorked: string;
  creditsUsed: number;
  rating: number;
}

/* ======================================================
   Initial Mock Data
====================================================== */

const DOCTOR_PERFORMANCE_DATA: DoctorPerformance[] = [
  {
    id: "DOC-101",
    doctorName: "Dr. Daniel Lee",
    specialist: "Pediatric Dentist",
    patients: 400,
    phoneNumber: "(+2) 111 222 333",
    hoursWorked: "08.00",
    creditsUsed: 2200,
    rating: 4.8,
  },
  {
    id: "DOC-102",
    doctorName: "Dr. Mickel Silva",
    specialist: "General Dentist",
    patients: 385,
    phoneNumber: "(+2) 111 222 333",
    hoursWorked: "08.00",
    creditsUsed: 1800,
    rating: 4.5,
  },
  {
    id: "DOC-103",
    doctorName: "Dr. Michael Brown",
    specialist: "General Dentist",
    patients: 380,
    phoneNumber: "(+2) 111 222 333",
    hoursWorked: "08.00",
    creditsUsed: 1800,
    rating: 4.8,
  },
  {
    id: "DOC-104",
    doctorName: "Dr. John Wilson",
    specialist: "Pediatric Dentist",
    patients: 365,
    phoneNumber: "(+2) 111 222 333",
    hoursWorked: "08.00",
    creditsUsed: 2200,
    rating: 4.8,
  },
  {
    id: "DOC-105",
    doctorName: "Dr. Florida Wine",
    specialist: "Pediatric Dentist",
    patients: 306,
    phoneNumber: "(+2) 111 222 333",
    hoursWorked: "08.00",
    creditsUsed: 2000,
    rating: 4.8,
  },
];

/* ======================================================
   Theme Colors
====================================================== */

const COLOR_CYAN = "#00ADC6";
const COLOR_CYAN_LIGHT = "#E6F8FA";

const AdminAnalyticsPage: React.FC = () => {
  const { user } = useAuth();

  // State Management
  const [doctors] = useState<DoctorPerformance[]>(DOCTOR_PERFORMANCE_DATA);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("DOC-104"); // Dr. John Wilson highlighted by default
  const [searchQuery, setSearchQuery] = useState("");
  const [reportsTimeframe, setReportsTimeframe] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");
  const [reportsAnchor, setReportsAnchor] = useState<null | HTMLElement>(null);

  const [tableTimeframe, setTableTimeframe] = useState<"Monthly" | "Weekly" | "Yearly">("Monthly");
  const [tableTimeframeAnchor, setTableTimeframeAnchor] = useState<null | HTMLElement>(null);

  // Sort State
  const [sortField, setSortField] = useState<keyof DoctorPerformance>("patients");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const userName = user?.email ? user.email.split("@")[0] : "Robert";

  // Handle Table Sort
  const handleSort = (field: keyof DoctorPerformance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter & Sort Doctors
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((d) => {
        const q = searchQuery.toLowerCase();
        return (
          d.doctorName.toLowerCase().includes(q) ||
          d.specialist.toLowerCase().includes(q) ||
          d.phoneNumber.includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [doctors, searchQuery, sortField, sortDirection]);

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* ======================================================
          HEADER SECTION (Greeting + Top Metric Counters)
      ====================================================== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Welcome & Date */}
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#111827",
              fontSize: { xs: "1.8rem", sm: "2.3rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Welcome back,{" "}
            <Box component="span" sx={{ color: COLOR_CYAN }}>
              {userName}
            </Box>
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, color: "#6B7280" }}>
            <CalendarIcon size={18} color="#9CA3AF" />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
              Tuesday, 14 July, 2026
            </Typography>
          </Box>
        </Box>

        {/* Top Right Analytics Counters */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 4 }, flexWrap: "wrap" }}>
          {/* Credit Usage Growth */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                backgroundColor: "#E6F8FA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLOR_CYAN,
              }}
            >
              <TrendingUp size={24} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                16%
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.78rem" }}>
                Credit Usage Growth
              </Typography>
            </Box>
          </Box>

          {/* Total Appointments */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                backgroundColor: "#F0FDF4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16A34A",
              }}
            >
              <FileText size={24} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                400
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.78rem" }}>
                Total Appointments
              </Typography>
            </Box>
          </Box>

          {/* New Patient Conversion */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                backgroundColor: "#F3E8FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9333EA",
              }}
            >
              <Users size={24} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                350
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.78rem" }}>
                New Patient Conversion
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ======================================================
          MIDDLE CHARTS ROW (3 Cards: Reports, Credit Usage by Treatment, Age Group)
      ====================================================== */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.3fr 1.1fr 1fr" },
          gap: 2.5,
          mb: 3,
        }}
      >
        {/* CARD 1: Credit Usage Reports Area Chart */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            p: 3,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Card Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.15rem" }}>
              Reports
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Legend Dots */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, fontSize: "0.78rem" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: COLOR_CYAN }} />
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                    Credits Used
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#045E6A" }} />
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                    Allocated: 165
                  </Typography>
                </Box>
              </Box>

              {/* Timeframe Dropdown */}
              <Button
                onClick={(e) => setReportsAnchor(e.currentTarget)}
                endIcon={<ChevronDown size={14} />}
                sx={{
                  backgroundColor: "#045E6A",
                  color: "#FFFFFF",
                  borderRadius: "20px",
                  px: 1.8,
                  py: 0.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  "&:hover": { backgroundColor: "#034953" },
                }}
              >
                {reportsTimeframe}
              </Button>

              <Menu
                anchorEl={reportsAnchor}
                open={Boolean(reportsAnchor)}
                onClose={() => setReportsAnchor(null)}
                slotProps={{ paper: { sx: { borderRadius: "12px", mt: 1, minWidth: 120 } } }}
              >
                <MenuItem onClick={() => { setReportsTimeframe("Weekly"); setReportsAnchor(null); }}>Weekly</MenuItem>
                <MenuItem onClick={() => { setReportsTimeframe("Monthly"); setReportsAnchor(null); }}>Monthly</MenuItem>
                <MenuItem onClick={() => { setReportsTimeframe("Yearly"); setReportsAnchor(null); }}>Yearly</MenuItem>
              </Menu>
            </Box>
          </Box>

          <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mb: 2 }}>
            Last week credit usage increased by{" "}
            <Box component="span" sx={{ color: COLOR_CYAN, fontWeight: 700 }}>
              13%
            </Box>
          </Typography>

          {/* SVG Smooth Gradient Area Chart */}
          <Box sx={{ width: "100%", height: 210, position: "relative", mt: 1 }}>
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="creditsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ADC6" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#00ADC6" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="40" x2="490" y2="40" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="40" y1="90" x2="490" y2="90" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="490" y2="140" stroke="#F1F5F9" strokeDasharray="4 4" />

              {/* Y Axis Labels */}
              <text x="10" y="45" fill="#94A3B8" fontSize="11" fontWeight="500">200</text>
              <text x="10" y="95" fill="#94A3B8" fontSize="11" fontWeight="500">150</text>
              <text x="10" y="145" fill="#94A3B8" fontSize="11" fontWeight="500">100</text>
              <text x="25" y="190" fill="#94A3B8" fontSize="11" fontWeight="500">0</text>

              {/* Gradient Fill Area */}
              <path
                d="M 50 135 C 110 135, 140 135, 190 135 C 240 120, 290 85, 340 75 C 400 65, 450 50, 485 40 L 485 190 L 50 190 Z"
                fill="url(#creditsGrad)"
              />

              {/* Main Trend Line */}
              <path
                d="M 50 135 C 110 135, 140 135, 190 135 C 240 120, 290 85, 340 75 C 400 65, 450 50, 485 40"
                fill="none"
                stroke="#00ADC6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Highlight Dot on Thursday */}
              <circle cx="340" cy="75" r="5" fill="#00ADC6" stroke="#FFFFFF" strokeWidth="2" />

              {/* X Axis Labels */}
              <text x="50" y="200" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">Sun</text>
              <text x="120" y="200" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">Mon</text>
              <text x="190" y="200" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">Tue</text>
              <text x="265" y="200" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">Wed</text>
              <text x="340" y="200" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">Thu</text>
              <text x="410" y="200" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">Fri</text>
              <text x="480" y="200" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">Sat</text>
            </svg>
          </Box>
        </Paper>

        {/* CARD 2: Credit Usage by Treatment */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            p: 3,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Card Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.1rem" }}>
              Credit Usage by Treatment
            </Typography>
            <IconButton size="small" sx={{ color: "#94A3B8" }}>
              <MoreHorizontal size={18} />
            </IconButton>
          </Box>

          {/* Clean Progress Breakdown List (Fixes Clipping & Overlap) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, my: "auto" }}>
            {[
              { name: "Implants & Surgeries", pct: 100, credits: "4,000", color: "#005C6E" },
              { name: "Root Canal & Filings", pct: 70, credits: "2,800", color: "#0091A8" },
              { name: "Orthodontics", pct: 56, credits: "2,240", color: "#20C9E3" },
              { name: "General Consultation & Cleaning", pct: 40, credits: "1,600", color: "#00ADC6" },
            ].map((item) => (
              <Box key={item.name}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color }} />
                    <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600, fontSize: "0.8rem" }}>
                      {item.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: "0.75rem" }}>
                      {item.credits} Credits
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 0.9,
                        py: 0.2,
                        borderRadius: "8px",
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        fontWeight: 800,
                        fontSize: "0.72rem",
                      }}
                    >
                      {item.pct}%
                    </Typography>
                  </Box>
                </Box>

                {/* Styled Smooth Bar */}
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    borderRadius: "4px",
                    backgroundColor: "#F1F5F9",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${item.pct}%`,
                      height: "100%",
                      borderRadius: "4px",
                      backgroundColor: item.color,
                      transition: "width 0.4s ease-in-out",
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* CARD 3: Patient Age Group */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            p: 3,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.1rem" }}>
              Patient Age Group
            </Typography>
            <IconButton size="small" sx={{ color: "#94A3B8" }}>
              <MoreHorizontal size={18} />
            </IconButton>
          </Box>

          {/* Age Group Breakdown Legend */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, mb: 1 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.78rem" }}>
              0–18year{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "#111827" }}>
                15%
              </Box>{" "}
              Patients
            </Typography>

            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.78rem" }}>
              19–40year{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "#111827" }}>
                45%
              </Box>{" "}
              Patients
            </Typography>

            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.78rem" }}>
              41–70+year{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "#111827" }}>
                75%
              </Box>{" "}
              Patients
            </Typography>
          </Box>

          {/* Bar Chart Representation (Corrected Axis Spacing & Zero Label Overlap) */}
          <Box sx={{ width: "100%", height: 170, position: "relative", mt: 1 }}>
            <svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="none">
              {/* Horizontal Grid Lines */}
              <line x1="35" y1="30" x2="305" y2="30" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="35" y1="65" x2="305" y2="65" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="35" y1="100" x2="305" y2="100" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="35" y1="135" x2="305" y2="135" stroke="#E2EDF2" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="8" y="34" fill="#94A3B8" fontSize="10" fontWeight="500">80</text>
              <text x="8" y="69" fill="#94A3B8" fontSize="10" fontWeight="500">60</text>
              <text x="8" y="104" fill="#94A3B8" fontSize="10" fontWeight="500">40</text>
              <text x="8" y="139" fill="#94A3B8" fontSize="10" fontWeight="500">00</text>

              {/* Bar 1: 41-70y+ (75%) */}
              <rect x="55" y="30" width="42" height="105" fill="#E6F8FA" rx="6" />
              <rect x="55" y="52" width="42" height="83" fill="#008096" rx="6" />

              {/* Bar 2: 19-40y (45%) */}
              <rect x="145" y="30" width="42" height="105" fill="#E6F8FA" rx="6" />
              <rect x="145" y="82" width="42" height="53" fill="#008096" rx="6" />

              {/* Bar 3: 0-18y (15%) */}
              <rect x="235" y="30" width="42" height="105" fill="#E6F8FA" rx="6" />
              <rect x="235" y="115" width="42" height="20" fill="#008096" rx="6" />

              {/* X Axis Labels (Positioned safely below the bottom line) */}
              <text x="76" y="162" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">41-70y+</text>
              <text x="166" y="162" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">19-40y</text>
              <text x="256" y="162" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">0-18y</text>
            </svg>
          </Box>
        </Paper>
      </Box>

      {/* ======================================================
          DOCTOR PERFORMANCE LIST CARD & TABLE
      ====================================================== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2EDF2",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Card Header Toolbar */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.2rem" }}>
            Doctor Performance list
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            {/* Search Doctor Input */}
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.8,
                py: 0.6,
                borderRadius: "20px",
                backgroundColor: "#F4F9FB",
                border: "1px solid #D5E8ED",
                width: { xs: "100%", sm: 220 },
              }}
            >
              <Search size={16} color="#00ADC6" style={{ marginRight: 8 }} />
              <InputBase
                placeholder="Search doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ fontSize: "0.85rem", color: "#111827", flex: 1 }}
              />
            </Paper>

            {/* Timeframe Button */}
            <Button
              onClick={(e) => setTableTimeframeAnchor(e.currentTarget)}
              endIcon={<ChevronDown size={16} />}
              sx={{
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                borderRadius: "20px",
                px: 2.2,
                py: 0.8,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.88rem",
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              {tableTimeframe}
            </Button>

            <Menu
              anchorEl={tableTimeframeAnchor}
              open={Boolean(tableTimeframeAnchor)}
              onClose={() => setTableTimeframeAnchor(null)}
              slotProps={{ paper: { sx: { borderRadius: "12px", mt: 1, minWidth: 130 } } }}
            >
              <MenuItem onClick={() => { setTableTimeframe("Monthly"); setTableTimeframeAnchor(null); }}>Monthly</MenuItem>
              <MenuItem onClick={() => { setTableTimeframe("Weekly"); setTableTimeframeAnchor(null); }}>Weekly</MenuItem>
              <MenuItem onClick={() => { setTableTimeframe("Yearly"); setTableTimeframeAnchor(null); }}>Yearly</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Table Container */}
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 950 }}>
            {/* Dark Navy Table Header (Matches Image 3) */}
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1F2937" }}>
                {/* Doctor */}
                <TableCell
                  onClick={() => handleSort("doctorName")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    py: 1.8,
                    pl: 3,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Doctor
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Specialist */}
                <TableCell
                  onClick={() => handleSort("specialist")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Specialist
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Patients */}
                <TableCell
                  onClick={() => handleSort("patients")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Patients
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Phone Number */}
                <TableCell
                  onClick={() => handleSort("phoneNumber")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Phone Number
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Hours Worked */}
                <TableCell
                  onClick={() => handleSort("hoursWorked")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Hours Worked
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Credits Used */}
                <TableCell
                  onClick={() => handleSort("creditsUsed")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Credits Used
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Ratings */}
                <TableCell
                  onClick={() => handleSort("rating")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    pr: 3,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Ratings
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.id;

                return (
                  <TableRow
                    key={doc.id}
                    hover
                    onClick={() => setSelectedDoctorId(doc.id)}
                    sx={{
                      backgroundColor: isSelected ? COLOR_CYAN_LIGHT : "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                        backgroundColor: isSelected ? "#DCF5F9" : "#F7FCFD",
                      },
                    }}
                  >
                    {/* Doctor Name */}
                    <TableCell sx={{ pl: 3, fontWeight: 600, color: "#1F2937", fontSize: "0.92rem" }}>
                      {doc.doctorName}
                    </TableCell>

                    {/* Specialist */}
                    <TableCell sx={{ color: "#4B5563", fontSize: "0.9rem" }}>
                      {doc.specialist}
                    </TableCell>

                    {/* Patients Count */}
                    <TableCell sx={{ color: "#374151", fontSize: "0.9rem", fontWeight: 600 }}>
                      {doc.patients}
                    </TableCell>

                    {/* Phone Number */}
                    <TableCell sx={{ color: "#4B5563", fontSize: "0.9rem" }}>
                      {doc.phoneNumber}
                    </TableCell>

                    {/* Hours Worked */}
                    <TableCell sx={{ color: "#4B5563", fontSize: "0.9rem" }}>
                      {doc.hoursWorked}
                    </TableCell>

                    {/* Credits Used */}
                    <TableCell sx={{ fontWeight: 700, color: "#1F2937", fontSize: "0.92rem" }}>
                      {doc.creditsUsed.toLocaleString()} Credits
                    </TableCell>

                    {/* Ratings */}
                    <TableCell sx={{ pr: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Star size={16} fill="#EAB308" color="#EAB308" />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#1F2937", fontSize: "0.9rem" }}>
                          {doc.rating}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredDoctors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" sx={{ color: "#6B7280", fontWeight: 500 }}>
                      No doctors found matching your query.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminAnalyticsPage;
