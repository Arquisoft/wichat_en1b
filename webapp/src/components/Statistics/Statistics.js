import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Typography, Box, Container, Paper, CircularProgress, Grid, Button,
  Card, CardContent, Divider, LinearProgress, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Cookies from "js-cookie";
import RecordRetriever from "./RecordRetriever";
import UserProfileSettings from "../Profile/UserProfileSettings";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend
} from "recharts";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const retriever = new RecordRetriever();
const userProfileSettings = new UserProfileSettings();

// Enhanced theme with more color options
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#4791db",
      dark: "#115293",
    },
    secondary: {
      main: "#f50057",
    },
    success: {
      main: "#4caf50",
    },
    warning: {
      main: "#ff9800",
    },
    error: {
      main: "#f44336",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Colors for charts
const CHART_COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

export const Statistics = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [registrationDate, setRegistrationDate] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [DEFAULT_IMAGES, setDefaultImages] = useState([]);

  const handleLogout = () => {
    Cookies.remove('user', { path: '/' });
    navigate('/login');
  };

  const handleProfileImageChange = async (event) => {
      await userProfileSettings.changeCustomProfileImage(username, Cookies.get('user'), event.target.files[0]);
      setProfileImage(`${REACT_APP_API_ENDPOINT}/users/${username}/image?timestamp=${Date.now()}`);
  };

  const handleDefaultImageSelect = async (image) => {
    await userProfileSettings.changeDefaultProfileImage(username, Cookies.get('user'), image.split('/').pop());
    setProfileImage(`${REACT_APP_API_ENDPOINT}/users/${username}/image?timestamp=${Date.now()}`);
  };

  const handleOpenSettings = () => setSettingsOpen(true);
  const handleCloseSettings = () => setSettingsOpen(false);

  useEffect(() => {
    const getRecords = async () => {
      try {
        const { statsData, username } = await retriever.getRecords();
        setStatistics(statsData);

        setUsername(username || "User");

        // Set registration date if available
        if (statsData.registrationDate) {
          setRegistrationDate(new Date(statsData.registrationDate));
        }

        // Force image refresh when loading initially
        const initialImageUrl = `${REACT_APP_API_ENDPOINT}/users/${username}/image?timestamp=${Date.now()}`;
        setProfileImage(initialImageUrl);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Failed to load statistics");
        setLoading(false);
      }
    };

    getRecords();
  }, []);

  useEffect(() => {
    const fetchDefaultImages = async () => {
      try {
        const images = [];
        for (let i = 1; i <= 16; i++) {
          images.push(`${REACT_APP_API_ENDPOINT}/default-images/image_${i}.png`);
        }
        setDefaultImages(images);
      } catch (error) {}
    };

    fetchDefaultImages();
  }, []);

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
        const statsData = await retriever.getRecords();
        setStatistics(statsData);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Failed to load statistics");
        setLoading(false);
      }
    };

    getRecords();
  };

  // Prepare chart data
  const getPieChartData = () => {
    if (!statistics) return [];
    return [
      { name: 'Correct', value: statistics.correctAnswers },
      { name: 'Incorrect', value: statistics.incorrectAnswers }
    ];
  };

  // Calculate derived statistics
  const getSuccessRate = () => {
    if (!statistics) return 0;
    const total = statistics.correctAnswers + statistics.incorrectAnswers;
    return total > 0 ? (statistics.correctAnswers / total) * 100 : 0;
  };

  const getAverageQuestionsPerGame = () => {
    if (!statistics || statistics.gamesPlayed === 0) return 0;
    return statistics.questionsAnswered / statistics.gamesPlayed;
  };

  const getMembershipDuration = () => {
    if (!registrationDate) return "N/A";
    const now = new Date();
    const diffTime = Math.abs(now - registrationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format dates
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const AccountSettingsDialog = () => (
    <Dialog open={settingsOpen} onClose={handleCloseSettings} maxWidth="sm" fullWidth>
      <DialogTitle>Account Settings</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Manage your account settings below:
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ mb: 2 }}
        >
          Upload Profile Picture
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileImageChange}
          />
        </Button>
        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>Or select a default image:</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(48px, 1fr))", gap: 2 }}>
          {DEFAULT_IMAGES.map((image, index) => (
            <Avatar
              key={index}
              src={image}
              alt={`Default avatar ${index + 1}`}
              sx={{
                width: "100%",
                height: "auto",
                cursor: "pointer",
              }}
              onClick={() => handleDefaultImageSelect(image)}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseSettings} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
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
            <Typography variant="h6">Loading your statistics...</Typography>
          </Box>
        ) : error ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error}
            </Typography>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleRetry}
              >
                Retry
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleLogout}
              >
                Log In Again
              </Button>
            </Box>
          </Paper>
        ) : statistics ? (
          <>
            {/* User Profile Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={profileImage} // Ensure the updated profileImage is used
                  alt={`${username}'s profile picture`}
                  sx={{ width: 64, height: 64, bgcolor: "primary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4">{username}'s Statistics</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      Member since {formatDate(registrationDate)} ({getMembershipDuration()} days)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenSettings}
              >
                Account Settings
              </Button>
            </Paper>
            <AccountSettingsDialog />

            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Performance Summary</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">Success Rate</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {getSuccessRate().toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getSuccessRate()} 
                        color={getSuccessRate() > 75 ? "success" : getSuccessRate() > 50 ? "primary" : "warning"}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
                          <Typography variant="h6">{statistics.gamesPlayed}</Typography>
                          <Typography variant="body2">Games Played</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: "primary.light", color: "white" }}>
                          <Typography variant="h6">{statistics.questionsAnswered}</Typography>
                          <Typography variant="body2">Questions Answered</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: "success.main", color: "white" }}>
                          <Typography variant="h6">{statistics.correctAnswers}</Typography>
                          <Typography variant="body2">Correct Answers</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: "warning.main", color: "white" }}>
                          <Typography variant="h6">{statistics.incorrectAnswers}</Typography>
                          <Typography variant="body2">Incorrect Answers</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Answer Distribution</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getPieChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS[1] : CHART_COLORS[3]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => value} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Additional Insights - Fixed Grid Structure */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <EmojiEventsIcon sx={{ color: "warning.main", mr: 1, fontSize: 28 }} />
                      <Typography variant="h6">Additional Insights</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ mb: { xs: 2, md: 0 } }}>
                          <Typography variant="body2" color="text.secondary">Avg. Questions Per Game</Typography>
                          <Typography variant="h5">{getAverageQuestionsPerGame().toFixed(1)}</Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ mb: { xs: 2, md: 0 } }}>
                          <Typography variant="body2" color="text.secondary">Correct Answer Rate</Typography>
                          <Typography variant="h5">{getSuccessRate().toFixed(1)}%</Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Member For</Typography>
                          <Typography variant="h5">{getMembershipDuration()} days</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Actions */}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/')}
                sx={{ mr: 2 }}
              >
                Back to menu
              </Button>
            </Box>
          </>
        ) : (
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">No statistics available.</Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/')}
            >
              Back to menu
            </Button>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
};