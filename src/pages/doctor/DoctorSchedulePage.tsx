import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Snackbar,
  Grow,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyDoctorProfileApi } from "../../services/doctor.api";
import {
  getDoctorSchedulesApi,
  createDoctorScheduleApi,
  updateDoctorScheduleApi,
  deleteDoctorScheduleApi,
  type DoctorScheduleItem,
  type CreateDoctorSchedulePayload,
} from "../../services/doctorSchedule.api";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

const DAY_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
type DayOfWeek = typeof DAY_ORDER[number];

const DAY_COLORS: Record<string, string> = {
  MONDAY: "#0284c7",
  TUESDAY: "#6366f1",
  WEDNESDAY: "#059669",
  THURSDAY: "#d97706",
  FRIDAY: "#dc2626",
  SATURDAY: "#0891b2",
  SUNDAY: "#ea580c",
};

const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDayOfWeekFromDate = (dateStr: string): DayOfWeek => {
  if (!dateStr) return "MONDAY";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return "MONDAY";
  const dateObj = new Date(y, m - 1, d);
  const dayIndex = dateObj.getDay();
  return DAY_ORDER[dayIndex] ?? "MONDAY";
};

const DoctorSchedulePage: React.FC = () => {
  const queryClient = useQueryClient();
  const todayStr = getTodayString();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DoctorScheduleItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    scheduleDate: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    slotDuration: number;
    maxPatients: number;
    isAvailable: boolean;
  }>({
    scheduleDate: todayStr,
    dayOfWeek: getDayOfWeekFromDate(todayStr),
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    maxPatients: 15,
    isAvailable: true,
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["doctor", "me"],
    queryFn: getMyDoctorProfileApi,
  });

  const doctorProfile = profileData?.data;

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ["doctor", "schedule", doctorProfile?.id],
    queryFn: () => getDoctorSchedulesApi(doctorProfile!.id),
    enabled: !!doctorProfile?.id,
  });

  const schedules = scheduleData?.data ?? [];
  const sorted = [...schedules].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek as DayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek as DayOfWeek)
  );

  const isLoading = profileLoading || scheduleLoading;

  const saveMutation = useMutation({
    mutationFn: async (data: CreateDoctorSchedulePayload) => {
      if (editingSchedule) {
        return updateDoctorScheduleApi(editingSchedule.id, data);
      } else {
        return createDoctorScheduleApi(data);
      }
    },
    onSuccess: (res) => {
      if (res.success) {
        setSnackbar({
          open: true,
          message: editingSchedule ? "Schedule updated successfully!" : "New schedule slot saved successfully!",
          severity: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["doctor", "schedule"] });
        handleCloseDialog();
      } else {
        setSnackbar({ open: true, message: res.message || "Failed to save schedule", severity: "error" });
      }
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: errorObj?.response?.data?.message || errorObj?.message || "Failed to save schedule", severity: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDoctorScheduleApi(id),
    onSuccess: (res) => {
      if (res.success) {
        setSnackbar({ open: true, message: "Schedule deleted successfully", severity: "success" });
        queryClient.invalidateQueries({ queryKey: ["doctor", "schedule"] });
        setDeleteId(null);
      } else {
        setSnackbar({ open: true, message: res.message || "Failed to delete schedule", severity: "error" });
      }
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: errorObj?.response?.data?.message || "Failed to delete schedule", severity: "error" });
    },
  });

  const handleDateChange = (dateVal: string) => {
    const computedDay = getDayOfWeekFromDate(dateVal);
    setFormData((prev) => ({
      ...prev,
      scheduleDate: dateVal,
      dayOfWeek: computedDay,
    }));
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    const dateNow = getTodayString();
    setFormData({
      scheduleDate: dateNow,
      dayOfWeek: getDayOfWeekFromDate(dateNow),
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
      maxPatients: 15,
      isAvailable: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (sch: DoctorScheduleItem) => {
    setEditingSchedule(sch);
    setFormData({
      scheduleDate: todayStr,
      dayOfWeek: sch.dayOfWeek as DayOfWeek,
      startTime: sch.startTime,
      endTime: sch.endTime,
      slotDuration: sch.slotDuration,
      maxPatients: sch.maxPatients,
      isAvailable: sch.isAvailable,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
  };

  const to24Hour = (val: string): string => {
    if (!val) return "09:00";
    const str = val.trim().toUpperCase();
    const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return val;
    let hours = parseInt(match[1]!, 10);
    const minutes = match[2]!;
    const period = match[3];

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorProfile) {
      setSnackbar({ open: true, message: "Doctor profile not loaded yet. Please refresh or update profile.", severity: "error" });
      return;
    }

    saveMutation.mutate({
      doctorProfileId: doctorProfile.id,
      dayOfWeek: formData.dayOfWeek,
      startTime: to24Hour(formData.startTime),
      endTime: to24Hour(formData.endTime),
      slotDuration: Number(formData.slotDuration),
      maxPatients: Number(formData.maxPatients),
      isAvailable: Boolean(formData.isAvailable),
    });
  };

  const generateSlots = (start: string, end: string, duration: number): string[] => {
    const slots: string[] = [];
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let cur = (sh ?? 0) * 60 + (sm ?? 0);
    const endMin = (eh ?? 0) * 60 + (em ?? 0);
    while (cur + duration <= endMin) {
      const h = Math.floor(cur / 60).toString().padStart(2, "0");
      const m = (cur % 60).toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
      cur += duration;
    }
    return slots;
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: "#111827", fontWeight: 800, mb: 0.5 }}>
            My Weekly Availability Schedule
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Add or update your available duty slots. These slots will appear live on both the Admin desk and Patient booking pages.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ color: "#FFFFFF", fontSize: "1.3rem !important" }} />}
          onClick={handleOpenAdd}
          sx={{
            backgroundColor: "#045E6A",
            color: "#FFFFFF",
            borderRadius: "12px",
            fontWeight: 800,
            px: 3,
            py: 1.2,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(4, 94, 106, 0.25)",
            "& .MuiButton-startIcon": { color: "#FFFFFF" },
            "&:hover": { backgroundColor: "#034953" },
          }}
        >
          Add Available Slot
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#2EBBD9" }} />
        </Box>
      ) : sorted.length === 0 ? (
        <Card sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2", borderRadius: "20px", boxShadow: "0 10px 30px -5px rgba(46, 187, 217, 0.08)" }}>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <EventNoteIcon sx={{ fontSize: 48, color: "#1CA7C0", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#111827", fontWeight: 800, mb: 1 }}>
              No Availability Configured
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", maxWidth: 460, mx: "auto", mb: 3 }}>
              You haven't set any available time slots yet. Click "Add Available Slot" above to set up your schedule so patients can book appointments with you.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ color: "#FFFFFF", fontSize: "1.3rem !important" }} />}
              onClick={handleOpenAdd}
              sx={{
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                borderRadius: "12px",
                fontWeight: 800,
                textTransform: "none",
                px: 3,
                py: 1.1,
                boxShadow: "0 4px 14px rgba(4, 94, 106, 0.25)",
                "& .MuiButton-startIcon": { color: "#FFFFFF" },
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              Add Your First Slot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {sorted.map((sch) => {
            const color = DAY_COLORS[sch.dayOfWeek] ?? "#045E6A";
            const slots = generateSlots(sch.startTime, sch.endTime, sch.slotDuration);

            return (
              <Grid key={sch.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  sx={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid #E2EDF2`,
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px -5px rgba(46, 187, 217, 0.08)",
                    height: "100%",
                    opacity: sch.isAvailable ? 1 : 0.6,
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: "#2EBBD9" },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Day header & Action icons */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                        <Typography variant="h6" sx={{ color: "#111827", fontWeight: 800, fontSize: "1rem" }}>
                          {sch.dayOfWeek}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Chip
                          label={sch.isAvailable ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: sch.isAvailable ? "#DCFCE7" : "#FEE2E2",
                            color: sch.isAvailable ? "#15803D" : "#B91C1C",
                            fontWeight: 800,
                            fontSize: "0.68rem",
                            mr: 0.5,
                          }}
                        />
                        <IconButton size="small" onClick={() => handleOpenEdit(sch)} sx={{ color: "#045E6A" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteId(sch.id)} sx={{ color: "#EF4444" }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Time range */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: "#1CA7C0" }} />
                      <Typography variant="body2" sx={{ color: "#4B5563", fontWeight: 700 }}>
                        {sch.startTime} — {sch.endTime}
                      </Typography>
                    </Box>

                    {/* Max patients + slot duration */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <GroupIcon sx={{ fontSize: 15, color: "#1CA7C0" }} />
                        <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                          Max {sch.maxPatients} patients
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                        ⏱ {sch.slotDuration} min slots
                      </Typography>
                    </Box>

                    {/* Slots preview */}
                    <Typography variant="caption" sx={{ color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
                      Time Slots ({slots.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                      {slots.map((slot) => (
                        <Chip
                          key={slot}
                          label={slot}
                          size="small"
                          sx={{
                            backgroundColor: "#DDF4F8",
                            color: "#045E6A",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                      {slots.length === 0 && (
                        <Typography variant="caption" sx={{ color: "#94A3B8" }}>No slots available</Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Schedule Dialog with Grow Popup Animation & Clean Spacing */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        slots={{ transition: Transition }}
        keepMounted
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: "blur(4px)", backgroundColor: "rgba(0, 0, 0, 0.4)" } },
          paper: {
            sx: {
              borderRadius: "24px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
              overflow: "auto",
            },
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#111827", px: 3, py: 2.5, pb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: "12px", backgroundColor: "#DDF4F8", color: "#045E6A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CalendarTodayIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                {editingSchedule ? "Edit Schedule Slot" : "Add Available Slot"}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small" sx={{ color: "#6B7280" }}><CloseIcon /></IconButton>
          </DialogTitle>

          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, px: 3, paddingTop: "32px !important", pb: 2, overflowY: "auto" }}>
            {/* Schedule Date field with min past dates disabled */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Target Date"
                type="date"
                fullWidth
                value={formData.scheduleDate}
                onChange={(e) => handleDateChange(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: todayStr },
                }}
                helperText="Past dates are disabled"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "#F8FAFC" } }}
              />

              <FormControl fullWidth>
                <InputLabel shrink>Day of Week</InputLabel>
                <Select
                  value={formData.dayOfWeek}
                  label="Day of Week"
                  notched
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })}
                  sx={{ borderRadius: "12px", backgroundColor: "#F8FAFC" }}
                >
                  {DAY_ORDER.map((day) => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Start and End Times */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "#F8FAFC" } }}
              />
              <TextField
                label="End Time"
                type="time"
                fullWidth
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "#F8FAFC" } }}
              />
            </Box>

            {/* Slot Duration & Max Patients */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Slot Duration (minutes)"
                type="number"
                fullWidth
                value={formData.slotDuration}
                onChange={(e) => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "#F8FAFC" } }}
              />
              <TextField
                label="Max Patients"
                type="number"
                fullWidth
                value={formData.maxPatients}
                onChange={(e) => setFormData({ ...formData, maxPatients: Number(e.target.value) })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "#F8FAFC" } }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827" }}>
                  Available / Active Status
                </Typography>
              }
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pt: 2, pb: 3, justifyContent: "flex-end", gap: 1.5 }}>
            <Button onClick={handleCloseDialog} sx={{ color: "#6B7280", fontWeight: 700, textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saveMutation.isPending}
              sx={{
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                fontWeight: 800,
                borderRadius: "12px",
                px: 3.5,
                py: 1.1,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(4, 94, 106, 0.25)",
                "&:hover": { backgroundColor: "#034953" },
              }}
            >
              {saveMutation.isPending ? "Saving..." : "Save Schedule"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "#111827" }}>Delete Schedule Slot?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Are you sure you want to remove this schedule slot? Patients will no longer be able to book this slot.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: "#6B7280" }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            sx={{ borderRadius: "10px", fontWeight: 800 }}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ borderRadius: "10px", fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorSchedulePage;
