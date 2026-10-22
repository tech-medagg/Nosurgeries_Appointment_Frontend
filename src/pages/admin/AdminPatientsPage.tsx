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
  Checkbox,
  Button,
  IconButton,
  MenuItem,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Calendar as CalendarIcon,
  ArrowUpDown,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TimeframeSelector, type TimeframeType } from "../../components/common/TimeframeSelector";
import { isDateInTimeframe } from "../../utils/date.utils";
import { useAuth } from "../../context/AuthContext";

/* ======================================================
   Types & Interfaces
====================================================== */

export type PatientStatus = "Admitted" | "In-Treatment" | "Discharged";

export interface PatientRecord {
  id: string;
  patientName: string;
  age: number;
  gender: "Male" | "Female";
  condition: string;
  patientType: "Out Patient" | "In Patient";
  doctor: string;
  admissionDate: string; // e.g. "19-07-2026"
  admissionTime: string; // e.g. "06.15AM"
  location: string; // e.g. "404 A"
  status: PatientStatus;
}

/* ======================================================
   Initial Initial Patient Mock Data (Matches Screenshot Exactly)
====================================================== */

const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: "PAT-001",
    patientName: "Alice Saint",
    age: 40,
    gender: "Male",
    condition: "Bleeding Gums",
    patientType: "Out Patient",
    doctor: "Dr. Daniel Lee",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "404 A",
    status: "Admitted",
  },
  {
    id: "PAT-002",
    patientName: "Lucas Anton",
    age: 42,
    gender: "Male",
    condition: "Bad Breath",
    patientType: "Out Patient",
    doctor: "Dr. Brasses Saint",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "410 A",
    status: "In-Treatment",
  },
  {
    id: "PAT-003",
    patientName: "Thomas Charls",
    age: 45,
    gender: "Male",
    condition: "Tooth Sensitivity",
    patientType: "Out Patient",
    doctor: "Dr. John Wilson",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "404 A",
    status: "Admitted",
  },
  {
    id: "PAT-004",
    patientName: "Nice Patel",
    age: 40,
    gender: "Female",
    condition: "Calculus build-up",
    patientType: "Out Patient",
    doctor: "Dr. Brasses Saint",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "404 A",
    status: "Admitted",
  },
  {
    id: "PAT-005",
    patientName: "Gems Yamal",
    age: 29,
    gender: "Male",
    condition: "Tooth Sensitivity",
    patientType: "In Patient",
    doctor: "Dr. Daniel Lee",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "320 A",
    status: "In-Treatment",
  },
  {
    id: "PAT-006",
    patientName: "Aldrik Asher",
    age: 40,
    gender: "Male",
    condition: "Calculus build-up",
    patientType: "Out Patient",
    doctor: "Dr. Brasses Saint",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "404 A",
    status: "Admitted",
  },
  {
    id: "PAT-007",
    patientName: "Wilson wilson",
    age: 35,
    gender: "Male",
    condition: "Tooth Decay",
    patientType: "In Patient",
    doctor: "Dr. Daniel Lee",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "404 A",
    status: "Admitted",
  },
  {
    id: "PAT-008",
    patientName: "Alice Saint",
    age: 40,
    gender: "Male",
    condition: "Calculus build-up",
    patientType: "Out Patient",
    doctor: "Dr. John Wilson",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "115 A",
    status: "Discharged",
  },
  {
    id: "PAT-009",
    patientName: "Willium Thomas",
    age: 40,
    gender: "Male",
    condition: "Tooth Sensitivity",
    patientType: "Out Patient",
    doctor: "Dr. Brasses Saint",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "506",
    status: "Admitted",
  },
  {
    id: "PAT-010",
    patientName: "Shaqira",
    age: 40,
    gender: "Female",
    condition: "Wisdom Tooth Pain",
    patientType: "Out Patient",
    doctor: "Dr. Daniel Lee",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "301 B",
    status: "In-Treatment",
  },
  {
    id: "PAT-011",
    patientName: "Catherin Angel",
    age: 37,
    gender: "Female",
    condition: "Tooth Sensitivity",
    patientType: "In Patient",
    doctor: "Dr. Daniel Lee",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "407BA",
    status: "Admitted",
  },
  {
    id: "PAT-012",
    patientName: "Jaqueline",
    age: 39,
    gender: "Female",
    condition: "Bleeding Gums",
    patientType: "In Patient",
    doctor: "Dr. John Wilson",
    admissionDate: "19-07-2026",
    admissionTime: "06.15AM",
    location: "404 A",
    status: "Admitted",
  },
];

/* ======================================================
   Theme Colors (Matching Dentivo Mockup)
====================================================== */

const COLOR_CYAN = "#00ADC6";
const COLOR_CYAN_HOVER = "#009BB2";
const COLOR_CYAN_LIGHT = "#E6F8FA";
const COLOR_CYAN_PILL = "#B9F2FB";
const COLOR_CYAN_TEXT = "#006778";

const COLOR_TEAL_PILL = "#7FE1C2";
const COLOR_TEAL_TEXT = "#005C43";

const COLOR_RED_PILL = "#F99B9B";
const COLOR_RED_TEXT = "#9D2323";

const AdminPatientsPage: React.FC = () => {
  const { user } = useAuth();

  // State Management
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [selectedIds, setSelectedIds] = useState<string[]>(["PAT-003"]); // Thomas Charls selected by default as in mockup
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTimeframe, setFilterTimeframe] = useState<TimeframeType>("Weekly");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  
  // Sort State
  const [sortField, setSortField] = useState<keyof PatientRecord>("patientName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Modal State for New Patient
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<PatientRecord | null>(null);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState<Partial<PatientRecord>>({
    patientName: "",
    age: 30,
    gender: "Male",
    condition: "Dental Checkup",
    patientType: "Out Patient",
    doctor: "Dr. Daniel Lee",
    location: "101 A",
    status: "Admitted",
  });

  // Calculate First Name for greeting
  const userName = user?.fullName || (user?.email ? user.email.split("@")[0] : "Admin");

  // Handle Sort Toggle
  const handleSort = (field: keyof PatientRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter & Sort Patients
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          p.patientName.toLowerCase().includes(query) ||
          p.condition.toLowerCase().includes(query) ||
          p.doctor.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.status.toLowerCase().includes(query);
        const matchesTimeframe = isDateInTimeframe(p.admissionDate, filterTimeframe, customStart, customEnd);
        return matchesSearch && matchesTimeframe;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [patients, searchQuery, filterTimeframe, customStart, customEnd, sortField, sortDirection]);

  // Paginated Patients
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / rowsPerPage));
  const displayedPatients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredPatients.slice(start, start + rowsPerPage);
  }, [filteredPatients, currentPage, rowsPerPage]);

  // Select All Toggle
  const isAllSelected =
    displayedPatients.length > 0 &&
    displayedPatients.every((p) => selectedIds.includes(p.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allPageIds = displayedPatients.map((p) => p.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allPageIds])));
    } else {
      const pageIdSet = new Set(displayedPatients.map((p) => p.id));
      setSelectedIds(selectedIds.filter((id) => !pageIdSet.has(id)));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Create New Patient
  const handleAddPatientSubmit = () => {
    if (!newPatient.patientName) return;

    const todayStr = "19-07-2026";
    const timeStr = "09.30AM";

    const created: PatientRecord = {
      id: `PAT-0${patients.length + 1}`,
      patientName: newPatient.patientName,
      age: Number(newPatient.age) || 30,
      gender: (newPatient.gender as "Male" | "Female") || "Male",
      condition: newPatient.condition || "Dental Checkup",
      patientType: (newPatient.patientType as "Out Patient" | "In Patient") || "Out Patient",
      doctor: newPatient.doctor || "Dr. Daniel Lee",
      admissionDate: todayStr,
      admissionTime: timeStr,
      location: newPatient.location || "101 A",
      status: (newPatient.status as PatientStatus) || "Admitted",
    };

    setPatients([created, ...patients]);
    setIsAddDialogOpen(false);
    setNewPatient({
      patientName: "",
      age: 30,
      gender: "Male",
      condition: "Dental Checkup",
      patientType: "Out Patient",
      doctor: "Dr. Daniel Lee",
      location: "101 A",
      status: "Admitted",
    });
  };

  // Render Status Badge Pill
  const renderStatusChip = (status: PatientStatus) => {
    let bg = COLOR_CYAN_PILL;
    let text = COLOR_CYAN_TEXT;

    if (status === "In-Treatment") {
      bg = COLOR_TEAL_PILL;
      text = COLOR_TEAL_TEXT;
    } else if (status === "Discharged") {
      bg = COLOR_RED_PILL;
      text = COLOR_RED_TEXT;
    }

    return (
      <Box
        sx={{
          backgroundColor: bg,
          color: text,
          px: 2,
          py: 0.6,
          borderRadius: "20px",
          fontWeight: 700,
          fontSize: "0.82rem",
          display: "inline-block",
          textAlign: "center",
          minWidth: 100,
        }}
      >
        {status}
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* ======================================================
          HEADER SECTION (Welcome + Quick Controls)
      ====================================================== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Welcome Greeting & Date */}
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

        {/* Top Right Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: COLOR_CYAN,
              color: "#FFFFFF",
              borderRadius: "12px",
              px: 3,
              py: 1,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              boxShadow: "0 4px 12px rgba(0, 173, 198, 0.3)",
              "&:hover": {
                backgroundColor: COLOR_CYAN_HOVER,
              },
            }}
          >
            All
          </Button>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{
              backgroundColor: "#045E6A",
              color: "#FFFFFF",
              borderRadius: "12px",
              px: 2.5,
              py: 1,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              "&:hover": {
                backgroundColor: "#034953",
              },
            }}
          >
            Add Patient
          </Button>
        </Box>
      </Box>

      {/* ======================================================
          PATIENTS LIST MAIN CARD & TABLE
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
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "#111827", fontSize: "1.25rem" }}
          >
            Patients List
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            {/* Real-time Filter Search input */}
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
                placeholder="Search patient, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ fontSize: "0.85rem", color: "#111827", flex: 1 }}
              />
            </Paper>

            {/* Timeframe Dropdown (Weekly v) */}
            <TimeframeSelector
              value={filterTimeframe}
              onChange={setFilterTimeframe}
              customStartDate={customStart}
              customEndDate={customEnd}
              onCustomDateChange={(start, end) => {
                setCustomStart(start);
                setCustomEnd(end);
              }}
            />
          </Box>
        </Box>

        {/* Table Container */}
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 1050 }}>
            {/* Table Header with Vivid Cyan Background */}
            <TableHead>
              <TableRow sx={{ backgroundColor: COLOR_CYAN }}>
                {/* Select All Checkbox */}
                <TableCell padding="checkbox" sx={{ pl: 2, color: "#FFFFFF" }}>
                  <Checkbox
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < displayedPatients.length
                    }
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      "&.Mui-checked": { color: "#FFFFFF" },
                    }}
                  />
                </TableCell>

                {/* Patient Name */}
                <TableCell
                  onClick={() => handleSort("patientName")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    py: 1.8,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Patient Name
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Age */}
                <TableCell
                  onClick={() => handleSort("age")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Age
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Gender */}
                <TableCell
                  onClick={() => handleSort("gender")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Gender
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Condition */}
                <TableCell
                  onClick={() => handleSort("condition")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Condition
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Patient Type */}
                <TableCell
                  onClick={() => handleSort("patientType")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Patient Type
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Doctor */}
                <TableCell
                  onClick={() => handleSort("doctor")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Doctor
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Admission Date */}
                <TableCell
                  onClick={() => handleSort("admissionDate")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Admission Date
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Location */}
                <TableCell
                  onClick={() => handleSort("location")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Location
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Status */}
                <TableCell
                  onClick={() => handleSort("status")}
                  align="center"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    pr: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    Status
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body Rows */}
            <TableBody>
              {displayedPatients.map((patient) => {
                const isSelected = selectedIds.includes(patient.id);

                return (
                  <TableRow
                    key={patient.id}
                    hover
                    onClick={() => setSelectedPatientDetail(patient)}
                    sx={{
                      backgroundColor: isSelected ? COLOR_CYAN_LIGHT : "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                        backgroundColor: isSelected ? "#DCF5F9" : "#F7FCFD",
                      },
                    }}
                  >
                    {/* Row Checkbox */}
                    <TableCell
                      padding="checkbox"
                      sx={{ pl: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRow(patient.id);
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectRow(patient.id)}
                        sx={{
                          color: "#9CA3AF",
                          "&.Mui-checked": { color: COLOR_CYAN },
                        }}
                      />
                    </TableCell>

                    {/* Patient Name */}
                    <TableCell sx={{ fontWeight: 600, color: "#1F2937", fontSize: "0.92rem" }}>
                      {patient.patientName}
                    </TableCell>

                    {/* Age */}
                    <TableCell sx={{ color: "#4B5563", fontSize: "0.9rem" }}>
                      {patient.age}
                    </TableCell>

                    {/* Gender */}
                    <TableCell sx={{ color: "#4B5563", fontSize: "0.9rem" }}>
                      {patient.gender}
                    </TableCell>

                    {/* Condition */}
                    <TableCell sx={{ color: "#374151", fontSize: "0.9rem", fontWeight: 500 }}>
                      {patient.condition}
                    </TableCell>

                    {/* Patient Type */}
                    <TableCell sx={{ color: "#4B5563", fontSize: "0.9rem" }}>
                      {patient.patientType}
                    </TableCell>

                    {/* Doctor */}
                    <TableCell sx={{ fontWeight: 700, color: "#1F2937", fontSize: "0.9rem" }}>
                      {patient.doctor}
                    </TableCell>

                    {/* Admission Date + Time */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography
                        component="span"
                        sx={{ fontWeight: 700, color: "#1F2937", fontSize: "0.88rem" }}
                      >
                        {patient.admissionDate}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{ fontSize: "0.72rem", color: "#6B7280", ml: 0.8, fontWeight: 500 }}
                      >
                        {patient.admissionTime}
                      </Typography>
                    </TableCell>

                    {/* Location */}
                    <TableCell sx={{ color: "#374151", fontSize: "0.9rem", fontWeight: 500 }}>
                      {patient.location}
                    </TableCell>

                    {/* Status Pill */}
                    <TableCell align="center" sx={{ pr: 3 }}>
                      {renderStatusChip(patient.status)}
                    </TableCell>
                  </TableRow>
                );
              })}

              {displayedPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" sx={{ color: "#6B7280", fontWeight: 500 }}>
                      No patients found matching your search criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Card Footer Pagination */}
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #E2EDF2",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Selected Count / Item Summary */}
          <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>
            Showing {displayedPatients.length} of {filteredPatients.length} patients
            {selectedIds.length > 0 && ` (${selectedIds.length} selected)`}
          </Typography>

          {/* Pagination Navigation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              sx={{ color: "#4B5563" }}
            >
              <ChevronLeft size={18} />
            </IconButton>

            {[1, 2, 3, 4].map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                sx={{
                  minWidth: 32,
                  height: 32,
                  p: 0,
                  borderRadius: "8px",
                  fontWeight: currentPage === page ? 800 : 500,
                  color: currentPage === page ? "#111827" : "#6B7280",
                  backgroundColor: currentPage === page ? "#E6F8FA" : "transparent",
                  "&:hover": {
                    backgroundColor: "#E6F8FA",
                  },
                }}
              >
                {page}
              </Button>
            ))}

            <Typography variant="body2" sx={{ color: "#6B7280", px: 0.5 }}>
              ...
            </Typography>

            <IconButton
              size="small"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              sx={{ color: "#4B5563" }}
            >
              <ChevronRight size={18} />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* ======================================================
          DIALOG: ADD NEW PATIENT
      ====================================================== */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#111827" }}>
          Add New Patient Record
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Patient Name"
            fullWidth
            size="small"
            value={newPatient.patientName}
            onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Age"
              type="number"
              fullWidth
              size="small"
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={newPatient.gender}
                label="Gender"
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as "Male" | "Female" })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Condition"
            fullWidth
            size="small"
            value={newPatient.condition}
            onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Patient Type</InputLabel>
              <Select
                value={newPatient.patientType}
                label="Patient Type"
                onChange={(e) => setNewPatient({ ...newPatient, patientType: e.target.value as "Out Patient" | "In Patient" })}
              >
                <MenuItem value="Out Patient">Out Patient</MenuItem>
                <MenuItem value="In Patient">In Patient</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={newPatient.status}
                label="Status"
                onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value as "Admitted" | "In-Treatment" | "Discharged" })}
              >
                <MenuItem value="Admitted">Admitted</MenuItem>
                <MenuItem value="In-Treatment">In-Treatment</MenuItem>
                <MenuItem value="Discharged">Discharged</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Doctor"
              fullWidth
              size="small"
              value={newPatient.doctor}
              onChange={(e) => setNewPatient({ ...newPatient, doctor: e.target.value })}
            />
            <TextField
              label="Location / Room"
              fullWidth
              size="small"
              value={newPatient.location}
              onChange={(e) => setNewPatient({ ...newPatient, location: e.target.value })}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAddDialogOpen(false)} sx={{ color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPatientSubmit}
            sx={{
              backgroundColor: COLOR_CYAN,
              color: "#FFFFFF",
              fontWeight: 700,
              borderRadius: "10px",
              "&:hover": { backgroundColor: COLOR_CYAN_HOVER },
            }}
          >
            Save Patient
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          DIALOG: PATIENT DETAILS VIEW
      ====================================================== */}
      {selectedPatientDetail && (
        <Dialog
          open={Boolean(selectedPatientDetail)}
          onClose={() => setSelectedPatientDetail(null)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: "#111827" }}>
            Patient Information
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Patient Name
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827" }}>
                  {selectedPatientDetail.patientName}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Age / Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedPatientDetail.age} yrs, {selectedPatientDetail.gender}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedPatientDetail.location}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Medical Condition
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#00ADC6" }}>
                  {selectedPatientDetail.condition}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Attending Doctor
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedPatientDetail.doctor}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Current Status
                </Typography>
                {renderStatusChip(selectedPatientDetail.status)}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setSelectedPatientDetail(null)}
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                borderRadius: "10px",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminPatientsPage;
