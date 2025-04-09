import { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Avatar,
  Divider,
  Button
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';


const VisitorsSection = ({ visitors, totalVisits, getImageUrl }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Show only 5 visitors initially unless expanded
  const displayVisitors = expanded ? visitors : visitors.slice(0, 5);
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VisibilityIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          Profile Visitors
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Total visits: {totalVisits}
        </Typography>
      </Box>
      
      {visitors.length > 0 ? (
        <>
          <List sx={{ width: '100%' }}>
            {displayVisitors.map((visitor, index) => (
              <Box key={`${visitor.username}-${visitor.date}`}>
                <ListItem alignItems="flex-start" sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={getImageUrl(visitor.username)}
                      alt={visitor.username}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box 
                        component="span" 
                        sx={{ 
                          cursor: 'pointer', 
                          color: 'primary.main',
                          "&:hover": { textDecoration: 'underline' } 
                        }}
                        onClick={() => navigate(`/profile/${visitor.username}`)}
                      >
                        {visitor.username}
                      </Box>
                    }
                    secondary={
                      <Typography component="span" variant="body2" color="text.secondary">
                        Visited on {formatDate(new Date(visitor.date), 'MMM d, yyyy h:mm a')}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < displayVisitors.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            ))}
          </List>
          
          {visitors.length > 5 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                variant="text" 
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show Less" : `Show All (${visitors.length})`}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No visitors yet
        </Typography>
      )}
    </Paper>
  );
};

export default VisitorsSection;