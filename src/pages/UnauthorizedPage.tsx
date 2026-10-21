import {
  Box,
  Typography,
} from "@mui/material";

const UnauthorizedPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
        }}
      >
        403
      </Typography>

      <Typography>
        You don't have permission to access this page.
      </Typography>
    </Box>
  );
};

export default UnauthorizedPage;