import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, Container, Paper, CircularProgress, Grid } from "@mui/material";
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

  // Use useEffect to fetch data only once when component mounts
  useEffect(() => {
    const getRecords = async () => {
      try {
        // Add error handling for missing or malformed cookie
        const userCookie = Cookies.get('user');
        if (!userCookie) {
          setError("User not logged in");
          setLoading(false);
          return;
        }
        
        let cookie;
        try {
          cookie = JSON.parse(userCookie);
        } catch (e) {
          setError("Invalid user data");
          setLoading(false);
          return;
        }
        
        const statsData = await retriever.getRecords(cookie.username, cookie.token);
        setStatistics(statsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setError(error.message || "Failed to load statistics");
        setLoading(false);
      }
    };
  
    getRecords();
  }, []); // Empty dependency array means this runs once on mount

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