import { Typography, Box, Paper, Button } from "@mui/material";

const ErrorState = ({ error, onRetry, onLogout }) => {
  return (
    <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h5" color="error" gutterBottom>
        {error}
      </Typography>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onRetry}
        >
          Retry
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={onLogout}
        >
          Log In Again
        </Button>
      </Box>
    </Paper>
  );
};

export default ErrorState;