import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyDoctorProfileApi } from "../../services/doctor.api";
import { getAppointmentsApi, updateAppointmentApi, deleteAppointmentApi } from "../../services/appointment.api";
import { getDoctorAppointmentReportsApi, uploadReportApi } from "../../services/report.api";
import type { AppointmentListItem, AppointmentStatus } from "../../types/appointment.types";
import type { MedicalReport } from "../../types/report.types";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MedicationIcon from "@mui/icons-material/Medication";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

import { AppointmentRequestDetailsDialog } from "../../components/admin/AppointmentRequestDetailsDialog";
import { PrescriptionPreviewModal } from "../../components/common/PrescriptionPreviewModal";
import { AppointmentEventPopup } from "../../components/common/AppointmentEventPopup";

const isImageFile = (fileName?: string, fileType?: string): boolean => {
  if (fileType && fileType.startsWith("image/")) return true;
  if (!fileName) return false;
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fileName);
};

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "#FEF3C7", color: "#B45309" },
  CONFIRMED:  { bg: "#DBEAFE", color: "#1D4ED8" },
  CHECKED_IN: { bg: "#F3E8FF", color: "#6B21A8" },
  COMPLETED:  { bg: "#DCFCE7", color: "#15803D" },
  CANCELLED:  { bg: "#FEE2E2", color: "#B91C1C" },
  RESCHEDULED:{ bg: "#DDF4F8", color: "#045E6A" },
};

const DoctorAppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsApt, setDetailsApt] = useState<AppointmentListItem | null>(null);
  const [notesApt, setNotesApt] = useState<AppointmentListItem | null>(null);
  const [notesText, setNotesText] = useState("");
  const [reportsApt, setReportsApt] = useState<AppointmentListItem | null>(null);
  const [reportsList, setReportsList] = useState<MedicalReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentListItem | null>(null);
  const [prescriptionApt, setPrescriptionApt] = useState<AppointmentListItem | null>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: "",
    title: "",
  });

  useEffect(() => {
    if (!prescriptionFile) {
      setPreviewUrl(null);
      return;
    }
    if (isImageFile(prescriptionFile.name, prescriptionFile.type)) {
      const objUrl = URL.createObjectURL(prescriptionFile);
      setPreviewUrl(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [prescriptionFile]);
  const [existingPrescription, setExistingPrescription] = useState<MedicalReport | null>(null);
  const [previewPrescriptionApt, setPreviewPrescriptionApt] = useState<AppointmentListItem | null>(null);
  const [doctorEventPopup, setDoctorEventPopup] = useState<{
    open: boolean;
    appointment: AppointmentListItem | null;
  }>({ open: false, appointment: null });
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });

  const { data: profileData } = useQuery({
    queryKey: ["doctor", "me"],
    queryFn: getMyDoctorProfileApi,
  });
  const doctorProfile = profileData?.data;

  const { data: apptData, isLoading, isError, refetch } = useQuery({
    queryKey: ["doctor", "appointments", doctorProfile?.id, filterStatus],
    queryFn: () =>
      getAppointmentsApi({
        doctorProfileId: doctorProfile!.id,
        status: filterStatus !== "ALL" ? (filterStatus as AppointmentStatus) : undefined,
        limit: 100,
        order: "desc",
      }),
    enabled: !!doctorProfile?.id,
  });

  const allApts = apptData?.appointments ?? [];

  useEffect(() => {
    const scheduled = allApts.find((a) => a.status === "CONFIRMED" || a.status === "CHECKED_IN");
    if (scheduled) {
      const notifiedKey = `ns_doc_notified_${scheduled.id}`;
      if (!sessionStorage.getItem(notifiedKey)) {
        sessionStorage.setItem(notifiedKey, "true");
        setDoctorEventPopup({ open: true, appointment: scheduled });
      }
    }
  }, [apptData]);

  const filtered = allApts.filter((apt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = `${apt.patientFirstName ?? ""} ${apt.patientLastName ?? ""}`.toLowerCase();
    return name.includes(q) || apt.id.toLowerCase().includes(q);
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentApi(id, { status }),
    onSuccess: (res, variables) => {
      if (res.success) {
        setSnackbar({ open: true, message: `Status updated to ${variables.status}`, severity: "success" });
        queryClient.invalidateQueries({ queryKey: ["doctor", "appointments"] });
      } else {
        setSnackbar({ open: true, message: res.message ?? "Update failed", severity: "error" });
      }
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: errorObj?.response?.data?.message ?? errorObj?.message ?? "Update failed", severity: "error" });
    },
  });

  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateAppointmentApi(id, { notes }),
    onSuccess: (res) => {
      if (res.success) {
        setSnackbar({ open: true, message: "Notes saved successfully", severity: "success" });
        queryClient.invalidateQueries({ queryKey: ["doctor", "appointments"] });
        setNotesApt(null);
      } else {
        setSnackbar({ open: true, message: res.message ?? "Failed to save notes", severity: "error" });
      }
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: errorObj?.response?.data?.message ?? "Failed to save notes", severity: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAppointmentApi(id),
    onSuccess: (res) => {
      if (res.success) {
        setSnackbar({ open: true, message: "Appointment deleted successfully", severity: "success" });
        queryClient.invalidateQueries({ queryKey: ["doctor", "appointments"] });
        setDeleteTarget(null);
      } else {
        setSnackbar({ open: true, message: res.message ?? "Delete failed", severity: "error" });
      }
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: errorObj?.response?.data?.message ?? errorObj?.message ?? "Delete failed", severity: "error" });
    },
  });

  const handleOpenReports = async (apt: AppointmentListItem) => {
    setReportsApt(apt);
    setReportsList([]);
    try {
      setLoadingReports(true);
      const res = await getDoctorAppointmentReportsApi(apt.id);
      if (res.success && Array.isArray(res.data)) {
        setReportsList(res.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load reports:", err);
      setSnackbar({ open: true, message: "Failed to load reports", severity: "error" });
    } finally {
      setLoadingReports(false);
    }
  };

  const handleOpenPrescription = async (apt: AppointmentListItem) => {
    setPrescriptionApt(apt);
    setPrescriptionFile(null);
    setExistingPrescription(null);
    setLoadingPrescription(true);
    try {
      const res = await getDoctorAppointmentReportsApi(apt.id);
      if (res.success && Array.isArray(res.data)) {
        const presc = res.data.find((r) => r.category === "PRESCRIPTION");
        if (presc) {
          setExistingPrescription(presc);
        }
      }
    } catch (err) {
      console.error("Failed to fetch prescription:", err);
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handleUploadPrescription = async () => {
    if (!prescriptionApt || !prescriptionFile) return;
    setUploadingPrescription(true);
    try {
      const formData = new FormData();
      formData.append("file", prescriptionFile);
      formData.append("appointmentId", prescriptionApt.id);
      if (prescriptionApt.patientId) {
        formData.append("patientId", prescriptionApt.patientId);
      }
      formData.append("category", "PRESCRIPTION");

      const res = await uploadReportApi(formData);
      if (res.success) {
        setSnackbar({ open: true, message: "Patient prescription uploaded successfully!", severity: "success" });
        queryClient.invalidateQueries({ queryKey: ["doctor", "appointments"] });
        if (res.data) {
          setExistingPrescription(res.data);
        }
        setPrescriptionFile(null);
        // If reports modal is open, also refresh it
        if (reportsApt && reportsApt.id === prescriptionApt.id) {
          void handleOpenReports(reportsApt);
        }
        setPrescriptionApt(null);
      } else {
        setSnackbar({ open: true, message: res.message || "Prescription upload failed", severity: "error" });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: errorObj?.response?.data?.message || errorObj?.message || "Prescription upload failed", severity: "error" });
    } finally {
      setUploadingPrescription(false);
    }
  };

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
    <Box sx={{ pb: 4 }}>
      {/* Header Bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: "#111827", fontWeight: 800 }}>My Appointments</Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
            View and update your assigned patient appointments
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          sx={{
            color: "#045E6A",
            borderColor: "#2EBBD9",
            borderRadius: "12px",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { backgroundColor: "#DDF4F8", borderColor: "#045E6A" },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters Bar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search patient or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            minWidth: 240,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              "& fieldset": { borderColor: "#E2EDF2" },
            },
          }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#1CA7C0" }} /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel sx={{ color: "#4B5563", fontWeight: 600 }}>Filter Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filter Status"
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              color: "#111827",
              fontWeight: 600,
              "& fieldset": { borderColor: "#E2EDF2" },
            }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            {["PENDING","CONFIRMED","CHECKED_IN","COMPLETED","CANCELLED","RESCHEDULED"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Content Cards */}
      {isLoading || !doctorProfile ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#2EBBD9" }} /></Box>
      ) : isError ? (
        <Alert severity="error" sx={{ borderRadius: "14px" }}>Failed to load appointments.</Alert>
      ) : filtered.length === 0 ? (
        <Card sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2", borderRadius: "20px", boxShadow: "0 10px 30px -5px rgba(46, 187, 217, 0.08)" }}>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>No appointments found matching your filters.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((apt) => {
            const patientName = `${apt.patientFirstName ?? "Patient"} ${apt.patientLastName ?? ""}`.trim();
            const dateStr = apt.appointmentDate
              ? new Date(apt.appointmentDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
              : "—";
            const sc = statusColors[apt.status] ?? { bg: "#DDF4F8", color: "#045E6A" };

            return (
              <Card
                key={apt.id}
                sx={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2EDF2",
                  borderRadius: "20px",
                  boxShadow: "0 10px 30px -5px rgba(46, 187, 217, 0.08), 0 4px 16px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "#2EBBD9", boxShadow: "0 12px 30px rgba(46, 187, 217, 0.15)" },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                        <Typography variant="h6" sx={{ color: "#111827", fontWeight: 800, fontSize: "1.05rem" }}>
                          {patientName}
                        </Typography>
                        <Chip label={apt.status} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 800, fontSize: "0.72rem" }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#4B5563", fontWeight: 600, mb: 0.5 }}>
                        📅 {dateStr} {apt.appointmentTime ? `· ⏰ ${apt.appointmentTime}` : ""}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
                        🏥 {apt.hospitalName ?? "—"} · {apt.departmentName ?? "—"}
                      </Typography>
                      {apt.notes && (
                        <Typography variant="caption" sx={{ color: "#045E6A", mt: 0.8, display: "block", fontStyle: "italic", fontWeight: 600 }}>
                          📝 {apt.notes}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                      {apt.status === "CONFIRMED" && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<HowToRegIcon />}
                          onClick={() => statusMutation.mutate({ id: apt.id, status: "CHECKED_IN" })}
                          disabled={statusMutation.isPending}
                          sx={{ backgroundColor: "#8B5CF6", color: "#FFFFFF", fontWeight: 800, borderRadius: "10px", textTransform: "none" }}
                        >
                          Check In
                        </Button>
                      )}
                      {apt.status === "CHECKED_IN" && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => statusMutation.mutate({ id: apt.id, status: "COMPLETED" })}
                          disabled={statusMutation.isPending}
                          sx={{ backgroundColor: "#10B981", color: "#FFFFFF", fontWeight: 800, borderRadius: "10px", textTransform: "none" }}
                        >
                          Complete
                        </Button>
                      )}
                      {apt.prescriptionUrl && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<MedicationIcon />}
                          onClick={() => setPreviewPrescriptionApt(apt)}
                          sx={{
                            backgroundColor: "#059669",
                            color: "#FFFFFF",
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
                            "&:hover": { backgroundColor: "#047857" },
                          }}
                        >
                          Preview Prescription
                        </Button>
                      )}
                      {apt.status === "COMPLETED" && (
                        <Button
                          size="small"
                          variant={apt.prescriptionUrl ? "outlined" : "contained"}
                          startIcon={<UploadFileIcon />}
                          onClick={() => handleOpenPrescription(apt)}
                          sx={{
                            backgroundColor: apt.prescriptionUrl ? "transparent" : "#059669",
                            color: apt.prescriptionUrl ? "#059669" : "#FFFFFF",
                            borderColor: "#059669",
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: apt.prescriptionUrl ? "none" : "0 2px 8px rgba(5, 150, 105, 0.25)",
                            "&:hover": {
                              backgroundColor: apt.prescriptionUrl ? "rgba(16, 185, 129, 0.08)" : "#047857",
                            },
                          }}
                        >
                          {apt.prescriptionUrl ? "Update Prescription" : "Upload Prescription"}
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setDetailsApt(apt)}
                        sx={{
                          color: "#1E293B",
                          borderColor: "#CBD5E1",
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 700,
                          backgroundColor: "#F8FAFC",
                          "&:hover": { backgroundColor: "#F1F5F9", borderColor: "#94A3B8" },
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DescriptionIcon />}
                        onClick={() => handleOpenReports(apt)}
                        sx={{
                          color: "#2EBBD9",
                          borderColor: "#2EBBD9",
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 700,
                          backgroundColor: "#F0FDFA",
                          "&:hover": { backgroundColor: "#CCFBF1", borderColor: "#0D9488" },
                        }}
                      >
                        Reports
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditNoteIcon />}
                        onClick={() => { setNotesApt(apt); setNotesText(apt.notes ?? ""); }}
                        sx={{ color: "#045E6A", borderColor: "#2EBBD9", borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                      >
                        Notes
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => setDeleteTarget(apt)}
                        disabled={deleteMutation.isPending}
                        sx={{
                          color: "#B91C1C",
                          borderColor: "#FCA5A5",
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 700,
                          "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#B91C1C" },
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Complete Appointment Request Details Dialog for Doctor */}
      <AppointmentRequestDetailsDialog
        open={!!detailsApt}
        onClose={() => setDetailsApt(null)}
        appointment={detailsApt}
      />

      {/* Medical Reports Dialog for Doctor */}
      <Dialog
        open={!!reportsApt}
        onClose={() => setReportsApt(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "24px", p: 1 } } }}
      >
        <DialogTitle sx={{ color: "#111827", fontWeight: 800 }}>
          Patient Medical Reports
          {reportsApt && (
            <Typography variant="caption" sx={{ display: "block", color: "#6B7280", mt: 0.3 }}>
              {`Patient: ${reportsApt.patientFirstName ?? ""} ${reportsApt.patientLastName ?? ""}`.trim()} · Appointment ID: {reportsApt.id.slice(0, 8)}...
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {loadingReports ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 5, gap: 1.5 }}>
              <CircularProgress size={24} sx={{ color: "#2EBBD9" }} />
              <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>Loading reports...</Typography>
            </Box>
          ) : reportsList.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5, backgroundColor: "#F8FAFC", borderRadius: "16px", border: "1px dashed #CBD5E1" }}>
              <DescriptionIcon sx={{ fontSize: 44, color: "#94A3B8", mb: 1 }} />
              <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>
                No medical reports uploaded by patient for this appointment.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
              {reportsList.map((rep) => {
                const isPresc = rep.category === "PRESCRIPTION";
                return (
                  <Box
                    key={rep.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      borderRadius: "14px",
                      backgroundColor: isPresc ? "rgba(16, 185, 129, 0.08)" : "#F8FAFC",
                      border: isPresc ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #E2E8F0",
                      transition: "all 0.2s ease",
                      "&:hover": { backgroundColor: isPresc ? "rgba(16, 185, 129, 0.15)" : "#F0FDFA", borderColor: isPresc ? "#10B981" : "#2EBBD9" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1, mr: 2 }}>
                      {isImageFile(rep.originalFileName || rep.fileName, rep.fileType) ? (
                        <Box
                          onClick={() => setImageModal({
                            open: true,
                            url: getFullFileUrl(rep.fileUrl),
                            title: rep.originalFileName || rep.fileName,
                          })}
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: isPresc ? "1.5px solid #10B981" : "1.5px solid #2EBBD9",
                            cursor: "pointer",
                            flexShrink: 0,
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            transition: "transform 0.15s ease",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                          title="Click to preview image"
                        >
                          <img
                            src={getFullFileUrl(rep.fileUrl)}
                            alt="Report Thumbnail"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </Box>
                      ) : (
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
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography
                            variant="body2"
                            sx={{ color: isPresc ? "#065F46" : "#1E293B", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {rep.originalFileName || rep.fileName}
                          </Typography>
                          {isPresc && (
                            <Chip
                              label="Doctor Prescription"
                              size="small"
                              sx={{
                                backgroundColor: "#D1FAE5",
                                color: "#065F46",
                                fontWeight: 800,
                                fontSize: "0.68rem",
                                height: 20,
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          {formatFileSize(rep.fileSize)} {!isPresc && rep.category ? `· ${rep.category}` : ""}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                      {isImageFile(rep.originalFileName || rep.fileName, rep.fileType) && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                          onClick={() => setImageModal({
                            open: true,
                            url: getFullFileUrl(rep.fileUrl),
                            title: rep.originalFileName || rep.fileName,
                          })}
                          sx={{
                            backgroundColor: isPresc ? "#059669" : "#0D9488",
                            color: "#FFFFFF",
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            px: 1.8,
                            "&:hover": { backgroundColor: isPresc ? "#047857" : "#0F766E" },
                          }}
                        >
                          Preview
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        onClick={() => window.open(getFullFileUrl(rep.fileUrl), "_blank")}
                        sx={{
                          color: isPresc ? "#059669" : "#045E6A",
                          borderColor: isPresc ? "#059669" : "#CBD5E1",
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          px: 1.8,
                          "&:hover": { backgroundColor: isPresc ? "#D1FAE5" : "#F1F5F9" },
                        }}
                      >
                        {isPresc ? "New Tab" : "Open"}
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          {reportsApt?.status === "COMPLETED" ? (
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => {
                const target = reportsApt;
                setReportsApt(null);
                void handleOpenPrescription(target);
              }}
              sx={{
                color: "#059669",
                borderColor: "#059669",
                borderRadius: "10px",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.08)", borderColor: "#047857" },
              }}
            >
              Upload Prescription
            </Button>
          ) : <Box />}
          <Button onClick={() => setReportsApt(null)} sx={{ color: "#6B7280", fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Patient Prescription Dialog for Doctor */}
      <Dialog
        open={!!prescriptionApt}
        onClose={() => { if (!uploadingPrescription) setPrescriptionApt(null); }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "24px", p: 1 } } }}
      >
        <DialogTitle sx={{ color: "#111827", fontWeight: 800, pb: 0.5 }}>
          Upload Patient Prescription
          {prescriptionApt && (
            <Typography variant="caption" sx={{ display: "block", color: "#6B7280", mt: 0.5, fontSize: "0.82rem" }}>
              Patient: <strong>{`${prescriptionApt.patientFirstName ?? ""} ${prescriptionApt.patientLastName ?? ""}`.trim()}</strong>
              {prescriptionApt.appointmentDate ? ` · Date: ${new Date(prescriptionApt.appointmentDate).toLocaleDateString()}` : ""}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {loadingPrescription ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4, gap: 1.5 }}>
              <CircularProgress size={24} sx={{ color: "#059669" }} />
              <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>Checking existing prescription...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
              {existingPrescription && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    backgroundColor: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
                    {isImageFile(existingPrescription.originalFileName || existingPrescription.fileName, existingPrescription.fileType) ? (
                      <Box
                        onClick={() => setImageModal({
                          open: true,
                          url: getFullFileUrl(existingPrescription.fileUrl),
                          title: existingPrescription.originalFileName || existingPrescription.fileName,
                        })}
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1.5px solid #10B981",
                          cursor: "pointer",
                          flexShrink: 0,
                          backgroundColor: "#fff",
                          boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
                          transition: "transform 0.15s ease",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                        title="Click to preview prescription"
                      >
                        <img
                          src={getFullFileUrl(existingPrescription.fileUrl)}
                          alt="Prescription Thumbnail"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                    ) : (
                      <MedicationIcon sx={{ color: "#059669", fontSize: 28 }} />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: "#065F46", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {existingPrescription.originalFileName || existingPrescription.fileName}
                        </Typography>
                        <Chip label="Current Prescription" size="small" sx={{ backgroundColor: "#D1FAE5", color: "#065F46", fontWeight: 800, fontSize: "0.68rem", height: 20 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: "#047857" }}>
                        {formatFileSize(existingPrescription.fileSize)} · Uploaded on {new Date(existingPrescription.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    {isImageFile(existingPrescription.originalFileName || existingPrescription.fileName, existingPrescription.fileType) && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setImageModal({
                          open: true,
                          url: getFullFileUrl(existingPrescription.fileUrl),
                          title: existingPrescription.originalFileName || existingPrescription.fileName,
                        })}
                        sx={{
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          "&:hover": { backgroundColor: "#047857" },
                        }}
                      >
                        Preview
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                      onClick={() => window.open(getFullFileUrl(existingPrescription.fileUrl), "_blank")}
                      sx={{
                        color: "#059669",
                        borderColor: "#059669",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        "&:hover": { backgroundColor: "#D1FAE5" },
                      }}
                    >
                      New Tab
                    </Button>
                  </Box>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1E293B", mb: 1 }}>
                  {existingPrescription ? "Upload Updated Prescription" : "Select Prescription File"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.82rem", mb: 1.5 }}>
                  Attach the signed prescription file (PDF, PNG, JPG, DOCX). Once uploaded, it will instantly be visible in the patient dashboard and admin records.
                </Typography>

                <Box
                  component="label"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2.5,
                    borderRadius: "16px",
                    border: "2px dashed #93C5FD",
                    backgroundColor: "#F0F9FF",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { backgroundColor: "#E0F2FE", borderColor: "#0284C7" },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept=".pdf,image/*,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPrescriptionFile(e.target.files[0]);
                      }
                    }}
                  />
                  {previewUrl ? (
                    <Box sx={{ textAlign: "center", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Box
                        sx={{
                          position: "relative",
                          mb: 1.5,
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: "2px solid #38BDF8",
                          boxShadow: "0 6px 16px rgba(2, 132, 199, 0.2)",
                          maxWidth: 240,
                          maxHeight: 150,
                          backgroundColor: "#FFFFFF",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageModal({
                            open: true,
                            url: previewUrl,
                            title: prescriptionFile?.name || "Selected Prescription Image",
                          });
                        }}
                        title="Click to view full preview"
                      >
                        <img
                          src={previewUrl}
                          alt="Selected Prescription Preview"
                          style={{ width: "100%", height: "100%", maxHeight: 140, objectFit: "contain", display: "block" }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#0369A1", fontWeight: 700, wordBreak: "break-all" }}>
                        {prescriptionFile?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {formatFileSize(prescriptionFile?.size ?? 0)} · Click to change file
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<ZoomInIcon sx={{ fontSize: 16 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageModal({
                            open: true,
                            url: previewUrl,
                            title: prescriptionFile?.name || "Prescription Preview",
                          });
                        }}
                        sx={{ mt: 0.5, color: "#0284C7", fontWeight: 700, textTransform: "none", fontSize: "0.78rem" }}
                      >
                        Preview Image
                      </Button>
                    </Box>
                  ) : prescriptionFile ? (
                    <Box sx={{ textAlign: "center" }}>
                      <CloudUploadIcon sx={{ fontSize: 36, color: "#0284C7", mb: 0.5 }} />
                      <Typography variant="body2" sx={{ color: "#0369A1", fontWeight: 700, wordBreak: "break-all" }}>
                        {prescriptionFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {formatFileSize(prescriptionFile.size)} · Click to change file
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      <CloudUploadIcon sx={{ fontSize: 40, color: "#0284C7", mb: 1 }} />
                      <Typography variant="body2" sx={{ color: "#0369A1", fontWeight: 700 }}>
                        Click to select prescription file
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        PDF, JPG, PNG or DOCX up to 20MB
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setPrescriptionApt(null)}
            disabled={uploadingPrescription}
            sx={{ color: "#6B7280", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!prescriptionFile || uploadingPrescription}
            onClick={handleUploadPrescription}
            startIcon={uploadingPrescription ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <UploadFileIcon />}
            sx={{
              backgroundColor: "#059669",
              color: "#FFFFFF",
              fontWeight: 800,
              borderRadius: "12px",
              textTransform: "none",
              px: 2.5,
              "&:hover": { backgroundColor: "#047857" },
              "&.Mui-disabled": { backgroundColor: "#E2E8F0", color: "#94A3B8" },
            }}
          >
            {uploadingPrescription ? "Uploading..." : "Upload Prescription"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
      >
        <DialogTitle sx={{ color: "#111827", fontWeight: 800 }}>Delete Appointment?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#4B5563" }}>
            This will permanently remove the appointment for{" "}
            <strong>
              {deleteTarget
                ? `${deleteTarget.patientFirstName ?? ""} ${deleteTarget.patientLastName ?? ""}`.trim()
                : ""}
            </strong>{" "}
            from both the doctor and patient dashboards. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ color: "#6B7280", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
            disabled={deleteMutation.isPending}
            sx={{ backgroundColor: "#B91C1C", color: "#FFFFFF", fontWeight: 800, borderRadius: "12px", "&:hover": { backgroundColor: "#991B1B" } }}
          >
            {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog
        open={!!notesApt}
        onClose={() => setNotesApt(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "24px", p: 1 } } }}
      >
        <DialogTitle sx={{ color: "#111827", fontWeight: 800 }}>
          Consultation Notes
          {notesApt && (
            <Typography variant="caption" sx={{ display: "block", color: "#6B7280" }}>
              {`${notesApt.patientFirstName ?? ""} ${notesApt.patientLastName ?? ""}`.trim()}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={5}
            fullWidth
            placeholder="Enter consultation notes, diagnosis, treatment plan..."
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: "14px", backgroundColor: "#F8FAFC" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNotesApt(null)} sx={{ color: "#6B7280" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => { if (notesApt) notesMutation.mutate({ id: notesApt.id, notes: notesText }); }}
            disabled={notesMutation.isPending}
            sx={{ backgroundColor: "#045E6A", color: "#FFFFFF", fontWeight: 800, borderRadius: "12px" }}
          >
            {notesMutation.isPending ? "Saving..." : "Save Notes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lightbox / Full Image Preview Dialog */}
      <Dialog
        open={imageModal.open}
        onClose={() => setImageModal({ open: false, url: "", title: "" })}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              backgroundColor: "#0F172A",
              color: "#FFFFFF",
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, mr: 2 }}>
            <VisibilityIcon sx={{ color: "#38BDF8" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {imageModal.title || "Image Preview"}
            </Typography>
          </Box>
          <IconButton onClick={() => setImageModal({ open: false, url: "", title: "" })} sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#020617", minHeight: 320, maxHeight: "75vh" }}>
          {imageModal.url && (
            <img
              src={imageModal.url}
              alt={imageModal.title}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)", justifyContent: "space-between" }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(imageModal.url, "_blank")}
            sx={{ color: "#38BDF8", borderColor: "#0284C7", borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
          >
            Open in New Tab
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => setImageModal({ open: false, url: "", title: "" })}
            sx={{ backgroundColor: "#334155", color: "#FFFFFF", borderRadius: "10px", textTransform: "none", fontWeight: 700, "&:hover": { backgroundColor: "#475569" } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Preview Modal */}
      <PrescriptionPreviewModal
        open={!!previewPrescriptionApt}
        onClose={() => setPreviewPrescriptionApt(null)}
        fileUrl={previewPrescriptionApt?.prescriptionUrl ?? null}
        fileName={previewPrescriptionApt?.prescriptionFileName ?? null}
        fileType={previewPrescriptionApt?.prescriptionFileType ?? null}
        patientName={
          previewPrescriptionApt
            ? `${previewPrescriptionApt.patientFirstName ?? ""} ${previewPrescriptionApt.patientLastName ?? ""}`.trim()
            : undefined
        }
      />

      {/* Doctor — New Appointment Event Popup */}
      <AppointmentEventPopup
        open={doctorEventPopup.open}
        type="DOCTOR_NEW_SCHEDULED"
        isOldPatient={doctorEventPopup.appointment?.isOldPatient ?? false}
        patientName={
          doctorEventPopup.appointment
            ? `${doctorEventPopup.appointment.patientFirstName ?? ""} ${doctorEventPopup.appointment.patientLastName ?? ""}`.trim()
            : undefined
        }
        doctorName={doctorProfile ? `${doctorProfile.firstName ?? ""} ${doctorProfile.lastName ?? ""}`.trim() : undefined}
        hospitalName={doctorEventPopup.appointment?.hospitalName ?? undefined}
        departmentName={doctorEventPopup.appointment?.departmentName ?? undefined}
        appointmentDate={
          doctorEventPopup.appointment?.appointmentDate
            ? new Date(doctorEventPopup.appointment.appointmentDate).toLocaleDateString()
            : undefined
        }
        appointmentTime={doctorEventPopup.appointment?.appointmentTime ?? undefined}
        onClose={() => setDoctorEventPopup({ open: false, appointment: null })}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} sx={{ borderRadius: "12px", fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorAppointmentsPage;
