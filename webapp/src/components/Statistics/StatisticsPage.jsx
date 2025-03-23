import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, Container, Paper, CircularProgress, Grid, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Cookies from "js-cookie";
import RecordRetriever from "./RecordRetriever";

const retriever = new RecordRetriever();

// Create a theme (using the same blue primary color)
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

export const StatisticsPage = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    // Remove the user cookie securely
    Cookies.remove('user', { path: '/' }); // Ensure the cookie is removed from the correct path
    navigate('/login');
  };

  // Use useEffect to fetch data only once when component mounts
  useEffect(() => {
    const getRecords = async () => {
      try {
        // Check if user cookie exists
        const userCookie = Cookies.get('user');
        if (!userCookie) {
          console.error("No user cookie found");
          setError("You are not logged in. Please log in to view your statistics.");
          setLoading(false);
          return;
        }

        // Parse the cookie and handle potential errors
        let cookie;
        try {
          cookie = JSON.parse(userCookie);
          console.log("User cookie found:", cookie.username);

          // Log token for debugging (remove in production)
          console.log("Token first 10 chars:", cookie.token.substring(0, 10) + "...");
        } catch (e) {
          console.error("Error parsing user cookie:", e);
          setError("Invalid user data. Please log in again.");
          setLoading(false);
          return;
        }

        // Verify we have the required cookie data
        if (!cookie.username || !cookie.token) {
          console.error("Missing required user data in cookie");
          setError("Missing user credentials. Please log in again.");
          setLoading(false);
          return;
        }

        // Try to get the statistics
        const statsData = await retriever.getRecords(cookie.token);
        setStatistics(statsData);
        setLoading(false);
      } catch (error) {
        console.error("Error in getRecords:", error);

        // Check if it's an authentication error
        if (error.message &&
          (error.message.includes("expired") ||
            error.message.includes("Invalid token") ||
            error.message.includes("log in again"))) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(error.message || "Failed to load statistics");
        }

        setLoading(false);
      }
    };

    getRecords();
  }, []); // Empty dependency array means this runs once on mount

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const getRecords = async () => {
      try {
        const userCookie = Cookies.get('user');
        if (!userCookie) {
          navigate('/login');
          return;
        }

        const cookie = JSON.parse(userCookie);
        const statsData = await retriever.getRecords(cookie.token);
        setStatistics(statsData);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Failed to load statistics");
        setLoading(false);
      }
    };

    getRecords();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            User Statistics
          </Typography>
          <Typography variant="body1" gutterBottom>
            Here are your statistics:
          </Typography>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="error" gutterBottom>
                {error}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRetry}
                >
                  Retry
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                >
                  Log In Again
                </Button>
              </Box>
            </Box>
          ) : statistics ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6">Games Played</Typography>
                  <Typography variant="body1">{statistics.gamesPlayed}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6">Correct Answers</Typography>
                  <Typography variant="body1">{statistics.correctAnswers}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6">Incorrect Answers</Typography>
                  <Typography variant="body1">{statistics.incorrectAnswers}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6">Success Rate</Typography>
                  <Typography variant="body1">
                    {statistics.correctAnswers + statistics.incorrectAnswers > 0
                      ? ((statistics.correctAnswers / (statistics.correctAnswers + statistics.incorrectAnswers)) * 100).toFixed(1) + '%'
                      : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body1">No statistics available.</Typography>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};