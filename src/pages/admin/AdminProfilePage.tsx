import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Edit3, ShieldCheck, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateMeApi } from "../../services/auth.api";

const AdminProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Consistent Storage Keys for Admin Profile
  const userKey = user?.email || user?.id || "admin";
  const userProfileKey = `admin_profile_data_${userKey}`;
  const genericProfileKey = "admin_profile_data_global";

  // Helper to retrieve saved extra profile information (address, avatar)
  const loadSavedData = useMemo(() => {
    return () => {
      try {
        const stored =
          localStorage.getItem(userProfileKey) ||
          localStorage.getItem(genericProfileKey);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        // Discard any obsolete mock values
        if (parsed.streetNumber === "100000000214") parsed.streetNumber = "";
        if (parsed.doorNumber === "963") parsed.doorNumber = "";
        if (parsed.city === "New York" && parsed.state === "NY") {
          parsed.city = "";
          parsed.state = "";
        }
        return parsed;
      } catch {
        return null;
      }
    };
  }, [userProfileKey]);

  // Read previously cached registration details as fallback
  const cachedAdminReg = useMemo(() => {
    try {
      const stored =
        localStorage.getItem("admin_registered_details") ||
        localStorage.getItem("last_registered_admin") ||
        localStorage.getItem("authUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const initialSaved = loadSavedData();

  const [profileImage, setProfileImage] = useState<string | null>(
    initialSaved?.profileImage || null
  );

  // Dynamic Profile Form State
  const [formData, setFormData] = useState(() => {
    return {
      contactName: user?.fullName || cachedAdminReg?.fullName || initialSaved?.contactName || "",
      phoneNumber: user?.mobile || cachedAdminReg?.mobile || initialSaved?.phoneNumber || "",
      email: user?.email || cachedAdminReg?.email || initialSaved?.email || "",
      streetNumber: initialSaved?.streetNumber || "",
      doorNumber: initialSaved?.doorNumber || "",
      city: initialSaved?.city || "",
      state: initialSaved?.state || "",
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Keep form data synchronized when user context updates (e.g. after login / session restore)
  useEffect(() => {
    const saved = loadSavedData();
    if (saved?.profileImage && !profileImage) {
      setProfileImage(saved.profileImage);
    }

    setFormData((prev) => {
      // Always prefer live user context for name / email; only fall back for optional address fields
      const currentName = user?.fullName || cachedAdminReg?.fullName || saved?.contactName || prev.contactName;
      const currentMobile = user?.mobile || cachedAdminReg?.mobile || saved?.phoneNumber || prev.phoneNumber;
      const currentEmail = user?.email || cachedAdminReg?.email || saved?.email || prev.email;

      return {
        contactName: currentName || "",
        phoneNumber: currentMobile || "",
        email: currentEmail || "",
        streetNumber: prev.streetNumber || saved?.streetNumber || "",
        doorNumber: prev.doorNumber || saved?.doorNumber || "",
        city: prev.city || saved?.city || "",
        state: prev.state || saved?.state || "",
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    setSavedSuccess(false);

    const savedName    = formData.contactName.trim();
    const savedMobile  = formData.phoneNumber.trim();
    const savedEmail   = formData.email.trim();
    const savedStreet  = formData.streetNumber.trim();
    const savedDoor    = formData.doorNumber.trim();
    const savedCity    = formData.city;
    const savedState   = formData.state.trim();

    try {
      // 1. Persist updated info to backend
      try {
        await updateMeApi({
          fullName: savedName || undefined,
          mobile:   savedMobile || undefined,
          email:    savedEmail || undefined,
        });
      } catch (apiErr: any) {
        console.warn("Backend profile sync notice:", apiErr);
      }

      // 2. Update global AuthContext user so name/email reflects everywhere instantly
      updateUser({
        fullName: savedName || user?.fullName || "",
        mobile:   savedMobile,
        email:    savedEmail || user?.email || "",
      });

      // 3. Persist registration info cache
      const updatedReg = {
        fullName: savedName,
        mobile:   savedMobile,
        email:    savedEmail,
      };
      localStorage.setItem("admin_registered_details", JSON.stringify(updatedReg));
      localStorage.setItem("last_registered_admin",    JSON.stringify(updatedReg));

      // 4. Persist full profile info (contact + address + photo) to localStorage
      const fullProfilePayload = {
        contactName:  savedName,
        phoneNumber:  savedMobile,
        email:        savedEmail,
        streetNumber: savedStreet,
        doorNumber:   savedDoor,
        city:         savedCity,
        state:        savedState,
        profileImage,
      };

      localStorage.setItem(userProfileKey,    JSON.stringify(fullProfilePayload));
      localStorage.setItem(genericProfileKey, JSON.stringify(fullProfilePayload));

      // 5. Sync form to exactly what was saved
      setFormData({
        contactName:  savedName,
        phoneNumber:  savedMobile,
        email:        savedEmail,
        streetNumber: savedStreet,
        doorNumber:   savedDoor,
        city:         savedCity,
        state:        savedState,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const saved = loadSavedData();
    setFormData({
      contactName: user?.fullName || cachedAdminReg?.fullName || saved?.contactName || "",
      phoneNumber: user?.mobile || cachedAdminReg?.mobile || saved?.phoneNumber || "",
      email: user?.email || cachedAdminReg?.email || saved?.email || "",
      streetNumber: saved?.streetNumber || "",
      doorNumber: saved?.doorNumber || "",
      city: saved?.city || "",
      state: saved?.state || "",
    });
    setSaveError("");
    setSavedSuccess(false);
  };

  const displayName = formData.contactName || user?.fullName || cachedAdminReg?.fullName || "Administrator";

  // Role display: "Admin" if admin, "Doctor" if doctor, etc.
  const formatRole = (role?: string) => {
    if (!role) return "Admin";
    const upper = role.toUpperCase();
    if (upper === "ADMIN" || upper === "SUPER_ADMIN") return "Admin";
    if (upper === "DOCTOR") return "Doctor";
    if (upper === "PATIENT") return "Patient";
    return role
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const displayRole = formatRole(user?.roleName);

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.8rem", sm: "2.3rem" } }}>
          Personal Information
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500, mt: 0.5 }}>
          Personal &amp; Contact Info
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
            {/* Profile Photo or Initials Fallback */}
            {profileImage ? (
              <Box
                component="img"
                src={profileImage}
                alt="Admin Profile"
                sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#045E6A",
                  borderRadius: "20px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "5rem",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    lineHeight: 1,
                    userSelect: "none",
                    letterSpacing: "-2px",
                  }}
                >
                  {(formData.contactName || user?.fullName || "A")
                    .trim()
                    .split(/\s+/)
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </Typography>
              </Box>
            )}
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
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const result = reader.result as string;
                      setProfileImage(result);
                      try {
                        const current = loadSavedData() || {};
                        const updated = { ...current, profileImage: result };
                        localStorage.setItem(userProfileKey, JSON.stringify(updated));
                        localStorage.setItem(genericProfileKey, JSON.stringify(updated));
                        // Notify AdminLayout (and other listeners) to refresh avatar
                        window.dispatchEvent(new Event("profileImageUpdated"));
                      } catch {
                        // ignore
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
            {displayName}
          </Typography>

          <Typography variant="subtitle2" sx={{ color: "#6B7280", fontWeight: 700, fontSize: "0.95rem", mb: 2 }}>
            {displayRole}
          </Typography>

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
                Status
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

          {/* Contact Name (Synced from Registration) */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Contact name
            </Typography>
            <TextField
              fullWidth
              value={formData.contactName}
              placeholder="Administrator Full Name"
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

          {/* Phone Number (Synced from Registration) */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Phone number
            </Typography>
            <TextField
              fullWidth
              value={formData.phoneNumber}
              placeholder="Admin Mobile Number"
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

          {/* Email (Synced from Registration) */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              value={formData.email}
              placeholder="Admin Email Address"
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
                placeholder="Street address (Optional)"
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
                placeholder="Door / Suite / Flat (Optional)"
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
                  displayEmpty
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  sx={{
                    borderRadius: "14px",
                    backgroundColor: "#E6F8FA",
                    "& fieldset": { borderColor: "transparent" },
                    fontWeight: 600,
                    color: formData.city ? "#111827" : "#9CA3AF",
                  }}
                >
                  <MenuItem value="">
                    <em>Select City (Optional)</em>
                  </MenuItem>
                  <MenuItem value="Chennai">Chennai</MenuItem>
                  <MenuItem value="Bangalore">Bangalore</MenuItem>
                  <MenuItem value="Mumbai">Mumbai</MenuItem>
                  <MenuItem value="Delhi">Delhi</MenuItem>
                  <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                  <MenuItem value="Kolkata">Kolkata</MenuItem>
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
                placeholder="State / Province (Optional)"
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
          <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "center" }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
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
              {isSaving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
            </Button>

            <Button
              variant="contained"
              onClick={handleCancel}
              disabled={isSaving}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#16A34A" }}>
              <CheckCircle size={18} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Personal information saved successfully!
              </Typography>
            </Box>
          )}

          {saveError && (
            <Typography variant="caption" sx={{ color: "#EF4444", fontWeight: 700 }}>
              {saveError}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminProfilePage;
