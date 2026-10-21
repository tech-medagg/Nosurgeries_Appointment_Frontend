import React, { useState, useMemo } from "react";
import { Box, Typography, IconButton, CircularProgress, Chip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useQuery } from "@tanstack/react-query";
import { getAppointmentsApi } from "../../services/appointment.api";
import { useAuth } from "../../context/AuthContext";
import type { AppointmentListItem } from "../../types/appointment.types";

/* -- Constants ---------------------------------- */
const TEAL        = "#1CA7C0";
const TEAL_DARK   = "#0E6E80";
const TEAL_CELL   = "#D9F3F8";
const TEAL_HEADER = "#1CA7C0";
const BORDER      = "#C8E8EF";
const PAGE_BG     = "#F4F8FA";

const TIME_LABELS = ["06:00AM","07:00AM","08:00AM","09:00AM","10:00AM","11:00AM"];
const DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS      = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];
const DAY_NAMES   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/* -- Helpers ------------------------------------ */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function slotHour(time: string | null): number | null {
  if (!time) return null;
  const [h] = time.split(":").map(Number);
  return h ?? null;
}
function statusLabel(s: string): string {
  if (s === "CONFIRMED" || s === "CHECKED_IN") return "Ongoing";
  if (s === "COMPLETED")  return "Completed";
  if (s === "CANCELLED")  return "Cancelled";
  if (s === "RESCHEDULED") return "Rescheduled";
  return "Pending";
}
function statusChipColor(s: string): { bg: string; color: string } {
  if (s === "CONFIRMED" || s === "CHECKED_IN")
    return { bg: TEAL,      color: "#fff" };
  if (s === "COMPLETED")
    return { bg: "#22C55E", color: "#fff" };
  if (s === "CANCELLED")
    return { bg: "#EF4444", color: "#fff" };
  return { bg: "#F59E0B",  color: "#fff" };
}
function formatTime(time: string | null): string {
  if (!time) return "No time set";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour   = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/* -- Appointment Card (calendar cell mini card) - */
const AptCard: React.FC<{ apt: AppointmentListItem }> = ({ apt }) => {
  const doctor = apt.doctorFirstName
    ? `Dr. ${apt.doctorFirstName} ${apt.doctorLastName ?? ""}`.trim()
    : "Unassigned";
  const note   = apt.notes || apt.departmentName || "Appointment";
  const { bg, color } = statusChipColor(apt.status);
  return (
    <Box sx={{
      background: TEAL_DARK, borderRadius: "8px",
      p: "5px 7px", mb: 0.4, cursor: "pointer",
      "&:hover": { filter: "brightness(1.1)" },
      transition: "filter 0.18s",
    }}>
      <Typography sx={{ fontSize: "0.68rem", color: "#A8DDE7", mb: 0.1, lineHeight: 1.2 }}>
        {note}
      </Typography>
      <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#fff", lineHeight: 1.3, mb: 0.4 }}>
        {doctor}
      </Typography>
      <Chip
        label={statusLabel(apt.status)}
        size="small"
        sx={{
          background: bg, color, fontWeight: 700,
          fontSize: "0.65rem", height: 18, px: 0.5,
          borderRadius: "5px",
        }}
      />
    </Box>
  );
};

/* -- Day Detail Card (inside overlay) ----------- */
const DayAptCard: React.FC<{ apt: AppointmentListItem; index: number }> = ({ apt, index }) => {
  const doctor   = apt.doctorFirstName
    ? `Dr. ${apt.doctorFirstName} ${apt.doctorLastName ?? ""}`.trim()
    : "Unassigned";
  const patient  = apt.patientFirstName
    ? `${apt.patientFirstName} ${apt.patientLastName ?? ""}`.trim()
    : "Unknown Patient";
  const dept     = apt.departmentName || apt.hospitalName || "General";
  const note     = apt.notes || "No notes";
  const { bg, color } = statusChipColor(apt.status);

  return (
    <Box sx={{
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "14px",
      p: "16px 20px",
      mb: 1.5,
      animation: `slideIn 0.35s ease ${index * 0.07}s both`,
      "@keyframes slideIn": {
        from: { opacity: 0, transform: "translateY(18px)" },
        to:   { opacity: 1, transform: "translateY(0)" },
      },
      transition: "all 0.2s",
      "&:hover": {
        background: "rgba(255,255,255,0.13)",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      },
    }}>
      {/* Top row: patient + status */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: "10px",
            background: "rgba(28,167,192,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PersonIcon sx={{ fontSize: 18, color: "#A8DDE7" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              {patient}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#A8DDE7" }}>Patient</Typography>
          </Box>
        </Box>
        <Chip
          label={statusLabel(apt.status)}
          size="small"
          sx={{ background: bg, color, fontWeight: 700, fontSize: "0.75rem", height: 22, px: 0.8, borderRadius: "7px" }}
        />
      </Box>

      {/* Details row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <LocalHospitalIcon sx={{ fontSize: 14, color: TEAL }} />
          <Typography sx={{ fontSize: "0.8rem", color: "#CBD5E1" }}>{doctor}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <AccessTimeIcon sx={{ fontSize: 14, color: TEAL }} />
          <Typography sx={{ fontSize: "0.8rem", color: "#CBD5E1" }}>{formatTime(apt.appointmentTime)}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <CalendarMonthIcon sx={{ fontSize: 14, color: TEAL }} />
          <Typography sx={{ fontSize: "0.8rem", color: "#CBD5E1" }}>{dept}</Typography>
        </Box>
      </Box>

      {/* Notes */}
      {apt.notes && (
        <Typography sx={{
          fontSize: "0.78rem", color: "rgba(255,255,255,0.55)",
          mt: 1, fontStyle: "italic",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          pt: 0.8,
        }}>
          {note}
        </Typography>
      )}
    </Box>
  );
};

/* -- Day Detail Overlay ------------------------- */
interface DayOverlayProps {
  dateKey: string;       // "YYYY-MM-DD"
  dayOfWeek: number;     // 0-6
  apts: AppointmentListItem[];
  onClose: () => void;
  visible: boolean;
}

const DayOverlay: React.FC<DayOverlayProps> = ({ dateKey, dayOfWeek, apts, onClose, visible }) => {
  const [d, m, y] = (() => {
    const parts = dateKey.split("-");
    return [parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])];
  })();
  const dateLabel = `${DAY_NAMES[dayOfWeek]}, ${d} ${MONTHS[m]} ${y}`;

  return (
    <Box sx={{
      position: "fixed", inset: 0, zIndex: 1200,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      pointerEvents: visible ? "all" : "none",
    }}>
      {/* Backdrop */}
      <Box onClick={onClose} sx={{
        position: "absolute", inset: 0,
        background: "rgba(10, 40, 50, 0.72)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.38s cubic-bezier(0.4,0,0.2,1)",
      }} />

      {/* Panel */}
      <Box sx={{
        position: "relative",
        width: "100%", maxWidth: 680,
        maxHeight: "82vh",
        background: "linear-gradient(160deg, #0E4D5C 0%, #0E6E80 50%, #1CA7C0 100%)",
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -12px 60px rgba(0,0,0,0.45)",
        overflow: "hidden",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.42s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Drag handle */}
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.2, pb: 0.5 }}>
          <Box sx={{ width: 42, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
        </Box>

        {/* Header */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 3, py: 2,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#A8DDE7", mb: 0.2 }}>
              APPOINTMENTS
            </Typography>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              {dateLabel}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "10px", px: 1.5, py: 0.6,
            }}>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                {apts.length} {apts.length === 1 ? "Appt" : "Appts"}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff", p: 0.8,
              "&:hover": { background: "rgba(255,255,255,0.25)", transform: "scale(1.05)" },
              transition: "all 0.18s",
            }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ overflowY: "auto", px: 3, py: 2.5, flex: 1,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.2)", borderRadius: 3 },
        }}>
          {apts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CalendarMonthIcon sx={{ fontSize: 52, color: "rgba(255,255,255,0.2)", mb: 1.5 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem", fontWeight: 500 }}>
                No appointments on this day
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", mt: 0.5 }}>
                This date has no scheduled visits.
              </Typography>
            </Box>
          ) : (
            apts.map((apt, i) => <DayAptCard key={apt.id} apt={apt} index={i} />)
          )}
        </Box>
      </Box>
    </Box>
  );
};

