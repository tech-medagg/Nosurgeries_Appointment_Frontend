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

import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getHospitalsApi,
} from "../../services/hospital.api";

import type {
  Hospital,
} from "../../types/hospital.types";

const PatientHospitalsPage = () => {
  const navigate = useNavigate();

  const [hospitals, setHospitals] =
    useState<Hospital[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getHospitalsApi({
            search: search || undefined,
          });

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load hospitals."
          );
        }

        setHospitals(
          response.data
        );
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        setError(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Unable to load hospitals."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, [search]);

  const handleSelectHospital = (
    hospitalId: string
  ) => {
    navigate(
      `/patient/departments?hospitalId=${encodeURIComponent(
        hospitalId
      )}`
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Select a Hospital
        </Typography>

        <Typography color="text.secondary">
          Choose a hospital to continue
          booking your appointment.
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Search hospitals"
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        sx={{ mb: 4 }}
      />

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
        hospitals.length === 0 && (
          <Alert severity="info">
            No hospitals are currently
            available.
          </Alert>
        )}

      <Grid container spacing={3}>
        {hospitals.map((hospital) => (
          <Grid
            key={hospital.id}
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
                  <LocalHospitalIcon
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
                  {hospital.name}
                </Typography>

                {hospital.address && (
                  <Typography
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {hospital.address}
                  </Typography>
                )}

                {(hospital.city ||
                  hospital.state) && (
                  <Typography
                    color="text.secondary"
                  >
                    {[
                      hospital.city,
                      hospital.state,
                      hospital.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() =>
                    handleSelectHospital(
                      hospital.id
                    )
                  }
                >
                  Select Hospital
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PatientHospitalsPage;