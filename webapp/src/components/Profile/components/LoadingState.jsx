import { Typography, Box, CircularProgress } from "@mui/material";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        flexDirection: "column",
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">{message}</Typography>
    </Box>
  );
};

export default LoadingState;