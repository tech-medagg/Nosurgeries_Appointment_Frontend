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

import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getDepartmentsApi,
} from "../../services/department.api";

import type {
  Department,
} from "../../types/department.types";

const PatientDepartmentsPage = () => {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const hospitalId =
    searchParams.get("hospitalId");

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getDepartmentsApi();

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load departments."
          );
        }

        setDepartments(
          response.data
        );
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        setError(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Unable to load departments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  if (!hospitalId) {
    return (
      <Box>
        <Alert severity="warning">
          Please select a hospital first.
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
          Select Hospital
        </Button>
      </Box>
    );
  }

  const handleSelectDepartment = (
    departmentId: string
  ) => {
    navigate(
      `/patient/doctors?hospitalId=${encodeURIComponent(
        hospitalId
      )}&departmentId=${encodeURIComponent(
        departmentId
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
              "/patient/hospitals"
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
            Select a Department
          </Typography>

          <Typography color="text.secondary">
            Choose the department for your
            appointment.
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
        departments.length === 0 && (
          <Alert severity="info">
            No departments are currently
            available.
          </Alert>
        )}

      <Grid container spacing={3}>
        {departments.map(
          (department) => (
            <Grid
              key={department.id}
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
                    {department.name}
                  </Typography>

                  {department.description && (
                    <Typography
                      color="text.secondary"
                    >
                      {
                        department.description
                      }
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
                      handleSelectDepartment(
                        department.id
                      )
                    }
                  >
                    Select Department
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>
    </Box>
  );
};

export default PatientDepartmentsPage;