import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
      }}
    >
      <Card>
        <CardContent>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            NoSurgeries Dashboard
          </Typography>

          <Typography>
            Welcome,{" "}
            {user?.fullName || user?.email}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
            }}
          >
            Role: {user?.roleName}
          </Typography>

          <Button
            variant="outlined"
            onClick={logout}
            sx={{
              mt: 3,
            }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;