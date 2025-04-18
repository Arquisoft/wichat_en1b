import StatisticsSummary from "./StatisticsSummary";
import AnswerDistribution from "./AnswerDistribution";
import AdditionalInsights from "./AdditionalInsights";
import { Grid, Typography } from "@mui/material";

export const Insights = ({statistics, registrationDate, title}) => {

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

    //Prepare chart data
    const getPieChartData = () => {
        if (!statistics) return [];
        return [
            { name: 'Correct', value: statistics.correctAnswers },
            { name: 'Incorrect', value: statistics.incorrectAnswers }
        ];
    };
    return (
        <>
            <Typography variant="h4" component="h1" align="center" sx={{ mb: 3, fontWeight: 500 }}>
                {title}
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <StatisticsSummary
                        statistics={statistics}
                        successRate={getSuccessRate(statistics)}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <AnswerDistribution chartData={getPieChartData(statistics)} />
                </Grid>
            </Grid>

            <AdditionalInsights
                avgQuestionsPerGame={getAverageQuestionsPerGame(statistics)}
                successRate={getSuccessRate(statistics)}
                maxScore={statistics.maxScore || 0}
            />
        </>
    )
}