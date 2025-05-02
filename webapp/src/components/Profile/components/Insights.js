import StatisticsSummary from "./StatisticsSummary";
import AnswerDistribution from "./AnswerDistribution";
import AdditionalInsights from "./AdditionalInsights";
import { Grid, Typography } from "@mui/material";

export const Insights = ({statistics, registrationDate, title, type}) => {

    console.log("Insights: statistics", statistics);
    const getSuccessRate = () => {
        if (!statistics) return 0;
        const total = statistics.correctAnswers + statistics.incorrectAnswers;
        return total > 0 ? (statistics.correctAnswers / total) * 100 : 0;
    };

    const getAverageQuestionsPerGame = () => {
        if (!statistics || statistics.gamesPlayed === 0) return 0;
        return statistics.questionsAnswered / statistics.gamesPlayed;
    };

    //Prepare chart data
    const getPieChartData = () => {
        if (!statistics) return [];
        return [
            { name: "Correct Answers", value: statistics.correctAnswers },
            { name: "Incorrect Answers", value: statistics.incorrectAnswers }
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
                        successRate={getSuccessRate()}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <AnswerDistribution chartData={getPieChartData()} />
                </Grid>
            </Grid>

            <AdditionalInsights
                avgQuestionsPerGame={getAverageQuestionsPerGame()}
                successRate={getSuccessRate()}
                maxScore={statistics.maxScore || 0}
                type={type}
                maxStreak={statistics.maxCorrectAnswers || 0}
            />
        </>
    )
}