/* -- Main Calendar Page ------------------------- */
const AdminCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const today    = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  /* overlay state */
  const [selectedDate, setSelectedDate] = useState<{
    dateKey: string; dayOfWeek: number;
  } | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const openOverlay = (dateKey: string, dayOfWeek: number) => {
    setSelectedDate({ dateKey, dayOfWeek });
    // small tick so the mount triggers the CSS transition
    requestAnimationFrame(() => setOverlayVisible(true));
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setTimeout(() => setSelectedDate(null), 420);
  };

  const firstName = user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Admin";
  const todayStr  = today.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  /* fetch all appointments for the viewed month */
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "calendarApts", viewYear, viewMonth],
    queryFn: () => getAppointmentsApi({ limit: 500, order: "asc" }),
  });

  const allApts: AppointmentListItem[] = data?.appointments ?? [];

  /* group appointments: map of "YYYY-MM-DD" -> AppointmentListItem[] */
  const aptsByDay = useMemo(() => {
    const map: Record<string, AppointmentListItem[]> = {};
    for (const apt of allApts) {
      if (!apt.appointmentDate) continue;
      const key = apt.appointmentDate.slice(0, 10); // YYYY-MM-DD
      if (!map[key]) map[key] = [];
      map[key].push(apt);
    }
    return map;
  }, [allApts]);

  /* build the 6-week grid */
  const totalDays  = daysInMonth(viewYear, viewMonth);
  const startDay   = firstDayOfMonth(viewYear, viewMonth);
  const prevTotal  = daysInMonth(viewYear, viewMonth - 1);

  // 6 rows x 7 cols = 42 cells
  const cells: { day: number; currentMonth: boolean; dateKey: string; colIdx: number }[] = [];
  for (let i = 0; i < 42; i++) {
    const colIdx = i % 7;
    if (i < startDay) {
      const d = prevTotal - startDay + 1 + i;
      const pm = viewMonth - 1 < 0 ? 11 : viewMonth - 1;
      const py = viewMonth - 1 < 0 ? viewYear - 1 : viewYear;
      cells.push({ day: d, currentMonth: false, dateKey: `${py}-${String(pm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, colIdx });
    } else if (i - startDay < totalDays) {
      const d = i - startDay + 1;
      cells.push({ day: d, currentMonth: true, dateKey: `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, colIdx });
    } else {
      const d = i - startDay - totalDays + 1;
      const nm = viewMonth + 1 > 11 ? 0 : viewMonth + 1;
      const ny = viewMonth + 1 > 11 ? viewYear + 1 : viewYear;
      cells.push({ day: d, currentMonth: false, dateKey: `${ny}-${String(nm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, colIdx });
    }
  }

  const rows: typeof cells[] = [];
  for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, r * 7 + 7));

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goFwd = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  /* which time label row does a cell belong to (by row index)? */
  const rowTimeLabel = (rowIdx: number) => TIME_LABELS[rowIdx] ?? "";

  const selectedApts = selectedDate ? (aptsByDay[selectedDate.dateKey] ?? []) : [];

  return (
    <Box sx={{ background: PAGE_BG, minHeight: "100vh", p: { xs: 2, md: "28px 32px" }, fontFamily: "'Inter', sans-serif" }}>

      {/* -- Welcome Header -- */}
      <Box sx={{
        background: "#fff", border: `1px solid ${BORDER}`,
        borderRadius: "18px", p: "20px 28px", mb: 2.5,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(28,167,192,0.07)",
        flexWrap: "wrap", gap: 2,
      }}>
        <Box>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#6B7280", mb: 0.4 }}>
            Calendar &nbsp;â€¢&nbsp; Schedules & Availability
          </Typography>
          <Typography sx={{
            fontSize: "1.75rem", fontWeight: 800, color: "#111827",
            letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>
            Welcome back, <span style={{ color: TEAL }}>{firstName}</span>
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.6 }}>
            <CalendarMonthIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>{todayStr}</Typography>
          </Box>
        </Box>

        {/* Month nav */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={goBack} size="small"
            sx={{ border: `1px solid ${BORDER}`, borderRadius: "10px", p: 0.6,
                  "&:hover": { background: TEAL_CELL } }}>
            <ChevronLeftIcon sx={{ color: TEAL }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", minWidth: 130, textAlign: "center" }}>
            {MONTHS[viewMonth]} {viewYear}
          </Typography>
          <IconButton onClick={goFwd} size="small"
            sx={{ border: `1px solid ${BORDER}`, borderRadius: "10px", p: 0.6,
                  "&:hover": { background: TEAL_CELL } }}>
            <ChevronRightIcon sx={{ color: TEAL }} />
          </IconButton>
        </Box>
      </Box>

      {/* -- Calendar Grid Card -- */}
      <Box sx={{
        background: "#fff", border: `1px solid ${BORDER}`,
        borderRadius: "18px", overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        /* dim when overlay is open */
        filter: overlayVisible ? "brightness(0.55) blur(1px)" : "none",
        transition: "filter 0.38s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: overlayVisible ? "none" : "all",
      }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: TEAL }} />
          </Box>
        )}

        {!isLoading && (
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 780 }}>

              {/* -- Day-of-week header row -- */}
              <Box sx={{ display: "grid", gridTemplateColumns: "62px repeat(7, 1fr)" }}>
                {/* empty corner */}
                <Box sx={{ background: TEAL_HEADER, borderRight: `1px solid rgba(255,255,255,0.15)` }} />
                {DAY_LABELS.map(d => (
                  <Box key={d} sx={{
                    background: TEAL_HEADER,
                    borderRight: `1px solid rgba(255,255,255,0.15)`,
                    py: 1.2, textAlign: "center",
                  }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>{d}</Typography>
                  </Box>
                ))}
              </Box>

              {/* -- Calendar Rows -- */}
              {rows.map((row, rowIdx) => (
                <Box key={rowIdx} sx={{
                  display: "grid",
                  gridTemplateColumns: "62px repeat(7, 1fr)",
                  borderTop: `1px solid ${BORDER}`,
                }}>

                  {/* Time label column */}
                  <Box sx={{
                    background: TEAL_DARK,
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "center", pt: 1,
                    borderRight: `1px solid rgba(255,255,255,0.15)`,
                    minHeight: 100,
                  }}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#A8DDE7", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                      {rowTimeLabel(rowIdx)}
                    </Typography>
                  </Box>

                  {/* Day cells */}
                  {row.map((cell, colIdx) => {
                    const isToday =
                      cell.currentMonth &&
                      cell.day === today.getDate() &&
                      viewMonth === today.getMonth() &&
                      viewYear === today.getFullYear();

                    const cellApts = aptsByDay[cell.dateKey] ?? [];

                    /* filter by time slot - each row owns a 1-hour bucket */
                    const slotH = 6 + rowIdx; // 06 07 08 09 10 11
                    const slotApts = cellApts.filter(a => {
                      const h = slotHour(a.appointmentTime);
                      return h === null || h === slotH;
                    });

                    const isCurrent = cell.currentMonth;
                    const hasApt    = cellApts.length > 0;

                    return (
                      <Box
                        key={colIdx}
                        onClick={() => openOverlay(cell.dateKey, cell.colIdx)}
                        sx={{
                          background: hasApt && isCurrent ? "#0E6E80" : isCurrent ? TEAL_CELL : "#E8F5F8",
                          borderRight: `1px solid ${BORDER}`,
                          minHeight: 100,
                          p: "6px 7px",
                          position: "relative",
                          transition: "background 0.18s, transform 0.15s, box-shadow 0.18s",
                          cursor: "pointer",
                          "&:hover": {
                            background: isCurrent ? "#B8E8F3" : "#D0EEF5",
                            transform: "scale(1.015)",
                            zIndex: 2,
                            boxShadow: "0 4px 18px rgba(28,167,192,0.22)",
                          },
                        }}
                      >
                        {/* Day number badge */}
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 24, height: 24, borderRadius: "6px",
                          background: isToday ? TEAL : (hasApt && isCurrent ? "rgba(255,255,255,0.2)" : "rgba(28,167,192,0.15)"),
                          mb: 0.6,
                        }}>
                          <Typography sx={{
                            fontSize: "0.72rem", fontWeight: 700,
                            color: isToday ? "#fff" : (hasApt && isCurrent ? "#fff" : TEAL_DARK),
                          }}>
                            {cell.day}
                          </Typography>
                        </Box>

                        {/* Appointment cards */}
                        {slotApts.map(apt => (
                          <AptCard key={apt.id} apt={apt} />
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              ))}

            </Box>
          </Box>
        )}
      </Box>

      {/* -- Day Detail Overlay -- */}
      {selectedDate && (
        <DayOverlay
          dateKey={selectedDate.dateKey}
          dayOfWeek={selectedDate.dayOfWeek}
          apts={selectedApts}
          onClose={closeOverlay}
          visible={overlayVisible}
        />
      )}
    </Box>
  );
};

export default AdminCalendarPage;