import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createMyPatientProfileApi,
  getMyPatientProfileApi,
  updateMyPatientProfileApi,
} from "../../services/patient.api";

import { useAuth } from "../../context/AuthContext";

const PatientProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [profileExists, setProfileExists] =
    useState(false);

  const [error, setError] =
    useState("");

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [registeredDetails, setRegisteredDetails] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    language: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    emergencyContact: "",
    emergencyContactName: "",
    medicalHistory: "",
    allergies: "",
  });

  const [prevUser, setPrevUser] = useState(user);
  if (user && user !== prevUser) {
    setPrevUser(user);
    setRegisteredDetails({
      fullName: user.fullName || "",
      email: user.email || "",
      mobile: user.mobile || "",
    });
    if (user?.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      setForm((current) => ({
        ...current,
        firstName: current.firstName || parts[0] || "",
        lastName: current.lastName || parts.slice(1).join(" "),
      }));
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyPatientProfileApi();

        if (response?.success && response.data) {
          const profile = response.data;

          setProfileExists(true);
          const pData = profile as any;
          setRegisteredDetails({
            fullName: pData.fullName || user?.fullName || `${pData.firstName || ""} ${pData.lastName || ""}`.trim(),
            email: pData.email || user?.email || "",
            mobile: pData.mobile || user?.mobile || "",
          });

          setForm((current) => ({
            ...current,
            firstName: profile.firstName ?? current.firstName,
            lastName: profile.lastName ?? "",
            gender: profile.gender ?? "",
            dateOfBirth: profile.dateOfBirth
              ? String(profile.dateOfBirth).slice(0, 10)
              : "",
            bloodGroup: profile.bloodGroup ?? "",
            language: profile.language ?? "",
            address: profile.address ?? "",
            city: profile.city ?? "",
            state: profile.state ?? "",
            country: profile.country ?? "India",
            pincode: profile.pincode ?? "",
            emergencyContact:
              profile.emergencyContact ?? "",
            emergencyContactName:
              profile.emergencyContactName ?? "",
            medicalHistory:
              profile.medicalHistory ?? "",
            allergies: profile.allergies ?? "",
          }));
        }
      } catch (err: unknown) {
        const errorObj = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        // 404 means the patient has not created a profile yet.
        // In that case, keep the empty form.
        if (errorObj.response?.status === 404) {
          setProfileExists(false);
          return;
        }

        setError(
          errorObj.response?.data?.message ||
          "Unable to load patient profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange =
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } =
        event.target;

      setForm((current) => ({
        ...current,
        [name]: value,
      }));
    };

  const handleSubmit =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault();

      setError("");

      if (!form.firstName.trim()) {
        setError(
          "First name is required."
        );
        return;
      }

      try {
        setLoading(true);

        const payload = {
          firstName:
            form.firstName.trim(),

          lastName:
            form.lastName.trim() ||
            undefined,

          gender:
            form.gender
              ? (form.gender as
                | "MALE"
                | "FEMALE"
                | "OTHER")
              : undefined,

          dateOfBirth:
            form.dateOfBirth ||
            undefined,

          bloodGroup:
            form.bloodGroup ||
            undefined,

          language:
            form.language ||
            undefined,

          address:
            form.address ||
            undefined,

          city:
            form.city ||
            undefined,

          state:
            form.state ||
            undefined,

          country:
            form.country ||
            undefined,

          pincode:
            form.pincode ||
            undefined,

          emergencyContact:
            form.emergencyContact ||
            undefined,

          emergencyContactName:
            form.emergencyContactName ||
            undefined,

          medicalHistory:
            form.medicalHistory ||
            undefined,

          allergies:
            form.allergies ||
            undefined,
        };

        const response = profileExists
          ? await updateMyPatientProfileApi(payload)
          : await createMyPatientProfileApi(payload);

        if (!response.success) {
          throw new Error(
            response.message ||
            "Failed to save profile."
          );
        }

        navigate("/patient", {
          replace: true,
        });
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        setError(
          errorObj.response?.data?.message ||
          errorObj.message ||
          "Unable to save profile."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Complete Your Profile
        </Typography>

        <Typography
          sx={{ mt: 1, color: "#374151", opacity: 0.85 }}
        >
          Please provide your basic
          information before booking
          an appointment.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"}
                  alt="Patient Profile"
                  sx={{ width: 100, height: 100, border: "3px solid #2EBBD9", boxShadow: "0 6px 16px rgba(46, 187, 217, 0.2)" }}
                />
                <Button
                  component="label"
                  size="small"
                  variant="contained"
                  sx={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    minWidth: 32,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#045E6A",
                    color: "#FFFFFF",
                    p: 0,
                    boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
                    "&:hover": { backgroundColor: "#034953" },
                  }}
                >
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setProfileImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: "#6B7280", mt: 1, fontWeight: 600 }}>
                Click camera icon to update profile picture
              </Typography>
            </Box>

            {/* Account Registration Details Card */}
            <Box
              sx={{
                mb: 3.5,
                p: { xs: 2.5, sm: 3 },
                borderRadius: "16px",
                backgroundColor: "#F0FDF4",
                border: "1.5px solid #86EFAC",
                boxShadow: "0 4px 14px rgba(34, 197, 94, 0.08)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      backgroundColor: "#DCFCE7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#16A34A",
                    }}
                  >
                    <VerifiedUserIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#14532D" }}>
                      Registered Account Details
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#15803D", fontWeight: 600 }}>
                      Primary details from your registration account
                    </Typography>
                  </Box>
                </Box>
                <Chip label="Verified Account" size="small" sx={{ backgroundColor: "#DCFCE7", color: "#166534", fontWeight: 800, fontSize: "0.72rem" }} />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "#4B5563", fontWeight: 700, textTransform: "uppercase" }}>
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827", mt: 0.3 }}>
                    {registeredDetails.fullName || (form.firstName ? `${form.firstName} ${form.lastName || ""}`.trim() : "—")}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "#4B5563", fontWeight: 700, textTransform: "uppercase" }}>
                    Email Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827", mt: 0.3, wordBreak: "break-all" }}>
                    {registeredDetails.email || user?.email || "—"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "#4B5563", fontWeight: 700, textTransform: "uppercase" }}>
                    Registered Mobile
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#045E6A", mt: 0.3 }}>
                    📞 {registeredDetails.mobile || user?.mobile || "—"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              Personal Information
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Registered Email Address"
                  value={registeredDetails.email || user?.email || ""}
                  disabled
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: <EmailIcon sx={{ color: "#9CA3AF", mr: 1, fontSize: 20 }} />,
                    },
                  }}
                  helperText="Primary email linked to your account"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Registered Mobile Number"
                  value={registeredDetails.mobile || user?.mobile || ""}
                  disabled
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: <PhoneIcon sx={{ color: "#045E6A", mr: 1, fontSize: 20 }} />,
                    },
                  }}
                  helperText="Contact number for appointment coordination"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    Select gender
                  </MenuItem>

                  <MenuItem value="MALE">
                    Male
                  </MenuItem>

                  <MenuItem value="FEMALE">
                    Female
                  </MenuItem>

                  <MenuItem value="OTHER">
                    Other
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Blood Group"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  placeholder="e.g. O+"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Preferred Language"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mt: 2,
                mb: 2,
              }}
            >
              Contact & Address
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={form.address}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mt: 2,
                mb: 2,
              }}
            >
              Emergency Contact
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Contact Name"
                  name="emergencyContactName"
                  value={
                    form.emergencyContactName
                  }
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="emergencyContact"
                  value={
                    form.emergencyContact
                  }
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mt: 2,
                mb: 2,
              }}
            >
              Medical Information
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Medical History"
                  name="medicalHistory"
                  multiline
                  rows={3}
                  value={
                    form.medicalHistory
                  }
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Allergies"
                  name="allergies"
                  multiline
                  rows={2}
                  value={form.allergies}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : profileExists
                    ? "Update Profile"
                    : "Complete Profile"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientProfilePage;