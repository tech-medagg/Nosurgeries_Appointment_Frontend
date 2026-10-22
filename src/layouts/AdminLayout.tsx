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
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar as CalendarIcon,
  Users,
  ClipboardList,
  BarChart3,
  UserCheck,
  Search,
  Settings,
  Bell,
  ChevronDown,
  Clock,
  MoreHorizontal,
  Menu as MenuIcon,
  LogOut,
  User as UserIcon,
  HelpCircle,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../pages/admin/AdminDashboardPage.css";
import brandLogo from "../assets/logo.png";

// Interface for Notification Items
export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  date: string;
  avatar: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Your Next Dental Appointment is Coming Up",
    description: "Remember your dental check-up with Dr. Liana Crest on Jun 15, 2026 at 10:30 am.",
    timeAgo: "1 hours ago",
    date: "Jun 15, 2026",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Appointment Rescheduled Fixed",
    description: "Your dental appointment with Dr. Liana has been moved to Jun 15, 2026 at 10:30 am.",
    timeAgo: "6 hours ago",
    date: "Jun 15, 2026",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "System Schedule Update Confirmed",
    description: "Clinic operational hours and doctor appointment rosters updated successfully.",
    timeAgo: "1 day ago",
    date: "Jun 14, 2026",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    isRead: true,
  },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // Helper to read saved profile image from localStorage
  const readProfileImage = React.useCallback(() => {
    try {
      const userKey = user?.email || user?.id || "admin";
      const raw =
        localStorage.getItem(`admin_profile_data_${userKey}`) ||
        localStorage.getItem("admin_profile_data_global");
      if (!raw) return null;
      return (JSON.parse(raw) as { profileImage?: string }).profileImage || null;
    } catch {
      return null;
    }
  }, [user?.email, user?.id]);

  // Reactive profile image — updates when photo is uploaded in AdminProfilePage
  const [layoutProfileImage, setLayoutProfileImage] = React.useState<string | null>(() => {
    try {
      const userKey = "admin"; // initial read before user loads
      const raw =
        localStorage.getItem(`admin_profile_data_${userKey}`) ||
        localStorage.getItem("admin_profile_data_global");
      if (!raw) return null;
      return (JSON.parse(raw) as { profileImage?: string }).profileImage || null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    // Re-read whenever user loads
    setLayoutProfileImage(readProfileImage());

    // Listen for photo upload events from AdminProfilePage
    const handleProfileImageUpdate = () => setLayoutProfileImage(readProfileImage());
    window.addEventListener("profileImageUpdated", handleProfileImageUpdate);
    window.addEventListener("storage", handleProfileImageUpdate);

    return () => {
      window.removeEventListener("profileImageUpdated", handleProfileImageUpdate);
      window.removeEventListener("storage", handleProfileImageUpdate);
    };
  }, [readProfileImage]);

  // Initials from user's full name (e.g. "Sumitha" → "S", "John Doe" → "JD")
  const userInitials = React.useMemo(() => {
    const name = user?.fullName || user?.email || "";
    if (!name) return "A";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }, [user?.fullName, user?.email]);

  // Drawer state for mobile screens
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notifications State & Real Flow Menu
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const isNotificationOpen = Boolean(notificationAnchor);

  // Three dots (...) options menu inside Notification Popover
  const [notifOptionsAnchor, setNotifOptionsAnchor] = useState<null | HTMLElement>(null);
  const isNotifOptionsOpen = Boolean(notifOptionsAnchor);

  // User Profile Menu State
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const isProfileOpen = Boolean(profileAnchor);

  // Logout Confirmation Modal State
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Unread Count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handlers for Three Dots Menu (...)
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setNotifOptionsAnchor(null);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setNotifOptionsAnchor(null);
  };

  const handleNotificationSettings = () => {
    setNotifOptionsAnchor(null);
    setNotificationAnchor(null);
    navigate("/admin/profile");
  };

  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
    { label: "Appointments", icon: <CalendarCheck size={20} />, path: "/admin/appointments" },
    { label: "Calendar", icon: <CalendarIcon size={20} />, path: "/admin/calendar" },
    { label: "Patients", icon: <Users size={20} />, path: "/admin/patients" },
    { label: "Treatment Plans", icon: <ClipboardList size={20} />, path: "/admin/treatment-plans" },
    { label: "Analytics & Reports", icon: <BarChart3 size={20} />, path: "/admin/analytics" },
    { label: "Staff Management", icon: <UserCheck size={20} />, path: "/admin/staff" },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const isPathActive = (itemPath: string) => {
    if (itemPath === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/" || location.pathname === "/admin/dashboard";
    }
    return location.pathname.startsWith(itemPath);
  };

  // Render Sidebar Navigation
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
        onClick={() => navigate("/admin")}
        sx={{ mb: 3.5, display: "flex", flexDirection: "column", alignItems: "flex-start", cursor: "pointer" }}
      >
        <Box
          component="img"
          src={brandLogo}
          alt="NO SURGERIES Powered by Medagg"
          sx={{ height: 48, width: "auto", maxWidth: "100%", objectFit: "contain", mb: 0.5 }}
        />
        <Typography variant="caption" sx={{ color: "#2EBBD9", fontWeight: 800, fontSize: "0.68rem", letterSpacing: "1px", pl: 0.5 }}>
          ADMIN PORTAL
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
          Book Appointment
        </Typography>
        <Typography variant="caption" sx={{ color: "#045E6A", display: "block", mb: 2, lineHeight: 1.3, fontSize: "0.78rem" }}>
          Skip the waiting room. Schedule your next dental checkup online in just a few clicks.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleNavigate("/admin/appointments")}
          sx={{
            backgroundColor: "#045E6A",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "12px",
            fontWeight: 700,
            py: 1,
            boxShadow: "0 4px 10px rgba(4, 94, 106, 0.3)",
            "&:hover": {
              backgroundColor: "#034953",
            },
          }}
        >
          Book Now
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#EEF5F8" }}>
      {/* Sidebar Desktop */}
      {!isMobile && renderSidebar()}

      {/* Sidebar Mobile Drawer */}
      {isMobile && (
        <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          {renderSidebar()}
        </Drawer>
      )}

      {/* Main Container */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, overflowX: "hidden" }}>
        {/* Top Header Bar */}
        <Box
          className="floating-header-bar"
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
          {/* Header Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "#2EBBD9" }}>
                <MenuIcon size={24} />
              </IconButton>
            )}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.4rem", sm: "1.85rem" } }}>
                {location.pathname.startsWith("/admin/profile")
                  ? "Personal Information"
                  : location.pathname.startsWith("/admin/help")
                  ? "Help Centre"
                  : location.pathname.startsWith("/admin/staff")
                  ? "Staff Management"
                  : location.pathname.startsWith("/admin/patients")
                  ? "Patients"
                  : location.pathname.startsWith("/admin/treatment-plans")
                  ? "Treatment Plans"
                  : location.pathname.startsWith("/admin/analytics")
                  ? "Analytics & Reports"
                  : location.pathname.startsWith("/admin/appointments")
                  ? "Appointments"
                  : location.pathname.startsWith("/admin/calendar")
                  ? "Calendar"
                  : "Dashboard"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>
                {location.pathname.startsWith("/admin/profile")
                  ? "Personal & Contact Info"
                  : location.pathname.startsWith("/admin/help")
                  ? "Help & Knowledge Base"
                  : location.pathname.startsWith("/admin/staff")
                  ? "Practitioners & Duty Schedule"
                  : location.pathname.startsWith("/admin/patients")
                  ? "Records & History"
                  : location.pathname.startsWith("/admin/treatment-plans")
                  ? "Care & Procedures"
                  : location.pathname.startsWith("/admin/analytics")
                  ? "Performance & Growth Insights"
                  : location.pathname.startsWith("/admin/appointments")
                  ? "Manage Patient Appointments"
                  : location.pathname.startsWith("/admin/calendar")
                  ? "Doctor & Appointment Schedules"
                  : "Overview & Real-time Insights"}
              </Typography>
            </Box>
          </Box>

          {/* Right Header Action Group */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2.5 },
              flexWrap: "wrap",
              width: { xs: "100%", md: "auto" },
              justifyContent: "space-between",
            }}
          >
            {/* Search doctor input */}
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
              <InputBase
                placeholder="Search doctor....."
                sx={{ fontSize: "0.88rem", color: "#111827", flex: 1 }}
              />
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={{ backgroundColor: "#DDF4F8", color: "#1CA7C0", "&:hover": { backgroundColor: "#C4EEF5" } }}>
                <Settings size={18} />
              </IconButton>

              {/* Notification Bell */}
              <IconButton
                onClick={(e) => setNotificationAnchor(e.currentTarget)}
                sx={{ backgroundColor: "#DDF4F8", color: "#1CA7C0", position: "relative", "&:hover": { backgroundColor: "#C4EEF5" } }}
              >
                <Bell size={18} />
                {unreadCount > 0 && <Box className="pulse-badge" />}
              </IconButton>

              {/* User Avatar Menu Trigger */}
              <Box
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", pl: 0.5 }}
              >
                <Avatar
                  src={layoutProfileImage || undefined}
                  alt={user?.fullName || user?.email || "Admin"}
                  sx={{
                    width: 40,
                    height: 40,
                    border: "2px solid #2EBBD9",
                    backgroundColor: layoutProfileImage ? undefined : "#045E6A",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                  }}
                >
                  {!layoutProfileImage && userInitials}
                </Avatar>
                <IconButton size="small" sx={{ color: "#6B7280", p: 0.2 }}>
                  <ChevronDown size={16} />
                </IconButton>
              </Box>
            </Box>

            {/* Top Right Quick Stats Counter */}
            <Box sx={{ display: { xs: "none", xl: "flex" }, alignItems: "center", gap: 2.5, pl: 2, borderLeft: "2px solid #E2EDF2" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Users size={20} color="#1CA7C0" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: "#111827", fontSize: "1.05rem" }}>16</Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.75rem" }}>New Patients</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarCheck size={20} color="#1CA7C0" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: "#111827", fontSize: "1.05rem" }}>30</Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.75rem" }}>Appointment</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UserCheck size={20} color="#1CA7C0" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: "#111827", fontSize: "1.05rem" }}>12</Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.75rem" }}>Active Doctors</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* NOTIFICATION POPOVER (DARK SLATE NAVY #2B364B) */}
        <Menu
          anchorEl={notificationAnchor}
          open={isNotificationOpen}
          onClose={() => setNotificationAnchor(null)}
          slotProps={{
            paper: {
              elevation: 12,
              sx: {
                width: 400,
                p: 2.5,
                borderRadius: "24px",
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
          {/* Header Row: Title "Notification" + Three Dots Menu (...) */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pb: 1.2, borderBottom: "1px solid rgba(255, 255, 255, 0.18)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.1rem" }}>
                Notification
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} New`}
                  size="small"
                  sx={{ backgroundColor: "#2EBBD9", color: "#FFFFFF", fontWeight: 800, height: 20, fontSize: "0.68rem" }}
                />
              )}
            </Box>

            {/* Three Dots Button (...) */}
            <IconButton
              size="small"
              onClick={(e) => setNotifOptionsAnchor(e.currentTarget)}
              sx={{ color: "#FFFFFF", "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }}
            >
              <MoreHorizontal size={20} />
            </IconButton>
          </Box>

          {/* Three Dots (...) Sub-Menu Options */}
          <Menu
            anchorEl={notifOptionsAnchor}
            open={isNotifOptionsOpen}
            onClose={() => setNotifOptionsAnchor(null)}
            slotProps={{
              paper: {
                elevation: 8,
                sx: {
                  borderRadius: "14px",
                  mt: 0.5,
                  minWidth: 200,
                  backgroundColor: "#1F2937",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.1)",
                },
              },
            }}
          >
            <MenuItem onClick={handleMarkAllAsRead} sx={{ fontSize: "0.88rem", fontWeight: 600, gap: 1.5, color: "#F8FAFC", "&:hover": { backgroundColor: "rgba(46, 187, 217, 0.2)" } }}>
              <CheckCheck size={16} color="#2EBBD9" /> Mark all as read
            </MenuItem>
            <MenuItem onClick={handleClearAllNotifications} sx={{ fontSize: "0.88rem", fontWeight: 600, gap: 1.5, color: "#FCA5A5", "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.2)" } }}>
              <Trash2 size={16} color="#FCA5A5" /> Clear all notifications
            </MenuItem>
            <MenuItem onClick={handleNotificationSettings} sx={{ fontSize: "0.88rem", fontWeight: 600, gap: 1.5, color: "#F8FAFC", "&:hover": { backgroundColor: "rgba(46, 187, 217, 0.2)" } }}>
              <Settings size={16} color="#94A3B8" /> Notification Settings
            </MenuItem>
          </Menu>

          {/* Notifications List Body */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              maxHeight: 380,
              overflowY: "auto",
              overflowX: "hidden",
              pr: 0.5,
              /* Custom scrollbar */
              "&::-webkit-scrollbar": {
                width: "5px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#2EBBD9",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#7DE2F0",
                },
              },
              /* Firefox */
              scrollbarWidth: "thin",
              scrollbarColor: "#2EBBD9 rgba(255,255,255,0.05)",
            }}
          >
            {notifications.map((item) => (
              <Box
                key={item.id}
                onClick={() => {
                  setNotifications(notifications.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
                }}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1.8,
                  borderRadius: "16px",
                  backgroundColor: "#FFFFFF",
                  color: "#111827",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  position: "relative",
                  border: item.isRead ? "1px solid #E2EDF2" : "2.5px solid #2EBBD9",
                  transition: "transform 0.15s ease",
                  "&:hover": { transform: "scale(1.01)" },
                }}
              >
                <Avatar
                  src={item.avatar}
                  alt={item.title}
                  sx={{ width: 44, height: 44, borderRadius: "50%" }}
                />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.88rem", lineHeight: 1.25, mb: 0.5 }}>
                    {item.title}
                  </Typography>

                  <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mb: 1, fontSize: "0.78rem", lineHeight: 1.35 }}>
                    {item.description}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "space-between", color: "#9CA3AF", fontSize: "0.72rem", fontWeight: 500 }}>
                    <span>{item.timeAgo}</span>
                    <span>{item.date}</span>
                  </Box>
                </Box>
              </Box>
            ))}

            {notifications.length === 0 && (
              <Box sx={{ py: 4, textAlign: "center", color: "#CBD5E1" }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  No unread notifications.
                </Typography>
              </Box>
            )}
          </Box>
        </Menu>

        {/* USER PROFILE DROPDOWN MENU (DARK NAVY BG #2B364B + BRIGHT HIGH CONTRAST LIGHT TEXT & ICONS) */}
        <Menu
          anchorEl={profileAnchor}
          open={isProfileOpen}
          onClose={() => setProfileAnchor(null)}
          slotProps={{
            paper: {
              elevation: 12,
              sx: {
                width: 250,
                p: 1.5,
                borderRadius: "24px",
                mt: 1.5,
                backgroundColor: "#2B364B",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {/* User Header Box (Bright White Name & Light Cyan Email) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1, mb: 1 }}>
            <Avatar
              src={layoutProfileImage || undefined}
              alt={user?.fullName || "Admin"}
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                border: "2px solid #2EBBD9",
                backgroundColor: layoutProfileImage ? undefined : "#045E6A",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "1rem",
              }}
            >
              {!layoutProfileImage && userInitials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.98rem", lineHeight: 1.2 }}
              >
                {user?.fullName || (user?.email ? user.email.split("@")[0] : "Admin")}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: "#98ECF8", fontSize: "0.75rem", fontWeight: 500, display: "block" }}
              >
                {user?.email || ""}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 1, borderColor: "rgba(255, 255, 255, 0.15)" }} />

          {/* Menu Item 1: Personal Information (Vibrant Cyan Icon + White Text) */}
          <MenuItem
            onClick={() => { setProfileAnchor(null); navigate("/admin/profile"); }}
            sx={{
              py: 1.3,
              px: 1.5,
              borderRadius: "12px",
              fontSize: "0.92rem",
              color: "#F8FAFC",
              fontWeight: 700,
              gap: 1.5,
              "&:hover": {
                backgroundColor: "rgba(46, 187, 217, 0.2)",
                color: "#98ECF8",
              },
              transition: "all 0.15s ease",
            }}
          >
            <UserIcon size={18} color="#2EBBD9" /> Personal Information
          </MenuItem>

          {/* Menu Item 2: Help & Center (Vibrant Cyan Icon + White Text) */}
          <MenuItem
            onClick={() => { setProfileAnchor(null); navigate("/admin/help"); }}
            sx={{
              py: 1.3,
              px: 1.5,
              borderRadius: "12px",
              fontSize: "0.92rem",
              color: "#F8FAFC",
              fontWeight: 700,
              gap: 1.5,
              "&:hover": {
                backgroundColor: "rgba(46, 187, 217, 0.2)",
                color: "#98ECF8",
              },
              transition: "all 0.15s ease",
            }}
          >
            <HelpCircle size={18} color="#2EBBD9" /> Help & Center
          </MenuItem>

          {/* Menu Item 3: Log Out (Vibrant Cyan Icon + White Text) */}
          <MenuItem
            onClick={() => { setProfileAnchor(null); setLogoutDialogOpen(true); }}
            sx={{
              py: 1.3,
              px: 1.5,
              borderRadius: "12px",
              fontSize: "0.92rem",
              color: "#F8FAFC",
              fontWeight: 700,
              gap: 1.5,
              "&:hover": {
                backgroundColor: "#1A2235",
                color: "#98ECF8",
              },
              transition: "all 0.15s ease",
            }}
          >
            <LogOut size={18} color="#2EBBD9" /> Log Out
          </MenuItem>

          <Divider sx={{ my: 1, borderColor: "rgba(255, 255, 255, 0.15)" }} />

          {/* Footer Terms & Privacy (High Contrast Light Slate Text) */}
          <Box sx={{ px: 1, py: 0.5, textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "#CBD5E1", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2px" }}>
              Term Conditions · Privacy Policy
            </Typography>
          </Box>
        </Menu>

        {/* LOGOUT CONFIRMATION DIALOG MODAL */}
        <Dialog
          open={logoutDialogOpen}
          onClose={() => setLogoutDialogOpen(false)}
          slotProps={{
            backdrop: {
              sx: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.3)" },
            },
            paper: {
              sx: {
                borderRadius: "24px",
                p: 3,
                maxWidth: 420,
                textAlign: "center",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: "#111827", fontSize: "1.25rem", pb: 1 }}>
            Are you sure you want to logout?
          </DialogTitle>
          <DialogContent sx={{ pb: 3 }}>
            <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.5, fontSize: "0.9rem" }}>
              Make sure you've saved your work or completed any ongoing tasks before logging out.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, px: 0, pb: 1 }}>
            <Button
              variant="contained"
              onClick={() => setLogoutDialogOpen(false)}
              sx={{
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                borderRadius: "12px",
                px: 3.5,
                py: 1,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.9rem",
                boxShadow: "0 4px 12px rgba(4, 94, 106, 0.3)",
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleLogoutConfirm}
              sx={{
                backgroundColor: "#98ECF8",
                color: "#045E6A",
                borderRadius: "12px",
                px: 3.5,
                py: 1,
                fontWeight: 800,
                textTransform: "none",
                fontSize: "0.9rem",
                "&:hover": { backgroundColor: "#7DE2F0" },
              }}
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dynamic Page Content */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
