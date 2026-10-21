import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Alert,
  Avatar,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckIcon from "@mui/icons-material/Check";

import type { DoctorAvailability } from "../../types/appointment.types";
import { isSlotInPast } from "../../utils/date.utils";

interface SlotSelectorModalProps {
  open: boolean;
  onClose: () => void;
  doctor: DoctorAvailability | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedTimeSlot: string | null;
  onSelectSlot: (slot: string) => void;
  onConfirmSelection: () => void;
}

export const SlotSelectorModal: React.FC<SlotSelectorModalProps> = ({
  open,
  onClose,
  doctor,
  selectedDate,
  onDateChange,
  selectedTimeSlot,
  onSelectSlot,
  onConfirmSelection,
}) => {
  const [bookedMessage, setBookedMessage] = React.useState<string | null>(null);

  if (!doctor) return null;

  const displaySlots = doctor.allSlots && doctor.allSlots.length > 0 ? doctor.allSlots : doctor.availableSlots;
  const bookedSlotsList = doctor.bookedSlots || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" }}>
            <AccessTimeIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
              Select Time Slot
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Dr. {doctor.doctorName}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {/* Date Selector */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: "#94a3b8", fontWeight: 600, mb: 1 }}>
            Appointment Date
          </Typography>
          <TextField
            type="date"
            fullWidth
            value={selectedDate}
            onChange={(e) => {
              setBookedMessage(null);
              onDateChange(e.target.value);
            }}
            slotProps={{
              input: {
                startAdornment: <CalendarTodayIcon sx={{ color: "#94a3b8", mr: 1 }} />,
              },
            }}
            sx={{
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              color: "#fff",
              "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
              "& input": { color: "#fff" },
            }}
          />
        </Box>

        {/* Doctor Schedule Details Info */}
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            mb: 3,
            display: "flex",
            justify: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
              Working Hours ({doctor.dayOfWeek})
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
              {doctor.startTime} - {doctor.endTime} ({doctor.slotDuration} mins/slot)
            </Typography>
          </Box>
          <Chip
            label={`${doctor.availableSlots.length} Available`}
            size="small"
            sx={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontWeight: 700 }}
          />
        </Box>

        {/* Available Time Slots Grid */}
        <Typography variant="subtitle2" sx={{ color: "#94a3b8", fontWeight: 600, mb: 1.5 }}>
          Available Slots
        </Typography>

        {bookedMessage && (
          <Alert severity="error" onClose={() => setBookedMessage(null)} sx={{ mb: 2, borderRadius: "10px", fontWeight: 600 }}>
            {bookedMessage}
          </Alert>
        )}

        {displaySlots.length === 0 ? (
          <Alert severity="warning" sx={{ borderRadius: "12px" }}>
            No available time slots for this doctor on the selected date.
          </Alert>
        ) : (() => {
            const pastSlotsCount = displaySlots.filter((s) => isSlotInPast(selectedDate, s)).length;
            const allPast = pastSlotsCount === displaySlots.length;

            return (
              <Box>
                {allPast && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: "10px", fontWeight: 600 }}>
                    All available time slots for today have already passed. Please select a future date.
                  </Alert>
                )}

                <div className="slot-grid">
                  {displaySlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    const isPast = isSlotInPast(selectedDate, slot);
                    const isBooked = bookedSlotsList.includes(slot) && !isSelected;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          if (isBooked) {
                            setBookedMessage(`Already booked appointment (${slot}). Please choose another time slot.`);
                            return;
                          }
                          if (isPast) return;
                          setBookedMessage(null);
                          onSelectSlot(slot);
                        }}
                        className={`slot-button ${isSelected ? "selected" : ""}`}
                        style={
                          isBooked
                            ? {
                                opacity: 0.5,
                                cursor: "not-allowed",
                                backgroundColor: "rgba(239, 68, 68, 0.18)",
                                color: "#fca5a5",
                                borderColor: "rgba(239, 68, 68, 0.3)",
                              }
                            : isPast
                            ? {
                                opacity: 0.45,
                                cursor: "not-allowed",
                                textDecoration: "line-through",
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }
                            : {}
                        }
                      >
                        {isSelected && <CheckIcon style={{ fontSize: "14px" }} />}
                        {slot} {isBooked ? " (Booked)" : isPast ? " (Passed)" : ""}
                      </button>
                    );
                  })}
                </div>
              </Box>
            );
          })()}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <Button onClick={onClose} sx={{ color: "#94a3b8" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!selectedTimeSlot}
          onClick={onConfirmSelection}
          sx={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            fontWeight: 700,
            borderRadius: "10px",
            px: 3,
          }}
        >
          Proceed to Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};
