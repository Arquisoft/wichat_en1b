import { Typography, Box, Avatar, Button, Chip } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

const ProfileHeader = ({ 
  username, 
  profileImage, 
  registrationDate, 
  getMembershipDuration,
  onOpenSettings,
  isOwnProfile
}) => {

  const { t, i18n } = useTranslation();
  
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: 'center', 
        mb: 4,
        position: 'relative',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <Avatar 
        src={profileImage} 
        alt={username} 
        sx={{ 
          width: 120, 
          height: 120, 
          mb: { xs: 2, sm: 0 }, 
          mr: { sm: 4 }
        }}
      />
      
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {username}
          </Typography>
          
          {/* Only show if viewing own profile */}
          {isOwnProfile && (
            <Chip 
              label="You" 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </Box>
        
        {registrationDate && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            {t("profile.header.since", { date: formatDate(registrationDate, 'MMMM d, yyyy') })}
          </Typography>
        )}
        
        <Typography variant="body2" color="text.secondary">
          {t("profile.header.membershipDays", { count: getMembershipDuration() })}
        </Typography>
      </Box>
      
      {/* Only render settings button if onOpenSettings is provided */}
      {onOpenSettings && (
        <Button 
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={onOpenSettings}
          sx={{ 
            position: { sm: 'absolute' }, 
            right: { sm: 16 }, 
            top: { sm: 16 },
            mt: { xs: 2, sm: 0 }
          }}
        >
          {t("profile.header.settings")}
        </Button>
      )}
    </Box>
  );
};

export default ProfileHeader;