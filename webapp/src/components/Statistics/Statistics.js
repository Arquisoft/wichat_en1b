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

export const Statistics = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [registrationDate, setRegistrationDate] = useState(null);
  
  const handleLogout = () => {
    Cookies.remove('user', { path: '/' });
    navigate('/login');
  };

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

  const getSuccessRate = () => {
    if (!statistics) return 0;
    const total = statistics.correctAnswers + statistics.incorrectAnswers;
    return total > 0 ? (statistics.correctAnswers / total) * 100 : 0;
  };

  const getMembershipDuration = () => {
    if (!registrationDate) return "N/A";
    const now = new Date();
    const diffTime = Math.abs(now - registrationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

};