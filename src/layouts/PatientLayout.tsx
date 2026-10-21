import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Avatar,
  Button,
  Paper,
  Menu,
  MenuItem,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LayoutDashboard,
  CalendarCheck,
  User as UserIcon,
  Search,
  Settings,
  Bell,
  ChevronDown,
  Clock,
  Menu as MenuIcon,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import brandLogo from "../assets/logo.png";

const PatientLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const isProfileOpen = Boolean(profileAnchor);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/patient" },
    { label: "My Appointments", icon: <CalendarCheck size={20} />, path: "/patient/appointments" },
    { label: "Book Appointment", icon: <Stethoscope size={20} />, path: "/patient/hospitals" },
    { label: "My Profile", icon: <UserIcon size={20} />, path: "/patient/profile" },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const isPathActive = (itemPath: string) => {
    if (itemPath === "/patient") {
      return location.pathname === "/patient" || location.pathname === "/patient/";
    }
    return location.pathname.startsWith(itemPath);
  };

  // Sidebar Component
  const renderSidebar = () => (
    <Box
      sx={{
        width: 270,
        height: "100vh",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E2EDF2",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexShrink: 0,
        overflowY: "auto",
        zIndex: 100,
      }}
    >
      {/* Brand Header */}
      <Box
        onClick={() => navigate("/patient")}
        sx={{ mb: 3.5, display: "flex", flexDirection: "column", alignItems: "flex-start", cursor: "pointer" }}
      >
        <Box
          component="img"
          src={brandLogo}
          alt="NO SURGERIES"
          sx={{ height: 44, width: "auto", maxWidth: "100%", objectFit: "contain", mb: 0.5 }}
        />
        <Typography variant="caption" sx={{ color: "#2EBBD9", fontWeight: 800, fontSize: "0.68rem", letterSpacing: "1px", pl: 0.5 }}>
          PATIENT PORTAL
        </Typography>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active = isPathActive(item.path);
          return (
            <Button
              key={item.label}
              onClick={() => handleNavigate(item.path)}
              startIcon={item.icon}
              sx={{
                justifyContent: "flex-start",
                py: 1.3,
                px: 2,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "0.92rem",
                fontWeight: active ? 700 : 500,
                backgroundColor: active ? "#98ECF8 !important" : "transparent",
                color: active ? "#0A3F4C !important" : "#4B5563",
                boxShadow: active ? "0 4px 12px rgba(46, 187, 217, 0.2)" : "none",
                "&:hover": {
                  backgroundColor: active ? "#98ECF8" : "#E6FAFC",
                  color: active ? "#0A3F4C" : "#045E6A",
                },
                transition: "all 0.2s ease",
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>

      {/* Bottom Promo Card */}
      <Box
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: "20px",
          backgroundColor: "#D5F5FA",
          position: "relative",
          textAlign: "center",
          border: "1px solid #C4EEF5",
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "#2EBBD9",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "-35px auto 12px auto",
            border: "4px solid #FFFFFF",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Clock size={26} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0A3F4C", mb: 0.5 }}>
          Need a Consultation?
        </Typography>
        <Typography variant="caption" sx={{ color: "#045E6A", display: "block", mb: 2, lineHeight: 1.3, fontSize: "0.78rem" }}>
          Schedule a non-surgical consultation with leading specialists in minutes.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleNavigate("/patient/hospitals")}
          sx={{
            backgroundColor: "#045E6A",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "12px",
            fontWeight: 700,
            py: 1,
            boxShadow: "0 4px 10px rgba(4, 94, 106, 0.3)",
            "&:hover": { backgroundColor: "#034953" },
          }}
        >
          Book Appointment
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#EEF5F8" }}>
      {!isMobile && renderSidebar()}
      {isMobile && (
        <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          {renderSidebar()}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, overflowX: "hidden", minHeight: "100vh" }}>
        {/* Floating Top Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            mb: 3.5,
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: "24px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            boxShadow: "0 10px 30px -5px rgba(46, 187, 217, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "#2EBBD9" }}>
                <MenuIcon size={24} />
              </IconButton>
            )}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.4rem", sm: "1.85rem" } }}>
                {location.pathname.startsWith("/patient/appointments")
                  ? "My Appointments"
                  : location.pathname.startsWith("/patient/profile")
                  ? "My Profile"
                  : location.pathname.startsWith("/patient/hospitals") || location.pathname.startsWith("/patient/departments") || location.pathname.startsWith("/patient/doctors")
                  ? "Book Appointment"
                  : "Patient Dashboard"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>
                Welcome back, {user?.fullName || user?.email || "Patient"}!
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2.5 } }}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 0.8,
                borderRadius: "30px",
                backgroundColor: "#DDF4F8",
                width: { xs: "100%", sm: 220 },
                border: "1px solid #C4EEF5",
              }}
            >
              <Search size={18} color="#1CA7C0" style={{ marginRight: 8 }} />
              <InputBase placeholder="Search appointments..." sx={{ fontSize: "0.88rem", color: "#111827", flex: 1 }} />
            </Paper>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={{ backgroundColor: "#DDF4F8", color: "#1CA7C0", "&:hover": { backgroundColor: "#C4EEF5" } }}>
                <Settings size={18} />
              </IconButton>
              <IconButton sx={{ backgroundColor: "#DDF4F8", color: "#1CA7C0", "&:hover": { backgroundColor: "#C4EEF5" } }}>
                <Bell size={18} />
              </IconButton>
              <Box
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", pl: 0.5 }}
              >
                <Avatar
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt={user?.fullName || "Patient"}
                  sx={{ width: 40, height: 40, border: "2px solid #2EBBD9" }}
                />
                <IconButton size="small" sx={{ color: "#6B7280", p: 0.2 }}>
                  <ChevronDown size={16} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={profileAnchor}
          open={isProfileOpen}
          onClose={() => setProfileAnchor(null)}
          slotProps={{
            paper: {
              elevation: 12,
              sx: {
                width: 240,
                p: 1.5,
                borderRadius: "20px",
                mt: 1.5,
                backgroundColor: "#2B364B",
                color: "#FFFFFF",
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ p: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
              {user?.fullName || "Patient User"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#98ECF8" }}>
              {user?.email || "patient@example.com"}
            </Typography>
          </Box>
          <Divider sx={{ mb: 1, borderColor: "rgba(255, 255, 255, 0.15)" }} />
          <MenuItem onClick={() => { setProfileAnchor(null); navigate("/patient/profile"); }} sx={{ color: "#F8FAFC", fontWeight: 600, gap: 1.5, borderRadius: "10px", "&:hover": { backgroundColor: "#1A2235", color: "#98ECF8" } }}>
            <UserIcon size={18} color="#2EBBD9" /> My Profile
          </MenuItem>
          <MenuItem onClick={() => { setProfileAnchor(null); setLogoutDialogOpen(true); }} sx={{ color: "#F8FAFC", fontWeight: 600, gap: 1.5, borderRadius: "10px", "&:hover": { backgroundColor: "#1A2235", color: "#98ECF8" } }}>
            <LogOut size={18} color="#2EBBD9" /> Log Out
          </MenuItem>
        </Menu>

        {/* Logout Modal */}
        <Dialog
          open={logoutDialogOpen}
          onClose={() => setLogoutDialogOpen(false)}
          slotProps={{
            backdrop: { sx: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.3)" } },
            paper: { sx: { borderRadius: "24px", p: 3, maxWidth: 420, textAlign: "center", backgroundColor: "#FFFFFF", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" } },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: "#111827", fontSize: "1.2rem", pb: 1 }}>
            Are you sure you want to logout?
          </DialogTitle>
          <DialogContent sx={{ pb: 3 }}>
            <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.5 }}>
              Make sure you've completed any ongoing tasks before logging out.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, px: 0, pb: 1 }}>
            <Button
              variant="contained"
              onClick={() => setLogoutDialogOpen(false)}
              sx={{ backgroundColor: "#045E6A", color: "#FFFFFF", borderRadius: "12px", px: 3.5, py: 1, fontWeight: 700, textTransform: "none", "&:hover": { backgroundColor: "#034953" } }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleLogoutConfirm}
              sx={{ backgroundColor: "#FEE2E2", color: "#B91C1C", borderRadius: "12px", px: 3.5, py: 1, fontWeight: 800, textTransform: "none", "&:hover": { backgroundColor: "#FECACA" } }}
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>

        <Outlet />
      </Box>
    </Box>
  );
};

export default PatientLayout;
