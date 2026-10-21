import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getAppointmentByIdApi,
} from "../../services/appointment.api";

import type {
  Appointment,
} from "../../types/appointment.types";

const PatientBookingConfirmationPage =
  () => {
    const navigate =
      useNavigate();

    const { id } =
      useParams<{
        id: string;
      }>();

    const [
      appointment,
      setAppointment,
    ] =
      useState<Appointment | null>(
        null
      );

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState("");

    useEffect(() => {
      const loadAppointment =
        async () => {
          if (!id) {
            setError(
              "Appointment ID is missing."
            );
            setLoading(false);
            return;
          }

          try {
            const response =
              await getAppointmentByIdApi(
                id
              );

            if (!response.success) {
              throw new Error(
                response.message ||
                  "Appointment not found."
              );
            }

            setAppointment(
              response.data
            );
          } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(
              errorObj?.response?.data?.message ||
                errorObj?.message ||
                "Unable to load appointment."
            );
          } finally {
            setLoading(false);
          }
        };

      loadAppointment();
    }, [id]);

    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box>
          <Alert severity="error">
            {error}
          </Alert>

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() =>
              navigate(
                "/patient"
              )
            }
          >
            Back to Dashboard
          </Button>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          maxWidth: 700,
          mx: "auto",
        }}
      >
        <Card>
          <CardContent
            sx={{
              p: 5,
              textAlign: "center",
            }}
          >
            <CheckCircleIcon
              color="success"
              sx={{
                fontSize: 72,
                mb: 2,
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              Appointment Booked
              Successfully
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Your appointment request has
              been created successfully.
            </Typography>

            {appointment && (
              <Stack
                spacing={2}
                sx={{
                  textAlign: "left",
                  mb: 4,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Appointment ID
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      wordBreak:
                        "break-all",
                    }}
                  >
                    {appointment.id}
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Date
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {
                        appointment.appointmentDate
                      }
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Time
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {
                        appointment.appointmentTime
                      }
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Status
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {
                      appointment.status
                    }
                  </Typography>
                </Box>
              </Stack>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() =>
                navigate(
                  "/patient"
                )
              }
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  };

export default PatientBookingConfirmationPage;