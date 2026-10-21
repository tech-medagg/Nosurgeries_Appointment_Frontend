import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MedicationIcon from "@mui/icons-material/Medication";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { PrescriptionPreviewModal } from "../../components/common/PrescriptionPreviewModal";
import { AppointmentEventPopup } from "../../components/common/AppointmentEventPopup";

import "./AdminAppointmentDesk.css";

import {
  getAppointmentsApi,
  getDoctorAvailabilityApi,
  updateAppointmentApi,
  deleteAppointmentApi,
} from "../../services/appointment.api";
import { getHospitalsApi } from "../../services/hospital.api";
import { getDepartmentsApi } from "../../services/department.api";

import type {
  AppointmentListItem,
  AppointmentStatus,
  DoctorAvailability,
} from "../../types/appointment.types";

import { AppointmentRequestDetailsDialog } from "../../components/admin/AppointmentRequestDetailsDialog";
import { DoctorSelectorModal } from "../../components/admin/DoctorSelectorModal";
import { SlotSelectorModal } from "../../components/admin/SlotSelectorModal";
import { ConfirmScheduleModal } from "../../components/admin/ConfirmScheduleModal";
import { AppointmentStatusDialog } from "../../components/admin/AppointmentStatusDialog";
import { TimeframeSelector, type TimeframeType } from "../../components/common/TimeframeSelector";
import { isDateInTimeframe, getChartDataForTimeframe } from "../../utils/date.utils";
import { useAuth } from "../../context/AuthContext";

const TEAL = "#1CA7C0";
const TEAL_LIGHT = "#E8F8FB";
const PAGE_BG = "#F4F8FA";
const BORDER = "#E2EDF2";

function getStatusClass(status: string): string {
  return status.toLowerCase().replace(/_/g, "_");
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}


/* ------------------------------------------------------------
   Appointment Stats â€” pure-SVG area chart (no extra library)
------------------------------------------------------------ */
interface AreaChartProps {
  data: number[];
  labels: string[];
  width?: number;
  height?: number;
}

