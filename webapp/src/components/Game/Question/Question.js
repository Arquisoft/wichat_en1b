import { useState, useEffect } from "react";
import { Typography, Box, Grid, Button, Container, Paper, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from 'axios';
import { useGame } from "../GameContext";
import Cookies from "js-cookie";
import { t, useTranslation } from "react-i18next";
import { retrieveUserToken } from "../../utils/utils";
import { Navigate } from "react-router-dom";

// Create a theme with the blue color from the login screen
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
});


export const Question = () => {

    const { question, setQuestion, setGameEnded, gameEnded,
        AIAttempts, setAIAttempts, setClearMessages,
        gameMode, round, nextRound, resetRounds, isGameEnded,
        timeLeft, startTimer, pauseTimer, resetTimer, strategy, initialTime } = useGame();
    //console.log("Question: strategy: ", strategy)
    //console.log("Question: questionType: ", questionType)
    const gatewayEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctOption, setCorrectOption] = useState(null);
    const [totalTime, setTotalTime] = useState(initialTime); // Set initial time based on the strategy
    //console.log("Question: totalTime", totalTime);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [streak, setStreak] = useState(0); // Track the streak of correct answers
    const [score, setScore] = useState(0); // Track the score
    const [currentScore, setCurrentScore] = useState(0); // Track the current score
    const { t, i18n } = useTranslation(); // Initialize i18next for translations
    const [endGameData, setEndGameData] = useState(null);

    const questionType = localStorage.getItem("topic") || "random"; // Default to "random" if not set


    useEffect(() => {
        resetTimer();
        pauseTimer();
        const fetchInitialQuesiton = async () => {
            await requestQuestion(true);
        }
        fetchInitialQuesiton();
    }, []); // Empty deps array since this should only run on mount

    const progressPercentage = (timeLeft / totalTime) * 100;

    const requestQuestion = async (isInitialLoad = false) => {
        pauseTimer(); // Stop the timer before fetching a new question
        try {
            const token = retrieveUserToken();
            let endpoint = gameMode == "qod" ? `${gatewayEndpoint}/question-of-the-day` : `${gatewayEndpoint}/question/${questionType}`;
            let questionResponse = await axios.get(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (isInitialLoad) {
                strategy.statisticsUpdater.newGame();
            }
            setQuestion(questionResponse.data);
            setSelectedAnswer(null);

            if (questionResponse.data.recordedAnswer) {
                setSelectedAnswer(questionResponse.data.recordedAnswer.answer);
                setCorrectOption(questionResponse.data.recordedAnswer.correctOption);
                processAnswerResponse(questionResponse.data.recordedAnswer.isCorrect, false);
            }

        } catch (error) {
            console.error("Error fetching question: ", error)
        }
        setImagesLoaded(false);
    };

    const handleEndGame = async (shouldRecord = true) => {
        try {
            const resultGameData = await strategy.statisticsUpdater.endGame(shouldRecord);
            setEndGameData(resultGameData);

            setTimeout(() => {
                setGameEnded(true);
            }, 2000);
        } catch (error) {
            console.error("Error ending game:", error.message);
        }

        // setTimeout(() => {
        //     strategy.statisticsUpdater.newGame();
        //     resetGame();
        //     setIsTimeUp(false);
        // }, 2000);
    };

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
                startTimer(); // <-- Start context timer
            });
        }
    }, [question.images]);

    useEffect(() => {
        if (timeLeft === 0) {
            setClearMessages(true);
            strategy.statisticsUpdater.recordIncorrectAnswer();
            const continueGame = strategy.shouldContinue({
                isCorrect: false,
                round,
                totalTimeLeft: timeLeft,
            });
            if (strategy.timerMode === 'perGame' || !continueGame) {
                setIsTimeUp(true);
                handleEndGame();
            } else {

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
        }
    }, [timeLeft]);


    const handleAnswerSelect = async (answer) => {
        if (selectedAnswer || isCorrect || isIncorrect || isTimeUp) return;

        setSelectedAnswer(answer);
        if (strategy.timerMode === 'perQuestion') pauseTimer();

        try {
            const token = retrieveUserToken();

            const response = await axios.post(`${gatewayEndpoint}/answer`, {
                questionId: question.id,
                answer: answer,
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const isCorrectAnswer = response.data.correct === true;
            setCorrectOption(response.data.correctOption);
            processAnswerResponse(isCorrectAnswer);
        } catch (error) {
            console.error("Error checking answer:", error);
        }
    };

    const processAnswerResponse = (isCorrectAnswer, shouldRecord = true) => {
        const score = strategy.calculateScore({
            isCorrect: isCorrectAnswer,
            timeLeft,
            AIAttempts,
            streak,
            round,
        });

        setScore(score);
        setCurrentScore(prev => prev + score);
        setStreak(prev => isCorrectAnswer ? prev + 1 : 0);

        if (isCorrectAnswer) {
            strategy.statisticsUpdater.recordCorrectAnswer(score);
            setIsCorrect(true);
        } else {
            strategy.statisticsUpdater.recordIncorrectAnswer();
            setIsIncorrect(true);
        }

        const continueGame = strategy.shouldContinue({
            isCorrect: isCorrectAnswer,
            round,
            totalTimeLeft: timeLeft,
        });

        setAIAttempts(0); // Reset AI attempts for next question

        if (!continueGame || isGameEnded()) {
            handleEndGame(shouldRecord);
        } else {
            setTimeout(() => {
                setIsCorrect(false);
                setIsIncorrect(false);
                requestQuestion(false);
                setClearMessages(true);
                nextRound();
                if (strategy.timerMode === 'perQuestion') {
                    resetTimer();
                }
            }, 2000);
        }
    }



    const resetGame = () => {
        resetRounds();             // From useGame context
        resetTimer();              // Reset the timer to initial value
        setCurrentScore(0);
        setScore(0);
        setStreak(0);
        setIsCorrect(false);
        setIsIncorrect(false);
        requestQuestion(false);
        setSelectedAnswer(null);
        setGameEnded(false);   // From useGame context
    };


    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
    }, [i18n.language, question.id]);

    if (gameEnded && endGameData) {
        return <Navigate to="/game/end-game" state={{ data: endGameData }} />
    }

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
                <Typography variant="p" component="p" align="center" sx={{ my: 3, fontWeight: 500, fontSize: "1.5rem" }}>
                    {round} {strategy.maxRounds != Infinity ? `/ ${strategy.maxRounds}` : ""}
                    {streak >= 3 && (
                        <Typography variant="span" component="span" align="center" sx={{ ml: 3, fontWeight: 500, color: "red" }}>
                            {streak} 🔥
                        </Typography>
                    )}
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

                {imagesLoaded ? (
                    <Typography variant="h5" component="h2" align="center" sx={{ my: 3, fontWeight: 500 }}>
                        {question.question}
                    </Typography>) : (<></>)}

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
                                        disabled={!!selectedAnswer}
                                        sx={{
                                            width: "100%",
                                            aspectRatio: {
                                                xs: "4 / 3", // Wider on small screens
                                                sm: "1 / 1" // Square on larger screens
                                            },
                                            padding: 1.5,
                                            overflow: "hidden",
                                            borderRadius: 3,
                                            boxShadow: 2,
                                            backgroundColor:
                                                selectedAnswer === image && isCorrect ? "success.main" :
                                                    selectedAnswer === image && isIncorrect ? "error.main" :
                                                        image === correctOption && isIncorrect ? "warning.main" :
                                                            selectedAnswer === image ? "primary.main" :
                                                                "background.paper",
                                            '&:hover': {
                                                backgroundColor:
                                                    selectedAnswer === image && isCorrect ? "success.dark" :
                                                        selectedAnswer === image && isIncorrect ? "error.dark" :
                                                            image === correctOption && isIncorrect ? "warning.dark" :
                                                                selectedAnswer === image ? "primary.dark" :
                                                                    "grey.100"
                                            },
                                            '&.Mui-disabled': {
                                                backgroundColor:
                                                    selectedAnswer === image && isCorrect ? "success.main" :
                                                        selectedAnswer === image && isIncorrect ? "error.main" :
                                                            image === correctOption && isIncorrect ? "warning.main" :
                                                                selectedAnswer === image ? "primary.main" :
                                                                    "background.paper",
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        {/* Image inside the button */}
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: "white",
                                                borderRadius: 2
                                            }}
                                        >
                                            {/* Image element */}
                                            <Box
                                                component="img"
                                                src={image || "/placeholder.svg"}
                                                alt="Game Option"
                                                sx={{
                                                    maxWidth: "90%",
                                                    maxHeight: "90%",
                                                    objectFit: "contain",
                                                    display: "block"
                                                }}
                                            />
                                        </Box>
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