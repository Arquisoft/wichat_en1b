import { useState, useEffect } from "react";
import { Typography, Box, Grid, Button, Container, Paper, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from 'axios';
import { useGame } from "../GameContext";
import { useTranslation } from "react-i18next"


// Create a theme with the blue color from the login screen
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
});


export const Question = () => {
    const { question, setQuestion, setGameEnded, questionType, setQuestionType, 
        AIAttempts, setAIAttempts, setMaxAIAttempts, 
        statisticsUpdater, gameMode,  round, nextRound, resetRounds, isGameEnded,
        timeLeft, isRunning, startTimer, pauseTimer, resetTimer, strategy, initialTime } = useGame();
    console.log("Question: strategy: ", strategy)
    const gatewayEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [totalTime, setTotalTime] = useState(initialTime); // Set initial time based on the strategy
    console.log("Question: totalTime", totalTime);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [streak, setStreak] = useState(0); // Track the streak of correct answers
    const [score, setScore] = useState(0); // Track the score
    const [currentScore, setCurrentScore] = useState(0); // Track the current score
    const [t, i18n] = useTranslation(); // Initialize i18next for translations

    const topic = localStorage.getItem("topic") || "random"; // Default to "random" if not set
    setQuestionType(topic); // Set the question type based on the topic


    useEffect(() => {
        resetTimer();
        pauseTimer();
        const fetchInitialQuesiton = async () => {
            await requestQuestion(true); // Pass true to indicate it's the initial load
            startTimer(); // Start the timer after fetching the question
        }
        fetchInitialQuesiton();
    }, [gameMode, setMaxAIAttempts]);

    const progressPercentage = (timeLeft / totalTime) * 100;


    const requestQuestion = async (isInitialLoad = false) => {
        pauseTimer(); // Stop the timer before fetching a new question
        try {
            let questionResponse = await axios.get(`${gatewayEndpoint}/question/${questionType}`);
            setQuestion(questionResponse.data);

            if (isInitialLoad) {
                statisticsUpdater.newGame();
            }
        } catch (error) {
            console.error("Error fetching question: ", error)
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
                setSelectedAnswer(null);
                startTimer(); // <-- Start context timer
            });
        }
    }, [question.images]);

    useEffect(() => {
        if (timeLeft === 0) {
            setIsTimeUp(true);
            pauseTimer();
            setTimeout(() => {
                requestQuestion(false).finally(() => {
                    setIsTimeUp(false);
                    resetTimer();
                    startTimer();
                });
            }, 2000);
        }
    }, [timeLeft]);
    
    

    const handleAnswerSelect = async (answer) => {
        if (selectedAnswer || isCorrect || isIncorrect || isTimeUp) return;

        setSelectedAnswer(answer);
        pauseTimer(); // Pause the timer when an answer is selected

        try {
            console.log("Question: handleAnswerSelect: ", answer);
            console.log("Question: handleAnswerSelect: question: ", question);
            console.log("Question: handleAnswerSelect: question.id: ", question.id);
            let response = await axios.post(`${gatewayEndpoint}/answer`, { questionId: question.id, answer: answer });

            if (response.data.correct) {
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

            if (isGameEnded()) {
                setGameEnded(true);
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
                nextRound();
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
        resetRounds();             // From useGame context
        resetTimer();              // Reset the timer to initial value
        setCurrentScore(0);
        setScore(0);
        setStreak(0);
        setSelectedAnswer(null);
        setGameEnded(false);       // From useGame context
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

    useEffect(() => {
        const updatedQuestionText = t("game.question", {
            imageType: t(question.imageType),
            relation: t(question.relation),
            topic: question.topic,
        });
        setQuestion((prev) => ({
            ...prev,
            question: updatedQuestionText,
        }));
    }, [i18n.language]);

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Game title */}
                <Typography variant="h4" component="h1" align="center" sx={{ mb: 3, fontWeight: 500 }}>
                    {gameMode === 'custom' ? t("game.modes.custom") :
                        gameMode === 'suddenDeath' ? t("game.modes.suddenDeath") :
                            gameMode === 'classical' ? t("game.modes.classical") :
                                gameMode === 'timeTrial' ? t("game.modes.timeTrial") :
                                    t("game.modes.QOD")}
                </Typography>
                {/* Round counter */}
                <Typography variant="p" component="p" align="center" sx={{ my: 3, fontWeight: 500 }}>
                    {round} {strategy.maxRounds != Infinity ? `/ ${strategy.maxRounds}` : ""} 
                    {streak >= 3 && (
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
                            {t("game.score", { score: currentScore })}
                        </Typography>
                    </Paper>
                </Box>

                <Typography variant="h5" component="h2" align="center" sx={{ my: 3, fontWeight: 500 }}>
                    {question.question}
                </Typography>

                {isCorrect && (
                    <Typography variant="h6" component="p" align="center" sx={{ my: 2, color: "green" }}>
                        {t("game.correctAnswer", { score: score })}
                    </Typography>
                )}

                {isIncorrect && (
                    <Typography variant="h6" component="p" align="center" sx={{ my: 2, color: "red" }}>
                        {t("game.incorrectAnswer")}
                    </Typography>
                )}

                {isTimeUp && (
                    <Typography variant="h6" component="p" align="center" sx={{ my: 2, color: "red" }}>
                        {t("game.timeUp")}
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
                                {t("game.loadingImages")}
                            </Typography>
                        )}
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    )
}