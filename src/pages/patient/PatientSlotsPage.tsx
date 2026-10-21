import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useEffect, useState } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getDoctorAvailabilityApi,
} from "../../services/appointment.api";

import type {
  DoctorAvailability,
} from "../../types/appointment.types";

import { isSlotInPast } from "../../utils/date.utils";

const getToday = () => {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const PatientSlotsPage = () => {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const hospitalId =
    searchParams.get("hospitalId");

  const departmentId =
    searchParams.get(
      "departmentId"
    );

  const doctorProfileId =
    searchParams.get(
      "doctorProfileId"
    );

  const dateFromQuery = searchParams.get("appointmentDate") || searchParams.get("date");

  const [appointmentDate, setAppointmentDate] =
    useState(dateFromQuery || getToday());

  const [prevDateQuery, setPrevDateQuery] = useState(dateFromQuery);
  if (dateFromQuery && dateFromQuery !== prevDateQuery) {
    setPrevDateQuery(dateFromQuery);
    setAppointmentDate(dateFromQuery);
  }

  const [availability, setAvailability] =
    useState<DoctorAvailability[]>([]);

  const [bookedMessage, setBookedMessage] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let isSubscribed = true;
    if (!hospitalId || !departmentId || !appointmentDate) return;

    getDoctorAvailabilityApi(hospitalId, departmentId, appointmentDate)
      .then((response) => {
        if (!isSubscribed) return;
        if (!response.success) {
          setError(response.message || "Unable to load available slots.");
          setAvailability([]);
        } else {
          setError("");
          setAvailability(response.data);
        }
      })
      .catch((err: unknown) => {
        if (!isSubscribed) return;
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        setError(errorObj?.response?.data?.message || errorObj?.message || "Unable to load available slots.");
        setAvailability([]);
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [hospitalId, departmentId, appointmentDate]);

  if (
    !hospitalId ||
    !departmentId ||
    !doctorProfileId
  ) {
    return (
      <Box>
        <Alert severity="warning">
          Hospital, department and
          doctor selection are required.
        </Alert>

        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() =>
            navigate(
              "/patient/hospitals"
            )
          }
        >
          Start Again
        </Button>
      </Box>
    );
  }

  const selectedDoctor =
    availability.find(
      (doctor) =>
        doctor.doctorProfileId ===
        doctorProfileId
    );

  const handleSelectSlot = (
    appointmentTime: string
  ) => {
    navigate(
      `/patient/book-appointment?hospitalId=${encodeURIComponent(
        hospitalId
      )}&departmentId=${encodeURIComponent(
        departmentId
      )}&doctorProfileId=${encodeURIComponent(
        doctorProfileId
      )}&appointmentDate=${encodeURIComponent(
        appointmentDate
      )}&appointmentTime=${encodeURIComponent(
        appointmentTime
      )}`
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate(
              `/patient/doctors?hospitalId=${encodeURIComponent(
                hospitalId
              )}&departmentId=${encodeURIComponent(
                departmentId
              )}`
            )
          }
        >
          Back
        </Button>

        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            Available Appointment Slots
          </Typography>

          <Typography color="text.secondary">
            Select a date and available
            time slot.
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
        <TextField
  type="date"
  label="Appointment Date"
  value={appointmentDate}
  onChange={(event) =>
    setAppointmentDate(event.target.value)
  }
  slotProps={{
    inputLabel: {
      shrink: true,
    },
    htmlInput: {
      min: getToday(),
    },
  }}
  fullWidth
/>
        </CardContent>
      </Card>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {!loading &&
        !error &&
        !selectedDoctor && (
          <Alert severity="info">
            This doctor has no availability
            for the selected date.
          </Alert>
        )}

      {selectedDoctor && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <AccessTimeIcon
                color="primary"
              />

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {
                    selectedDoctor.doctorName
                  }
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  {
                    selectedDoctor.startTime
                  }{" "}
                  -{" "}
                  {
                    selectedDoctor.endTime
                  }
                </Typography>
              </Box>
            </Box>

            {bookedMessage && (
              <Alert severity="error" onClose={() => setBookedMessage(null)} sx={{ mb: 3, borderRadius: "10px", fontWeight: 600 }}>
                {bookedMessage}
              </Alert>
            )}

            {(() => {
              const displaySlots = selectedDoctor.allSlots && selectedDoctor.allSlots.length > 0 ? selectedDoctor.allSlots : selectedDoctor.availableSlots;
              const bookedSlotsList = selectedDoctor.bookedSlots || [];

              if (displaySlots.length === 0) {
                return (
                  <Alert severity="info">
                    No slots are available for this date.
                  </Alert>
                );
              }

              const pastSlotsCount = displaySlots.filter((s) => isSlotInPast(appointmentDate, s)).length;
              const allPast = pastSlotsCount === displaySlots.length;

              return (
                <Box>
                  {allPast && (
                    <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px", fontWeight: 600 }}>
                      All available time slots for today have already passed. Please select a future appointment date above.
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    {displaySlots.map((slot) => {
                      const isPast = isSlotInPast(appointmentDate, slot);
                      const isBooked = bookedSlotsList.includes(slot);

                      return (
                        <Grid
                          key={slot}
                          size={{
                            xs: 6,
                            sm: 4,
                            md: 3,
                          }}
                        >
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => {
                              if (isBooked) {
                                setBookedMessage(`Already booked appointment (${slot}). Please select an available slot.`);
                                return;
                              }
                              if (isPast) return;
                              setBookedMessage(null);
                              handleSelectSlot(slot);
                            }}
                            sx={{
                              borderColor: isBooked ? "#FCA5A5" : isPast ? "#E2EDF2" : "#2EBBD9",
                              color: isBooked ? "#DC2626" : isPast ? "#9CA3AF" : "#045E6A",
                              textDecoration: isPast ? "line-through" : "none",
                              opacity: isBooked ? 0.6 : isPast ? 0.55 : 1,
                              fontWeight: 600,
                              backgroundColor: isBooked ? "#FEF2F2" : isPast ? "#F8FAFC" : "#FFFFFF",
                              cursor: isBooked || isPast ? "not-allowed" : "pointer",
                              "&:hover": {
                                borderColor: isBooked ? "#FCA5A5" : isPast ? "#E2EDF2" : "#045E6A",
                                backgroundColor: isBooked ? "#FEE2E2" : isPast ? "#F8FAFC" : "#DDF4F8",
                              },
                            }}
                          >
                            {slot} {isBooked ? " (Booked)" : isPast ? " (Passed)" : ""}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PatientSlotsPage;