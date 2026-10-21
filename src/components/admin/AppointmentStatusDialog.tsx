import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import type { AppointmentListItem, AppointmentStatus } from "../../types/appointment.types";

interface AppointmentStatusDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentListItem | null;
  onUpdateStatus: (newStatus: AppointmentStatus) => Promise<void>;
}

export const AppointmentStatusDialog: React.FC<AppointmentStatusDialogProps> = ({
  open,
  onClose,
  appointment,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(
    appointment?.status ?? "PENDING"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!appointment) return null;

  // Allowed transitions map matching appointment.service.ts
  const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED", "RESCHEDULED"],
    CONFIRMED: ["CHECKED_IN", "CANCELLED", "RESCHEDULED"],
    CHECKED_IN: ["COMPLETED"],
    RESCHEDULED: ["CONFIRMED", "CANCELLED", "RESCHEDULED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  const validStatuses = allowedTransitions[appointment.status] || [];

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await onUpdateStatus(selectedStatus);
      onClose();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errObj?.response?.data?.message || errObj.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          pb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
          Update Appointment Status
        </Typography>
        {!submitting && (
          <IconButton onClick={onClose} sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: "12px", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
            Current Status: <strong>{appointment.status}</strong>
          </Typography>
        </Box>

        {validStatuses.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: "12px" }}>
            No status changes are permitted for appointments in state {appointment.status}.
          </Alert>
        ) : (
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel sx={{ color: "#94a3b8" }}>New Status</InputLabel>
            <Select
              value={selectedStatus}
              label="New Status"
              onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus)}
              sx={{
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#fff",
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              {validStatuses.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: "#94a3b8" }}>
          Cancel
        </Button>
        {validStatuses.length > 0 && (
          <Button
            variant="contained"
            disabled={submitting || selectedStatus === appointment.status}
            onClick={handleSave}
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              fontWeight: 700,
              borderRadius: "10px",
            }}
          >
            {submitting ? <CircularProgress size={20} /> : "Update Status"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
