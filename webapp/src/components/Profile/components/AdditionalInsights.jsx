import { Typography, Box, Card, CardContent, Divider, Grid } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const AdditionalInsights = ({ avgQuestionsPerGame, successRate, maxScore }) => {
  return (
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
                  <Typography variant="h5">{avgQuestionsPerGame.toFixed(1)}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: { xs: 2, md: 0 } }}>
                  <Typography variant="body2" color="text.secondary">Correct Answer Rate</Typography>
                  <Typography variant="h5">{successRate.toFixed(1)}%</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Max Score:</Typography>
                  <Typography variant="h5">{maxScore} points</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdditionalInsights;