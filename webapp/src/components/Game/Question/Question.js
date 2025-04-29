import { useState, useEffect } from "react";
import { Typography, Box, Grid, Button, Container, Paper, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from 'axios';
import { useGame } from "../GameContext";
import StatisticsUpdater from "../components/StatisticsUpdater";

// Create a theme
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
});

const defaultStatisticsUpdater = new StatisticsUpdater('classical');

export const Question = () => {
    const { question, setQuestion, setGameEnded, questionType, setQuestionType, AIAttempts, setAIAttempts, setMaxAIAttempts, statisticsUpdater, gameMode } = useGame();
    const gatewayEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [totalTime, setTotalTime] = useState(60);
    const [maxRounds, setMaxRounds] = useState(10);
    const [round, setRound] = useState(1);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [score, setScore] = useState(0);
    const [currentScore, setCurrentScore] = useState(0);
    const [streak, setStreak] = useState(0);

    const [customSettings] = useState(() => {
        return JSON.parse(localStorage.getItem('customSettings')) || {
            rounds: 5,
            timePerQuestion: 30,
            aiAttempts: 3,
        };
    });

    useEffect(() => {
        // Set topic on first load
        const storedTopic = localStorage.getItem("topic") || "random";
        setQuestionType(storedTopic);
    }, [setQuestionType]);

    useEffect(() => {
        if (gameMode === 'custom') {
            setMaxRounds(customSettings.rounds);
            setTotalTime(customSettings.timePerQuestion);
            setMaxAIAttempts(customSettings.aiAttempts);
        } else {
            setMaxRounds(10);
            setTotalTime(60);
            setMaxAIAttempts(3);
        }
    }, [gameMode, customSettings, setMaxAIAttempts]);

    const progressPercentage = (timeLeft / totalTime) * 100;

    useEffect(() => {
        if (timeLeft <= 0 && !isTimeUp) {
            setIsTimeUp(true);
            setTimeout(() => {
                requestQuestion(false).finally(() => {
                    setIsTimeUp(false);
                });
            }, 2000);
            return;
        }

        if (isPaused || isTimeUp) return;

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, isPaused, isTimeUp]);

    const requestQuestion = async (isInitialLoad = false) => {
        setIsPaused(true);
        try {
            const { data } = await axios.get(`${gatewayEndpoint}/question/${questionType}`);
            setQuestion(data);

            if (isInitialLoad) {
                statisticsUpdater.newGame();
            }
        } catch (error) {
            console.error("Error fetching question:", error);
        }
        setImagesLoaded(false);
    };

    useEffect(() => {
        requestQuestion(true);
    }, [questionType]);

    useEffect(() => {
        if (question.images?.length) {
            const imagePromises = question.images.map(src => {
                return new Promise(resolve => {
                    const img = new Image();
                    img.src = src;
                    img.onload = resolve;
                });
            });

            Promise.all(imagePromises).then(() => {
                setImagesLoaded(true);
                setTimeLeft(totalTime);
                setSelectedAnswer(null);
                setIsPaused(false);
            });
        }
    }, [question.images, totalTime]);

    const handleAnswerSelect = async (answer) => {
        if (selectedAnswer || isCorrect || isIncorrect || isTimeUp) return;

        setSelectedAnswer(answer);
        setIsPaused(true);

        try {
            const { data } = await axios.post(`${gatewayEndpoint}/answer`, { questionId: question.id, answer });

            if (data.correct) {
                const newScore = Math.max(0, Math.floor(1000 - ((totalTime - timeLeft) * 600 / totalTime) - AIAttempts * 100 + getStreakBonus()));
                setScore(newScore);
                setCurrentScore(prev => prev + newScore);
                setStreak(prev => prev + 1);

                statisticsUpdater.recordCorrectAnswer(newScore);
                setIsCorrect(true);
            } else {
                statisticsUpdater.recordIncorrectAnswer();
                setStreak(0);
                setIsIncorrect(true);
            }

            setAIAttempts(0);

            if (round === maxRounds) {
                setGameEnded(true);
                setIsGameEnded(true);

                try {
                    await statisticsUpdater.endGame();
                } catch (error) {
                    console.error("Error ending game:", error.message);
                }

                setTimeout(() => {
                    statisticsUpdater.newGame();
                    resetGame();
                }, 2000);
            } else {
                setRound(prev => prev + 1);
                setTimeout(() => {
                    setIsCorrect(false);
                    setIsIncorrect(false);
                    requestQuestion(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Error checking answer:", error);
        }
    };

    const resetGame = () => {
        setRound(1);
        setCurrentScore(0);
        setScore(0);
        setStreak(0);
        setIsGameEnded(false);
        setSelectedAnswer(null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getStreakBonus = () => {
        if (streak < 3) return 0;
        return 50 + 15 * (streak - 3);
    };


    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <p>{gameMode}</p>
                {/* Game title */}
                <Typography variant="h4" component="h1" align="center" sx={{ mb: 3, fontWeight: 500 }}>
                    {gameMode === 'custom' ? "Custom Game 🎨" :
                        gameMode === 'suddenDeath' ? "Sudden Death ☠️" :
                            gameMode === 'classical' ? "Classical Game 🎲" :
                                gameMode === 'timeTrial' ? "Time Trial ⏱️" :
                                    "Question of the Day 📅"}
                </Typography>
                {/* Round counter */}
                <Typography variant="p" component="p" align="center" sx={{ my: 3, fontWeight: 500 }}>
                    {round} / {maxRounds} {streak >= 3 && (
                        <Typography variant="span" component="span" align="center" sx={{ my: 3, fontWeight: 500, color: "red" }}>
                            {streak} 🔥
                        </Typography>
                    )
                    }
                </Typography>
                {/* Large Timer at the top */}
                <Box sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" }, // Column for mobile, row for larger screens
                    justifyContent: "center",
                    alignItems: "center", // Align items vertically
                    mb: 3,
                    gap: { xs: 1, sm: 2 }, // Smaller gap for mobile, larger for larger screens
                }}>
                    {/* Timer with circular progress bar */}
                    <Paper
                        elevation={3}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "12px 24px",
                            borderRadius: "24px",
                            backgroundColor: timeLeft <= 10 ? "#ffebee" : "white",
                            border: timeLeft <= 10 ? "2px solid #f44336" : "1px solid #e0e0e0",
                            width: { xs: "80%", sm: "30%" }
                        }}
                    >
                        <Box sx={{ position: "relative", display: "inline-flex", mr: 2 }}>
                            <CircularProgress
                                variant="determinate"
                                value={progressPercentage}
                                size={60}
                                thickness={4}
                                color={timeLeft <= 10 ? "error" : "primary"}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: "absolute",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <AccessTimeIcon fontSize="medium" color={timeLeft <= 10 ? "error" : "primary"} />
                            </Box>
                        </Box>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                fontWeight: "bold",
                                color: timeLeft <= 10 ? "error.main" : "text.primary",
                            }}
                        >
                            {formatTime(timeLeft)}
                        </Typography>
                    </Paper>
                    <Paper
                        elevation={3}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "12px 24px",
                            borderRadius: "24px",
                            backgroundColor: "white",
                            border: "1px solid #e0e0e0",
                            width: { xs: "80%", sm: "30%" }
                        }}
                    >
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                fontWeight: "bold",
                                color: "text.primary",
                                textAlign: "center",
                                width: "100%",
                            }}
                        >
                            Score: {currentScore}
                        </Typography>
                    </Paper>
                </Box>

                <Typography variant="h5" component="h2" align="center" sx={{ my: 3, fontWeight: 500 }}>
                    {question.question}
                </Typography>

                {isCorrect && (
                    <Typography variant="h6" component="p" align="center" sx={{ my: 2, color: "green" }}>
                        Correct! +{score} points
                    </Typography>
                )}

                {isIncorrect && (
                    <Typography variant="h6" component="p" align="center" sx={{ my: 2, color: "red" }}>
                        Incorrect
                    </Typography>
                )}

                {isTimeUp && (
                    <Typography variant="h6" component="p" align="center" sx={{ my: 2, color: "red" }}>
                        You ran out of time!
                    </Typography>
                )}
                <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
                    <Grid container spacing={2}>
                        {imagesLoaded ? (
                            question.images?.map((image, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Button
                                        fullWidth
                                        variant={selectedAnswer === image ? "contained" : "outlined"}
                                        color="primary"
                                        onClick={() => handleAnswerSelect(image)}
                                        sx={{
                                            py: 1.5,
                                            textTransform: "none",
                                            justifyContent: "center",
                                            backgroundColor: selectedAnswer === image && isCorrect ? "green" : selectedAnswer === image && isIncorrect ? "red" : undefined,
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={image || "/placeholder.svg"}
                                            alt="Game Question"
                                            sx={{
                                                width: "100%",
                                                height: "150px",
                                                objectFit: "cover",
                                                borderRadius: "4px",
                                            }}
                                        />
                                    </Button>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="h6" component="p" align="center" sx={{ my: 2 }}>
                                Loading images...
                            </Typography>
                        )}
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    )
}