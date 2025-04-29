import { Typography, Box, Paper, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const ErrorState = ({ error, onRetry, onLogout }) => {
  const { t } = useTranslation();

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
          {t("profile.errorStates.retry")}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={onLogout}
        >
          {t("profile.errorStates.goBackToMenu")}
        </Button>
      </Box>
    </Paper>
  );
};

export default ErrorState;