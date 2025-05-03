import { Typography, Box, Card, CardContent, Divider, Grid } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTranslation } from "react-i18next";

const AdditionalInsights = ({ avgQuestionsPerGame, successRate, maxScore, type, maxStreak }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={12}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <EmojiEventsIcon sx={{ color: "warning.main", mr: 1, fontSize: 28 }} />
              <Typography variant="h6">{t("profile.additionalInsights.additionalInsights")}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>

                <Box sx={{ mb: { xs: 2, md: 0 } }}>
                  <Typography variant="body2" color="text.secondary">{t("profile.additionalInsights.avgQuestions")}:</Typography>
                  <Typography variant="h5">{avgQuestionsPerGame.toFixed(1)}</Typography>
                </Box>


              </Grid>

              <Grid item xs={12} md={4}>
                {type !== "suddenDeath" ? (
                  <Box sx={{ mb: { xs: 2, md: 0 } }}>
                    <Typography variant="body2" color="text.secondary">{t("profile.additionalInsights.correctAnswerRate")}:</Typography>
                    <Typography variant="h5">{successRate.toFixed(1)}%</Typography>
                  </Box>
                ) :
                  (<Box sx={{ mb: { xs: 2, md: 0 } }}>
                    <Typography variant="body2" color="text.secondary">{t("profile.additionalInsights.maxStreak")}:</Typography>
                    <Typography variant="h5">{maxStreak}</Typography>
                  </Box>
                  )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">{t("profile.additionalInsights.maxScore")}:</Typography>
                  <Typography variant="h5">{t("profile.additionalInsights.maxScorePoints", { count: maxScore })}</Typography>
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