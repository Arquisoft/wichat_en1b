import { Typography, Box, Card, CardContent, Divider, LinearProgress, Grid, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

const StatisticsSummary = ({ statistics, successRate }) => {
  const { t } = useTranslation();
  
  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{t("profile.summary.performance")}</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="body2">{t("profile.summary.successRate")}</Typography>
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
              <Typography variant="body2">{t("profile.summary.gamesPlayed")}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: "primary.light", color: "white" }}>
              <Typography variant="h6">{statistics.questionsAnswered}</Typography>
              <Typography variant="body2">{t("profile.summary.questionsAnswered")}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: "success.main", color: "white" }}>
              <Typography variant="h6">{statistics.correctAnswers}</Typography>
              <Typography variant="body2">{t("profile.summary.correctAnswers")}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: "warning.main", color: "white" }}>
              <Typography variant="h6">{statistics.incorrectAnswers}</Typography>
              <Typography variant="body2">{t("profile.summary.incorrectAnswers")}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StatisticsSummary;