const AreaChartSVG: React.FC<AreaChartProps> = ({
  data,
  labels,
  width = 520,
  height = 200,
}) => {
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const max = Math.max(...data, 1);
  const yTicks = [0, Math.round(max * 0.33), Math.round(max * 0.66), max];

  const pts = data.map((v, i) => {
    const x = padL + (i / (data.length - 1)) * innerW;
    const y = padT + innerH - (v / max) * innerH;
    return `${x},${y}`;
  });

  const areaPath =
    `M ${pts[0]} ` +
    pts.slice(1).map(p => `L ${p}`).join(" ") +
    ` L ${padL + innerW},${padT + innerH} L ${padL},${padT + innerH} Z`;

  const linePath = `M ${pts[0]} ` + pts.slice(1).map(p => `L ${p}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%", display: "block" }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1CA7C0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1CA7C0" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y-axis grid lines + labels */}
      {yTicks.map((tick) => {
        const y = padT + innerH - (tick / max) * innerH;
        return (
          <g key={tick}>
            <line x1={padL} y1={y} x2={padL + innerW} y2={y}
              stroke="#E2EDF2" strokeWidth={1} />
            <text x={padL - 6} y={y + 4} textAnchor="end"
              fontSize={10} fill="#9CA3AF">{tick}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#1CA7C0" strokeWidth={2}
        strokeLinejoin="round" strokeLinecap="round" />

      {/* X-axis labels */}
      {labels.map((lbl, i) => {
        const x = padL + (i / (labels.length - 1)) * innerW;
        return (
          <text key={lbl} x={x} y={height - 6} textAnchor="middle"
            fontSize={11} fill="#9CA3AF">{lbl}</text>
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------
   Appointment Type — horizontal progress bars
------------------------------------------------------------ */
interface TypeRowProps {
  label: string;
  pct: number;
  patients: number;
  barColor: string;
}

const TypeRow: React.FC<TypeRowProps> = ({ label, pct, patients, barColor }) => (
  <Box sx={{ mb: 2 }}>
    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827", mb: 0.4 }}>
      {label}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", minWidth: 34 }}>{pct}%</Typography>
      <Box sx={{ width: "1px", height: 14, background: "#D1D5DB" }} />
      <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", minWidth: 110 }}>
        {patients} Total Patients
      </Typography>
      {/* Track */}
      <Box sx={{ flex: 1, height: 10, borderRadius: "9999px", background: "#D7F3F8", overflow: "hidden" }}>
        <Box sx={{
          width: `${pct}%`, height: "100%",
          borderRadius: "9999px",
          background: barColor,
          transition: "width 0.6s ease",
        }} />
      </Box>
    </Box>
  </Box>
);
export const AdminAppointmentDeskPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedHospital, setSelectedHospital] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeframe, setTimeframe] = useState<TimeframeType>("Weekly");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentListItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [doctorModalOpen, setDoctorModalOpen] = useState<boolean>(false);
  const [slotModalOpen, setSlotModalOpen] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);

  const [previewPrescriptionApt, setPreviewPrescriptionApt] = useState<AppointmentListItem | null>(null);
  const [eventPopup, setEventPopup] = useState<{
    open: boolean;
    appointment: AppointmentListItem | null;
  }>({ open: false, appointment: null });

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { data: hospitalData } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => getHospitalsApi({ limit: 100 }),
  });

  const { data: departmentData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartmentsApi({ limit: 100 }),
  });

  const {
    data: queueData,
    isLoading: isQueueLoading,
    isError: isQueueError,
    error: queueError,
    refetch: refetchQueue,
  } = useQuery({
    queryKey: ["admin", "appointments", selectedStatus, selectedHospital, selectedDepartment],
    queryFn: () =>
      getAppointmentsApi({
        status: selectedStatus !== "ALL" ? (selectedStatus as AppointmentStatus) : undefined,
        hospitalId: selectedHospital !== "ALL" ? selectedHospital : undefined,
        departmentId: selectedDepartment !== "ALL" ? selectedDepartment : undefined,
        limit: 100,
      }),
  });

  useEffect(() => {
    const apts = queueData?.appointments ?? [];
    const pending = apts.find((a) => a.status === "PENDING");
    if (pending) {
      const notifiedKey = `ns_admin_notified_${pending.id}`;
      if (!sessionStorage.getItem(notifiedKey)) {
        sessionStorage.setItem(notifiedKey, "true");
        setEventPopup({ open: true, appointment: pending });
      }
    }
  }, [queueData]);

  const { data: availabilityData, isLoading: isAvailabilityLoading, error: availabilityError } = useQuery({
    queryKey: [
      "admin", "doctorAvailability",
      selectedAppointment?.hospitalId,
      selectedAppointment?.departmentId,
      selectedDate,
    ],
    queryFn: () =>
      getDoctorAvailabilityApi(
        selectedAppointment!.hospitalId,
        selectedAppointment!.departmentId,
        selectedDate
      ),
    enabled: !!selectedAppointment && !!selectedAppointment.hospitalId && !!selectedAppointment.departmentId && doctorModalOpen,
  });

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAppointment || !selectedDoctor || !selectedTimeSlot) {
        throw new Error("Missing doctor or slot selection.");
      }
      return updateAppointmentApi(selectedAppointment.id, {
        doctorProfileId: selectedDoctor.doctorProfileId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot,
        status: "CONFIRMED",
      });
    },
    onSuccess: (res) => {
      if (res.success) {
        setSnackbar({ open: true, message: "Appointment successfully scheduled & confirmed!", severity: "success" });
        queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
        setConfirmModalOpen(false);
        setSlotModalOpen(false);
        setDoctorModalOpen(false);
        setSelectedAppointment(null);
        setSelectedDoctor(null);
        setSelectedTimeSlot(null);
      } else {
        setSnackbar({ open: true, message: res.message || "Failed to schedule appointment.", severity: "error" });
      }
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: e?.response?.data?.message || e.message || "Slot unavailable. Please try another.", severity: "error" });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => deleteAppointmentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
      setDeleteAdminId(null);
      setSnackbar({ open: true, message: "Appointment record deleted successfully!", severity: "success" });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: e?.response?.data?.message || "Failed to delete appointment.", severity: "error" });
    },
  });

  const appointmentsList = queueData?.appointments || [];
  const chartData = getChartDataForTimeframe(timeframe);
  const filteredAppointments = appointmentsList.filter((apt) => {
    if (!isDateInTimeframe(apt.appointmentDate, timeframe, customStartDate, customEndDate)) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const patientName = `${apt.patientFirstName || ""} ${apt.patientLastName || ""}`.toLowerCase();
    return (
      patientName.includes(q) ||
      apt.id.toLowerCase().includes(q) ||
      (apt.hospitalName || "").toLowerCase().includes(q)
    );
  });

  const ongoingCount = appointmentsList.filter((a) => a.status === "CONFIRMED" || a.status === "CHECKED_IN").length;
  const totalCount = appointmentsList.length;
  const completedCount = appointmentsList.filter((a) => a.status === "COMPLETED").length;

  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const firstName = user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Admin";

  const handleOpenSchedule = (apt: AppointmentListItem) => {
    setSelectedAppointment(apt);
    if (apt.appointmentDate) {
      const rawDate = apt.appointmentDate;
      const dateStr = typeof rawDate === "string" && rawDate.includes("T") ? rawDate.split("T")[0] : (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : new Date(rawDate).toISOString().split("T")[0]);
      if (dateStr) setSelectedDate(dateStr);
    }
    setSelectedDoctor(null);
    if (apt.appointmentTime) {
      setSelectedTimeSlot(apt.appointmentTime);
    } else {
      setSelectedTimeSlot(null);
    }
    setDoctorModalOpen(true);
  };

  const handleSelectDoctor = (doc: DoctorAvailability) => {
    setSelectedDoctor(doc);
    setDoctorModalOpen(false);
    setSlotModalOpen(true);
  };

  const handleConfirmSlotSelection = () => {
    setSlotModalOpen(false);
    setConfirmModalOpen(true);
  };

  const hospitalsList = hospitalData?.data || [];
  const departmentsList = departmentData?.data || [];

  const inputSx = {
    background: "#F8FAFC",
    borderRadius: "10px",
    "& fieldset": { borderColor: BORDER },
    "& input": { color: "#111827" },
    "&:hover fieldset": { borderColor: TEAL },
    "& .Mui-focused fieldset": { borderColor: TEAL },
  };

  const selectSx = {
    background: "#F8FAFC",
    borderRadius: "10px",
    color: "#111827",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: TEAL },
    "&.Mui-focused fieldset": { borderColor: TEAL },
  };

  return (
    <div className="admin-desk-container animate-fade-in" style={{ background: PAGE_BG }}>

      {/* -- Welcome Header -- */}
      <div className="admin-desk-header">
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#6B7280" }}>
              Appointments
            </Typography>
          </Box>
          <Typography className="admin-desk-title">
            Welcome back, <span>{firstName}</span>
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
            <Typography className="admin-desk-subtitle">{todayFormatted}</Typography>
          </Box>
        </Box>

        {/* Inline stat counters — top-right */}
        <div className="admin-stats-strip">
          <div className="admin-stat-item">
            <Box sx={{ color: TEAL, fontSize: "1.6rem", display: "flex" }}>
              <AccessAlarmIcon fontSize="inherit" />
            </Box>
            <Box>
              <div className="admin-stat-number">{ongoingCount}</div>
              <div className="admin-stat-label">On Going</div>
            </Box>
          </div>

          <Box sx={{ width: "1px", height: 40, background: BORDER }} />

          <div className="admin-stat-item">
            <Box sx={{ color: TEAL, fontSize: "1.6rem", display: "flex" }}>
              <EventNoteIcon fontSize="inherit" />
            </Box>
            <Box>
              <div className="admin-stat-number">{totalCount}</div>
              <div className="admin-stat-label">Appointment</div>
            </Box>
          </div>

          <Box sx={{ width: "1px", height: 40, background: BORDER }} />

          <div className="admin-stat-item">
            <Box sx={{ color: TEAL, fontSize: "1.6rem", display: "flex" }}>
              <TaskAltIcon fontSize="inherit" />
            </Box>
            <Box>
              <div className="admin-stat-number">{completedCount}</div>
              <div className="admin-stat-label">Completed</div>
            </Box>
          </div>
        </div>
      </div>
      {/* -- Stats Section: Area Chart + Appointment Types -- */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 420px" }, gap: 2.5, mb: 2.5 }}>

        {/* Left — Appointment Stats chart */}
        <Box sx={{
          background: "#fff", border: `1px solid ${BORDER}`,
          borderRadius: "18px", p: 3,
          boxShadow: "0 2px 10px rgba(28,167,192,0.06)",
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                Appointment Stats
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.4 }}>
                <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>
                  Last week to increase{" "}
                  <span style={{ color: "#1CA7C0", fontWeight: 700 }}>30%</span>
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#1CA7C0" }} />
                  <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>
                    Total Appointment: {totalCount || 180}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <TimeframeSelector
              value={timeframe}
              onChange={setTimeframe}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomDateChange={(start, end) => {
                setCustomStartDate(start);
                setCustomEndDate(end);
              }}
            />
          </Box>

          {/* SVG Area Chart */}
          <Box sx={{ height: 200, mt: 1 }}>
            <AreaChartSVG
              data={chartData.data}
              labels={chartData.labels}
            />
          </Box>
        </Box>

        {/* Right — Appointment Type */}
        <Box sx={{
          background: "#fff", border: `1px solid ${BORDER}`,
          borderRadius: "18px", p: 3,
          boxShadow: "0 2px 10px rgba(28,167,192,0.06)",
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
              Appointment Type
            </Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: "1.2rem", cursor: "pointer", letterSpacing: "0.08em" }}>
              •••
            </Typography>
          </Box>

          <TypeRow label="Varicose Vein"   pct={30} patients={17} barColor="#0D5F6B" />
          <TypeRow label="Uterine Fibroid" pct={73} patients={32} barColor="#1CA7C0" />
          <TypeRow label="Prostate (PAE)"     pct={56} patients={28} barColor="#17C4A7" />
          <TypeRow label="Knee Pain (GAE)"  pct={80} patients={63} barColor="#7DE8F2" />
        </Box>
      </Box>


      {/* -- Filter Bar -- */}
      <div className="admin-filter-bar">
        <TextField
          size="small"
          placeholder="Search patient, ID or hospital..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9CA3AF", fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            ...inputSx,
            flexGrow: { xs: 1, sm: 0 },
            minWidth: { xs: "100%", sm: 240 },
          }}
        />

        <FormControl size="small" sx={{ minWidth: { xs: "48%", sm: 155 } }}>
          <InputLabel sx={{ color: "#6B7280", "&.Mui-focused": { color: TEAL } }}>Status</InputLabel>
          <Select value={selectedStatus} label="Status" onChange={(e) => setSelectedStatus(e.target.value)} sx={selectSx}>
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
            <MenuItem value="CHECKED_IN">CHECKED_IN</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            <MenuItem value="RESCHEDULED">RESCHEDULED</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: "48%", sm: 185 } }}>
          <InputLabel sx={{ color: "#6B7280", "&.Mui-focused": { color: TEAL } }}>Hospital</InputLabel>
          <Select value={selectedHospital} label="Hospital" onChange={(e) => setSelectedHospital(e.target.value)} sx={selectSx}>
            <MenuItem value="ALL">All Hospitals</MenuItem>
            {hospitalsList.map((h) => (
              <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 185 } }}>
          <InputLabel sx={{ color: "#6B7280", "&.Mui-focused": { color: TEAL } }}>Department</InputLabel>
          <Select value={selectedDepartment} label="Department" onChange={(e) => setSelectedDepartment(e.target.value)} sx={selectSx}>
            <MenuItem value="ALL">All Departments</MenuItem>
            {departmentsList.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetchQueue()}
            sx={{
              color: TEAL, borderColor: TEAL_LIGHT, borderRadius: "10px",
              fontWeight: 600, textTransform: "none",
              "&:hover": { borderColor: TEAL, background: TEAL_LIGHT },
            }}
          >
            Refresh
          </Button>
        </Box>
      </div>

      {/* -- Appointments Table Card -- */}
      <div className="admin-table-card">
        {/* Card Header */}
        <Box
          sx={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            px: 3, py: 2, borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
            Appointments
          </Typography>
          <Box
            sx={{
              background: "transparent", color: "#fff", borderRadius: "9999px",
              px: 2, py: 0.6, fontSize: "0.8rem", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer",
            }}
          >
            <TimeframeSelector
              value={timeframe}
              onChange={setTimeframe}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomDateChange={(start, end) => {
                setCustomStartDate(start);
                setCustomEndDate(end);
              }}
            />
          </Box>
        </Box>

        {isQueueLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: TEAL }} />
          </Box>
        ) : isQueueError ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error" sx={{ borderRadius: "12px" }}>
              {(queueError as unknown as { message: string })?.message || "Failed to load appointments."}
            </Alert>
          </Box>
        ) : filteredAppointments.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: TEAL, fontWeight: 600 }}>
              No appointments found.
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF", mt: 0.5 }}>
              Try adjusting your filters or refresh.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ background: "transparent", overflowX: "auto" }}>
            <Table sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow sx={{ background: TEAL }}>
                  {["Date & Time", "Patient Name", "Hospital & Dept", "Appointment Type", "Doctor", "Note", "Status", "Actions"].map((col) => (
                    <TableCell
                      key={col}
                      align={col === "Actions" ? "center" : "left"}
                      sx={{
                        color: "#FFFFFF", fontWeight: 700, fontSize: "0.82rem",
                        borderBottom: "none", py: 1.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.map((apt, idx) => {
                  const patientName = `${apt.patientFirstName || "Patient"} ${apt.patientLastName || ""}`.trim();
                  const doctorName = apt.doctorFirstName
                    ? `Dr. ${apt.doctorFirstName} ${apt.doctorLastName || ""}`.trim()
                    : null;
                  const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F9FBFC";

                  return (
                    <TableRow key={apt.id} className="admin-table-row" sx={{ background: rowBg }}>
                      {/* Date & Time */}
                      <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827", lineHeight: 1.3 }}>
                          {formatDate(apt.appointmentDate)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.2 }}>
                          {apt.appointmentTime || "TBD"}
                        </Typography>
                      </TableCell>

                      {/* Patient Name */}
                      <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.87rem", color: "#111827" }}>
                          {patientName}
                        </Typography>
                        {apt.patientMobile && (
                          <Typography sx={{ fontSize: "0.75rem", color: TEAL, fontWeight: 700, mt: 0.3, display: "flex", alignItems: "center", gap: 0.5 }}>
                            📞 {apt.patientMobile}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Hospital & Dept */}
                      <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#374151" }}>
                          {apt.hospitalName || "—"}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: TEAL, mt: 0.2 }}>
                          {apt.departmentName || "—"}
                        </Typography>
                      </TableCell>

                      {/* Appointment Type (notes/department as type) */}
                      <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                        <Typography sx={{ fontSize: "0.84rem", color: "#374151" }}>
                          {apt.notes || apt.departmentName || "Consultation"}
                        </Typography>
                      </TableCell>

                      {/* Doctor */}
                      <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                        <Typography sx={{ fontSize: "0.84rem", color: "#374151", fontWeight: doctorName ? 600 : 400, fontStyle: doctorName ? "normal" : "italic" }}>
                          {doctorName || "Unassigned"}
                        </Typography>
                      </TableCell>

                      {/* Note */}
                      <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}`, maxWidth: 140 }}>
                        <Typography
                          sx={{ fontSize: "0.82rem", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          title={apt.notes || ""}
                        >
                          {apt.notes || "—"}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                        <span className={`status-badge ${getStatusClass(apt.status)}`}>
                          <span className="status-badge-dot" />
                          {apt.status === "CHECKED_IN" ? "Checked In" :
                            apt.status === "CONFIRMED" ? "Confirmed" :
                            apt.status === "COMPLETED" ? "Completed" :
                            apt.status === "CANCELLED" ? "Cancelled" :
                            apt.status === "RESCHEDULED" ? "Rescheduled" :
                            "Pending"}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedAppointment(apt); setDetailsOpen(true); }}
                              sx={{ color: TEAL, "&:hover": { background: TEAL_LIGHT } }}
                            >
                              <VisibilityIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Schedule / Assign Doctor">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenSchedule(apt)}
                              sx={{
                                background: TEAL_LIGHT, color: TEAL,
                                "&:hover": { background: TEAL, color: "#fff" },
                                borderRadius: "8px", px: 0.8,
                              }}
                            >
                              <EventAvailableIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>

                          {apt.prescriptionUrl && (
                            <Tooltip title="Preview & Download Prescription">
                              <IconButton
                                size="small"
                                onClick={() => setPreviewPrescriptionApt(apt)}
                                sx={{
                                  background: "#ECFDF5",
                                  color: "#059669",
                                  border: "1px solid rgba(16, 185, 129, 0.4)",
                                  "&:hover": { background: "#059669", color: "#fff" },
                                  borderRadius: "8px",
                                  px: 0.8,
                                }}
                              >
                                <MedicationIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedAppointment(apt); setStatusDialogOpen(true); }}
                              sx={{ color: "#6B7280", "&:hover": { background: "#F3F4F6" } }}
                            >
                              <EditNoteIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Record">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteAdminId(apt.id)}
                              sx={{ color: "#EF4444", "&:hover": { background: "#FEF2F2" } }}
                            >
                              <DeleteIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* -- Modals -- */}
      <AppointmentRequestDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        appointment={selectedAppointment}
        onStartSchedule={selectedAppointment ? () => handleOpenSchedule(selectedAppointment) : undefined}
      />

      <DoctorSelectorModal
        open={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        doctors={availabilityData?.data || []}
        loading={isAvailabilityLoading}
        error={availabilityError ? (availabilityError as unknown as { message: string }).message : null}
        selectedDoctorId={selectedDoctor?.doctorProfileId}
        onSelectDoctor={handleSelectDoctor}
      />

      <SlotSelectorModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        doctor={selectedDoctor}
        selectedDate={selectedDate}
        onDateChange={(d) => setSelectedDate(d)}
        selectedTimeSlot={selectedTimeSlot}
        onSelectSlot={(s) => setSelectedTimeSlot(s)}
        onConfirmSelection={handleConfirmSlotSelection}
      />

      <ConfirmScheduleModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        appointment={selectedAppointment}
        doctor={selectedDoctor}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        onConfirm={() => scheduleMutation.mutate()}
        submitting={scheduleMutation.isPending}
        error={
          scheduleMutation.error
            ? ((scheduleMutation.error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (scheduleMutation.error as { message?: string })?.message)
            : null
        }
      />

      <AppointmentStatusDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        appointment={selectedAppointment}
        onUpdateStatus={async (newStatus) => {
          if (!selectedAppointment) return;
          await updateAppointmentApi(selectedAppointment.id, { status: newStatus });
          setSnackbar({ open: true, message: `Appointment status updated to ${newStatus}`, severity: "success" });
          queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
        }}
      />

      <Dialog
        open={!!deleteAdminId}
        onClose={() => setDeleteAdminId(null)}
        slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#111827" }}>Delete Appointment Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Are you sure you want to permanently delete this appointment record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteAdminId(null)} sx={{ color: "#6B7280", textTransform: "none" }}>Cancel</Button>
          <Button
            color="error" variant="contained"
            disabled={deleteAdminMutation.isPending}
            onClick={() => deleteAdminId && deleteAdminMutation.mutate(deleteAdminId)}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
          >
            {deleteAdminMutation.isPending ? "Deleting..." : "Delete Record"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%", borderRadius: "10px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PrescriptionPreviewModal
        open={!!previewPrescriptionApt}
        onClose={() => setPreviewPrescriptionApt(null)}
        fileUrl={previewPrescriptionApt?.prescriptionUrl}
        fileName={previewPrescriptionApt?.prescriptionFileName}
        fileType={previewPrescriptionApt?.prescriptionFileType}
        patientName={`${previewPrescriptionApt?.patientFirstName ?? ""} ${previewPrescriptionApt?.patientLastName ?? ""}`.trim()}
        doctorName={previewPrescriptionApt?.doctorFirstName ? `Dr. ${previewPrescriptionApt.doctorFirstName} ${previewPrescriptionApt.doctorLastName ?? ""}`.trim() : undefined}
        appointmentDate={previewPrescriptionApt?.appointmentDate}
      />

      {eventPopup.open && eventPopup.appointment && (
        <AppointmentEventPopup
          open={eventPopup.open}
          onClose={() => setEventPopup({ open: false, appointment: null })}
          type="ADMIN_NEW_BOOKING"
          isOldPatient={!!eventPopup.appointment.isOldPatient}
          patientName={`${eventPopup.appointment.patientFirstName ?? ""} ${eventPopup.appointment.patientLastName ?? ""}`.trim()}
          hospitalName={eventPopup.appointment.hospitalName}
          departmentName={eventPopup.appointment.departmentName}
          onAction={() => handleOpenSchedule(eventPopup.appointment!)}
        />
      )}
    </div>
  );
};

export default AdminAppointmentDeskPage;




