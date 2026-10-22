import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
} from "@mui/material";
import { Edit3, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    contactName: "Robert Wilson",
    phoneNumber: "147852369",
    email: user?.email || "drrobert@exaple.com",
    streetNumber: "100000000214",
    doorNumber: "963",
    city: "New York",
    state: "NY",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.8rem", sm: "2.3rem" } }}>
          Personal Information
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500, mt: 0.5 }}>
          Personal & Contact Info
        </Typography>
      </Box>

      {/* Main Grid: Left Profile Card vs Right Personal Information Form */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" }, gap: 3, alignItems: "flex-start" }}>
        {/* LEFT COLUMN: Profile Summary Card */}
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
          {/* Portrait Photo */}
          <Box
            sx={{
              width: "100%",
              height: 240,
              borderRadius: "20px",
              overflow: "hidden",
              backgroundColor: "#E2EDF2",
              mb: 2,
              position: "relative",
            }}
          >
            <Box
              component="img"
              src={profileImage || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"}
              alt="Admin Profile"
              sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
            <Button
              component="label"
              size="small"
              variant="contained"
              sx={{
                position: "absolute",
                bottom: 10,
                right: 10,
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              📷 Upload Photo
              <input type="file" accept="image/*" hidden onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setProfileImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
            </Button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
            Dr. Robert Wilson
          </Typography>

          <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.82rem", mb: 1.5, display: "block" }}>
            General Dentist & Practice Manager
          </Typography>

          <Chip
            label="#DR-0123456"
            size="small"
            sx={{
              backgroundColor: "#2EBBD9",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.75rem",
              borderRadius: "8px",
              mb: 2,
            }}
          />

          {/* Admin Status Summary */}
          <Box
            sx={{
              width: "100%",
              p: 1.8,
              borderRadius: "16px",
              backgroundColor: "#E6F8FA",
              border: "1px solid #C4EEF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShieldCheck size={18} color="#00ADC6" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#045E6A" }}>
                Admin Status
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#2EBBD9" }}>
              Active &amp; Verified
            </Typography>
          </Box>
        </Paper>

        {/* RIGHT COLUMN: Personal Information Form Panel (Matches Image 2) */}
        <Paper
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
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 1 }}>
            Personal Information
          </Typography>

          {/* Contact Name */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Contact name
            </Typography>
            <TextField
              fullWidth
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Edit3 size={18} color="#2EBBD9" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "14px",
                    backgroundColor: "#E6F8FA",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#2EBBD9" },
                    fontWeight: 600,
                    color: "#111827",
                  },
                },
              }}
            />
          </Box>

          {/* Phone Number */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Phone number
            </Typography>
            <TextField
              fullWidth
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Edit3 size={18} color="#2EBBD9" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "14px",
                    backgroundColor: "#E6F8FA",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#2EBBD9" },
                    fontWeight: 600,
                    color: "#111827",
                  },
                },
              }}
            />
          </Box>

          {/* Email */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Edit3 size={18} color="#2EBBD9" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "14px",
                    backgroundColor: "#E6F8FA",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#2EBBD9" },
                    fontWeight: 600,
                    color: "#111827",
                  },
                },
              }}
            />
          </Box>

          {/* Street Number & Door Number (2 Columns) */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.5fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Street number
              </Typography>
              <TextField
                fullWidth
                value={formData.streetNumber}
                onChange={(e) => setFormData({ ...formData, streetNumber: e.target.value })}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: "14px",
                      backgroundColor: "#E6F8FA",
                      "& fieldset": { borderColor: "transparent" },
                      fontWeight: 600,
                      color: "#111827",
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                Door / Suite
              </Typography>
              <TextField
                fullWidth
                value={formData.doorNumber}
                onChange={(e) => setFormData({ ...formData, doorNumber: e.target.value })}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: "14px",
                      backgroundColor: "#E6F8FA",
                      "& fieldset": { borderColor: "transparent" },
                      fontWeight: 600,
                      color: "#111827",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* City & State (2 Columns) */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                City
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  sx={{
                    borderRadius: "14px",
                    backgroundColor: "#E6F8FA",
                    "& fieldset": { borderColor: "transparent" },
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  <MenuItem value="New York">New York</MenuItem>
                  <MenuItem value="Los Angeles">Los Angeles</MenuItem>
                  <MenuItem value="Chicago">Chicago</MenuItem>
                  <MenuItem value="Houston">Houston</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
                State
              </Typography>
              <TextField
                fullWidth
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: "14px",
                      backgroundColor: "#E6F8FA",
                      "& fieldset": { borderColor: "transparent" },
                      fontWeight: 600,
                      color: "#111827",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Save & Cancel Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                borderRadius: "12px",
                px: 3.5,
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.9rem",
                boxShadow: "0 4px 12px rgba(4, 94, 106, 0.25)",
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              Save Changes
            </Button>

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#68B2BD",
                color: "#FFFFFF",
                borderRadius: "12px",
                px: 3.5,
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.9rem",
                "&:hover": { backgroundColor: "#579FA9" },
              }}
            >
              Cancel
            </Button>
          </Box>

          {savedSuccess && (
            <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 700 }}>
              ✓ Personal information saved successfully!
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminProfilePage;
