import { Typography, Box, Card, CardContent, Divider, LinearProgress, Grid, Paper } from "@mui/material";

const StatisticsSummary = ({ statistics, successRate }) => {
  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Performance Summary</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="body2">Success Rate</Typography>
            <Typography variant="body2" fontWeight="bold">
              {successRate.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={successRate} 
            color={successRate > 75 ? "success" : successRate > 50 ? "primary" : "warning"}
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
  );
};

export default StatisticsSummary;