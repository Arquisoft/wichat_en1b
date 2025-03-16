import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Container, Paper, CircularProgress, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";

// Create a theme (using the same blue primary color)
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

// Function to get the authentication token
const getAuthToken = () => {
  // TODO: Change this with actual logic to get the authentication token
  return localStorage.getItem("authToken");
};

export const StatisticsPage = () => {
  const { user } = useParams(); // Get the user parameter from the URL
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // process.env.REACT_APP_API_ENDPOINT || `http://localhost:8005`;
  const apiEndpoint = `http://localhost:8005`;
  const authToken = getAuthToken();   // Get the authentication token

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get( `${apiEndpoint}/statistics/${user}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
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
  }, [apiEndpoint, user, authToken]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            User Statistics
          </Typography>
          <Typography variant="body1" gutterBottom>
            Here are the statistics for the user: {user}
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