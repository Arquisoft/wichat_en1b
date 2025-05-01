import { useTranslation } from "react-i18next";
import { Grid, Typography, Card, CardContent, Divider } from "@mui/material";
import AnswerDistribution from "../../Profile/components/AnswerDistribution";
import { Navigate, useLocation } from "react-router-dom";

export const GameEndScreen = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const data = location.state?.data;

    if (!data) return <Navigate to="/game-modes" />;

    const getPieChartData = () => {
        return [
            { name: t("profile.answerDistribution.correct"), value: data.correctAnswers },
            { name: t("profile.answerDistribution.incorrect"), value: data.incorrectAnswers }
        ];
    };

    return (
        <>
            <Typography variant="h4" component="h1" align="center" sx={{ mb: 3, fontWeight: 500 }}>
                {t("game.endScreen.title")} 🎲
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>{t("game.endScreen.reportTitle")}</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1" gutterBottom sx={{ fontWeight: 500, fontSize: "1.2rem" }}>
                                💯 {t("statistics.totalScore")}: {data.score}
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ fontWeight: 500, fontSize: "1.2rem" }}>
                                🔢 {t("gameModes.custom.settings.rounds")}: {data.questionsAnswered}
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ fontWeight: 500, fontSize: "1.2rem" }}>
                                ✅ {t("profile.answerDistribution.correct")}: {data.correctAnswers}
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ fontWeight: 500, fontSize: "1.2rem" }}>
                                ❌ {t("profile.answerDistribution.incorrect")}: {data.incorrectAnswers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <AnswerDistribution chartData={getPieChartData()} />
                </Grid>
            </Grid>
        </>
    );
};
