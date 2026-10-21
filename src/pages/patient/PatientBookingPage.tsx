import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { getHospitalByIdApi } from "../../services/hospital.api";
import { getDepartmentsApi } from "../../services/department.api";
import { getDoctorAvailabilityApi, createAppointmentApi } from "../../services/appointment.api";
import { getMyPatientProfileApi } from "../../services/patient.api";
import { uploadReportApi } from "../../services/report.api";

import type { Hospital } from "../../types/hospital.types";
import type { Department } from "../../types/department.types";

const PatientBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const hospitalId = searchParams.get("hospitalId");
  const departmentId = searchParams.get("departmentId");
  const doctorProfileId = searchParams.get("doctorProfileId");
  const appointmentDate = searchParams.get("appointmentDate");
  const appointmentTime = searchParams.get("appointmentTime");

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientMobile, setPatientMobile] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookingData = async () => {
      if (!hospitalId || !departmentId || !doctorProfileId || !appointmentDate || !appointmentTime) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const [hospitalResponse, departmentsResponse, availabilityResponse, patientResponse] =
          await Promise.all([
            getHospitalByIdApi(hospitalId),
            getDepartmentsApi(),
            getDoctorAvailabilityApi(hospitalId, departmentId, appointmentDate),
            getMyPatientProfileApi(),
          ]);

        setHospital(hospitalResponse.data);

        const selectedDepartment = departmentsResponse.data.find((item) => item.id === departmentId);
        setDepartment(selectedDepartment ?? null);

        const selectedDoctor = availabilityResponse.data.find(
          (item) => item.doctorProfileId === doctorProfileId
        );
        if (!selectedDoctor) throw new Error("Selected doctor is not available for this date.");
        setDoctorName(selectedDoctor.doctorName);

        if (!patientResponse.success || !patientResponse.data)
          throw new Error("Patient profile not found. Please complete your profile before booking.");
        setPatientId(patientResponse.data.id);
        const pData = patientResponse.data as any;
        const pFullName = pData.fullName || `${pData.firstName || ""} ${pData.lastName || ""}`.trim() || user?.fullName || "Patient";
        setPatientName(pFullName);
        setPatientMobile(pData.mobile || user?.mobile || "");
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        setError(errorObj?.response?.data?.message || errorObj?.message || "Unable to load booking information.");
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [hospitalId, departmentId, doctorProfileId, appointmentDate, appointmentTime]);

  /* ── File helpers ── */
  const addFiles = (files: File[]) => {
    const allowed = files.filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type.startsWith("image/") ||
        f.type === "application/msword" ||
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    setUploadedFiles((prev) => [...prev, ...allowed].slice(0, 5));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
  };

  const removeFile = (index: number) =>
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileLabel = (f: File) =>
    f.type.includes("pdf") ? "PDF" : f.type.startsWith("image") ? "IMG" : "DOC";

  /* ── Guard ── */
  if (!hospitalId || !departmentId || !doctorProfileId || !appointmentDate || !appointmentTime) {
    return (
      <Box>
        <Alert severity="warning">Booking information is incomplete.</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate("/patient/hospitals")}>
          Start Booking Again
        </Button>
      </Box>
    );
  }

  /* ── Submit ── */
  const handleBooking = async () => {
    if (!patientId) { setError("Patient profile is required before booking."); return; }
    try {
      setSubmitting(true);
      setError("");
      const response = await createAppointmentApi({
        patientId, hospitalId, departmentId, doctorProfileId,
        appointmentDate, appointmentTime,
        notes: notes.trim() || undefined,
      });
      if (!response.success) throw new Error(response.message || "Appointment booking failed.");
      if (!response.data?.id) throw new Error("Appointment created but confirmation ID was not returned.");

      const createdAppointmentId = response.data.id;

      // Upload all attached medical reports
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("appointmentId", createdAppointmentId);
            formData.append("patientId", patientId);
            formData.append("category", "OTHER");
            await uploadReportApi(formData);
          } catch (uploadErr) {
            console.error("Failed to upload report file:", file.name, uploadErr);
          }
        }
      }

      navigate(`/patient/booking-confirmation/${createdAppointmentId}`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj?.response?.data?.message || errorObj?.message || "Unable to create appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ── */
  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Confirm Appointment
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Review your appointment details before confirming.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Stack spacing={2.5}>
              {/* Hospital */}
              <Box>
                <Typography color="text.secondary" variant="body2">Hospital</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{hospital?.name || "Hospital"}</Typography>
              </Box>
              <Divider />

              {/* Department */}
              <Box>
                <Typography color="text.secondary" variant="body2">Department</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{department?.name || "Department"}</Typography>
              </Box>
              <Divider />

              {/* Doctor */}
              <Box>
                <Typography color="text.secondary" variant="body2">Doctor</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Dr. {doctorName || "Doctor"}</Typography>
              </Box>
              <Divider />

              {/* Patient */}
              <Box>
                <Typography color="text.secondary" variant="body2">Patient</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{patientName || "Patient"}</Typography>
              </Box>
              <Divider />

              {/* Registered Mobile */}
              <Box>
                <Typography color="text.secondary" variant="body2">Registered Mobile</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#045E6A" }}>
                  {patientMobile || "Not Available"}
                </Typography>
              </Box>
              <Divider />

              {/* Date & Time */}
              <Box sx={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Date</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{appointmentDate}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">Time</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{appointmentTime}</Typography>
                </Box>
              </Box>

              {/* Notes */}
              <TextField
                label="Notes"
                multiline
                minRows={4}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the appointment (optional)"
              />

              {/* ── ANIMATED REPORT UPLOAD ── */}
              <Box>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <InsertDriveFileIcon sx={{ color: "#2EBBD9", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827" }}>
                    Upload Medical Reports
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9CA3AF", ml: "auto" }}>
                    Optional · PDF, Image, DOCX · Max 5 files
                  </Typography>
                </Box>

                {/* Drop Zone */}
                <Box
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: "relative",
                    border: isDragOver ? "2px solid #2EBBD9" : "2px dashed #CBD5E1",
                    borderRadius: "16px",
                    p: 4,
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragOver ? "#E6FAFC" : "#F8FAFC",
                    transition: "all 0.25s ease",
                    overflow: "hidden",
                    "&:hover": { borderColor: "#2EBBD9", backgroundColor: "#EEF9FC" },
                    "@keyframes pulse-ring": {
                      "0%": { transform: "scale(0.9)", opacity: 0.6 },
                      "70%": { transform: "scale(1.15)", opacity: 0 },
                      "100%": { transform: "scale(1.15)", opacity: 0 },
                    },
                    "@keyframes float": {
                      "0%, 100%": { transform: "translateY(0px)" },
                      "50%": { transform: "translateY(-6px)" },
                    },
                  }}
                >
                  {/* Pulse rings on drag */}
                  {isDragOver && [1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        width: 80 + i * 40, height: 80 + i * 40,
                        borderRadius: "50%",
                        border: "2px solid rgba(46,187,217,0.3)",
                        transform: "translate(-50%, -50%)",
                        animation: `pulse-ring ${0.8 + i * 0.3}s ease-out infinite`,
                        animationDelay: `${i * 0.15}s`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}

                  {/* Upload icon — floats when idle, solid on drag */}
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 60, height: 60,
                      borderRadius: "50%",
                      backgroundColor: isDragOver ? "#2EBBD9" : "#DDF4F8",
                      mb: 2,
                      animation: isDragOver ? "none" : "float 2.5s ease-in-out infinite",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <CloudUploadIcon
                      sx={{
                        fontSize: 30,
                        color: isDragOver ? "#FFFFFF" : "#2EBBD9",
                        transition: "color 0.2s ease",
                      }}
                    />
                  </Box>

                  <Typography variant="body1" sx={{ fontWeight: 700, color: isDragOver ? "#045E6A" : "#374151", mb: 0.5 }}>
                    {isDragOver ? "Release to upload" : "Drag & drop your reports here"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                    or{" "}
                    <Box component="span" sx={{ color: "#2EBBD9", fontWeight: 700, textDecoration: "underline" }}>
                      click to browse
                    </Box>
                  </Typography>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{ display: "none" }}
                    onChange={handleFileInput}
                  />
                </Box>

                {/* File list */}
                {uploadedFiles.length > 0 && (
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {uploadedFiles.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: "12px",
                          backgroundColor: "#F0FDF4",
                          border: "1px solid #BBF7D0",
                          "@keyframes fadeSlideIn": {
                            from: { opacity: 0, transform: "translateY(-6px)" },
                            to: { opacity: 1, transform: "translateY(0)" },
                          },
                          animation: "fadeSlideIn 0.3s ease",
                        }}
                      >
                        <Box
                          sx={{
                            width: 36, height: 36,
                            borderRadius: "8px",
                            backgroundColor: "#DCFCE7",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <InsertDriveFileIcon sx={{ fontSize: 18, color: "#16A34A" }} />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {file.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#6B7280" }}>
                            {formatSize(file.size)}
                          </Typography>
                        </Box>

                        <Chip
                          label={fileLabel(file)}
                          size="small"
                          sx={{ backgroundColor: "#DCFCE7", color: "#16A34A", fontWeight: 800, fontSize: "0.68rem" }}
                        />

                        <Box
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          sx={{
                            width: 28, height: 28,
                            borderRadius: "50%",
                            backgroundColor: "#FEE2E2",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", flexShrink: 0,
                            "&:hover": { backgroundColor: "#FECACA" },
                            transition: "background-color 0.15s",
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14, color: "#B91C1C" }} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              {/* ── END UPLOAD ── */}

              {/* Confirm button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<CheckCircleIcon />}
                fullWidth
                disabled={submitting}
                onClick={handleBooking}
              >
                {submitting ? "Confirming..." : "Confirm Appointment"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PatientBookingPage;