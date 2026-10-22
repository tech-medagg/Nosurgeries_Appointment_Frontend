import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useEffect, useState } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getDoctorsApi,
} from "../../services/doctor.api";

import type {
  Doctor,
} from "../../types/doctor.types";

const PatientDoctorsPage = () => {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const hospitalId =
    searchParams.get("hospitalId");

  const departmentId =
    searchParams.get(
      "departmentId"
    );

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [loading, setLoading] =
    useState(Boolean(hospitalId && departmentId));

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (
      !hospitalId ||
      !departmentId
    ) {
      return;
    }

    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getDoctorsApi({
            hospitalId,
            departmentId,
            status: "ACTIVE",
          });

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load doctors."
          );
        }

        setDoctors(
          response.data
        );
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        setError(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Unable to load doctors."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [
    hospitalId,
    departmentId,
  ]);

  if (
    !hospitalId ||
    !departmentId
  ) {
    return (
      <Box>
        <Alert severity="warning">
          Hospital and department
          selection are required.
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

  const dateParam = searchParams.get("appointmentDate") || searchParams.get("date");

  const handleSelectDoctor = (
    doctorId: string
  ) => {
    navigate(
      `/patient/slots?hospitalId=${encodeURIComponent(
        hospitalId
      )}&departmentId=${encodeURIComponent(
        departmentId
      )}&doctorProfileId=${encodeURIComponent(
        doctorId
      )}${dateParam ? `&appointmentDate=${encodeURIComponent(dateParam)}` : ""}`
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
              `/patient/departments?hospitalId=${encodeURIComponent(
                hospitalId
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
            Select a Doctor
          </Typography>

          <Typography color="text.secondary">
            Choose an available doctor for
            your appointment.
          </Typography>
        </Box>
      </Box>

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
        doctors.length === 0 && (
          <Alert severity="info">
            No active doctors were found
            for this hospital and
            department.
          </Alert>
        )}

      <Grid container spacing={3}>
        {doctors.map((doctor) => (
          <Grid
            key={doctor.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
                transition: "0.2s",
                "&:hover": {
                  transform:
                    "translateY(-3px)",
                  boxShadow: 5,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    color:
                      "#29C4E0",
                    mb: 2,
                  }}
                >
                  <PersonIcon
                    fontSize="large"
                  />
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Dr.{" "}
                  {doctor.firstName}{" "}
                  {doctor.lastName || ""}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {
                    doctor.specialization
                  }
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {
                    doctor.qualification
                  }
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  Experience:{" "}
                  {
                    doctor.experienceYears
                  }{" "}
                  years
                </Typography>


                <Button
                  variant="contained"
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() =>
                    handleSelectDoctor(
                      doctor.id
                    )
                  }
                >
                  View Available Slots
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PatientDoctorsPage;