import { Typography, Box, Paper, Avatar, Button } from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const ProfileHeader = ({ 
  username, 
  profileImage, 
  registrationDate, 
  getMembershipDuration, 
  onOpenSettings 
}) => {
  
  // Format dates
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar
          src={profileImage}
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
        onClick={onOpenSettings}
      >
        Account Settings
      </Button>
    </Paper>
  );
};

export default ProfileHeader;