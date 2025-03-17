import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, Container, Paper, CircularProgress, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Cookies from "js-cookie";

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

  // TODO check env file to use: process.env.REACT_APP_API_ENDPOINT || "http://localhost:8005/statistics";
  const apiEndpoint = "http://localhost:8005/statistics";

  // Function to get the authentication token from cookies
  const getAuthToken = async () => {
    try {
      const cookie = Cookies.get('user');
      if (!cookie) {
        throw new Error("No user cookie found");
      }

      const parsedCookie = JSON.parse(cookie);
      const user = parsedCookie.username;
      const token = parsedCookie.token;

      try {
        const response = await axios.get(`http://localhost:8005/statistics/${user}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true
        });
        const receivedRecords = response.data;
        return receivedRecords.record;
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setError("Error fetching statistics");
      }
    } catch (error) {
      console.error("Error getting the authenticated user:", error);
      setError("Error getting the authenticated user");
    }
  };

  useEffect(() => {
    const fetchStatistics = async () => {

      try {
        const authToken = await getAuthToken(); // Get the authentication token

        if (!authToken) {
          navigate('/login'); // Redirect to login if the user is not logged in
          return;
        }

        const response = await axios.get(apiEndpoint, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          withCredentials: true, // Ensure cookies are sent with the request
        });
        setStatistics(response.data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Error fetching statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [apiEndpoint, navigate]);

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
            <Typography variant="h6" color="error" align="center">
              {error}
            </Typography>
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
            </Grid>
          ) : (
            <Typography variant="body1">No statistics available.</Typography>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};