import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyDoctorProfileApi, updateDoctorApi } from "../../services/doctor.api";
import type { Doctor } from "../../types/doctor.types";
import { useAuth } from "../../context/AuthContext";

const DoctorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ["doctor", "me"],
    queryFn: getMyDoctorProfileApi,
  });

  const doctorProfile = profileData?.data;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    qualification: "",
    registrationNumber: "",
    experienceYears: 0,
    consultationFee: 0,
    languages: "",
    biography: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [prevDoctorProfile, setPrevDoctorProfile] = useState(doctorProfile);

  if (doctorProfile && doctorProfile !== prevDoctorProfile) {
    setPrevDoctorProfile(doctorProfile);
    setFormData({
      firstName: doctorProfile.firstName || "",
      lastName: doctorProfile.lastName || "",
      specialization: doctorProfile.specialization || "",
      qualification: doctorProfile.qualification || "",
      registrationNumber: doctorProfile.registrationNumber || "",
      experienceYears: doctorProfile.experienceYears || 0,
      consultationFee: doctorProfile.consultationFee || 0,
      languages: doctorProfile.languages || "",
      biography: doctorProfile.biography || "",
    });
    if (doctorProfile.profileImage) {
      setProfileImage(doctorProfile.profileImage);
    }
  }

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Doctor>) => updateDoctorApi(doctorProfile!.id, data),
    onSuccess: (res) => {
      if (res.success) {
        setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
        queryClient.invalidateQueries({ queryKey: ["doctor", "me"] });
      } else {
        setSnackbar({ open: true, message: res.message || "Failed to update profile", severity: "error" });
      }
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: errorObj?.response?.data?.message || errorObj?.message || "Update failed", severity: "error" });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setProfileImage(base64Str);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doctorProfile) {
      updateMutation.mutate({
        ...formData,
        profileImage: profileImage || undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#2EBBD9" }} />
      </Box>
    );
  }

  if (isError || !doctorProfile) {
    return (
      <Alert severity="error" sx={{ borderRadius: "14px" }}>
        Failed to load doctor profile.
      </Alert>
    );
  }

  const fullName = `Dr. ${formData.firstName} ${formData.lastName}`.trim();

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.6rem", sm: "2rem" } }}>
          My Doctor Profile
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500, mt: 0.5 }}>
          Manage your medical specialization, credentials, and contact details
        </Typography>
      </Box>

      {/* Main Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" }, gap: 3, alignItems: "flex-start" }}>
        {/* LEFT COLUMN: Profile Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            p: 3,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box sx={{ position: "relative", mb: 2 }}>
            <Avatar
              src={profileImage || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"}
              alt={fullName}
              sx={{ width: 120, height: 120, border: "4px solid #2EBBD9", boxShadow: "0 8px 20px rgba(46, 187, 217, 0.2)" }}
            />
            <Button
              component="label"
              size="small"
              variant="contained"
              sx={{
                position: "absolute",
                bottom: -4,
                right: -4,
                minWidth: 36,
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                p: 0,
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              📷
              <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </Button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
            {fullName}
          </Typography>

          <Typography variant="body2" sx={{ color: "#045E6A", fontWeight: 700, mb: 1 }}>
            {formData.specialization || "General Specialist"}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center", mb: 2 }}>
            {formData.registrationNumber && (
              <Chip
                label={`Reg: ${formData.registrationNumber}`}
                size="small"
                sx={{ backgroundColor: "#DDF4F8", color: "#045E6A", fontWeight: 700, fontSize: "0.75rem" }}
              />
            )}
            <Chip
              label={`${formData.experienceYears} Yrs Exp.`}
              size="small"
              sx={{ backgroundColor: "#FEF3C7", color: "#B45309", fontWeight: 700, fontSize: "0.75rem" }}
            />
          </Box>

          <Box
            sx={{
              width: "100%",
              p: 2,
              borderRadius: "16px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2EDF2",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
              ACCOUNT EMAIL
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
              {user?.email || "doctor@example.com"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700, mt: 1 }}>
              CONSULTATION FEE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#10B981" }}>
              ${formData.consultationFee}
            </Typography>
          </Box>
        </Paper>

        {/* RIGHT COLUMN: Edit Form */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            borderRadius: "24px",
            p: { xs: 2.5, sm: 4 },
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
            Doctor Details & Credentials
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                First Name
              </Typography>
              <TextField
                fullWidth
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Last Name
              </Typography>
              <TextField
                fullWidth
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Specialization
              </Typography>
              <TextField
                fullWidth
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Qualification
              </Typography>
              <TextField
                fullWidth
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Registration Number
              </Typography>
              <TextField
                fullWidth
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Experience (Years)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Consultation Fee ($)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Languages Spoken
              </Typography>
              <TextField
                fullWidth
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder="e.g. English, Spanish"
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Biography / Professional Summary
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                placeholder="Enter biography, expertise, patient care philosophy..."
                slotProps={{ input: { sx: { borderRadius: "12px", backgroundColor: "#F8FAFC" } } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
              sx={{
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                borderRadius: "12px",
                px: 4,
                py: 1.2,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: "12px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorProfilePage;
