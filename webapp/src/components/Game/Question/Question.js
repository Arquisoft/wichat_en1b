import { useState, useEffect } from "react"
import { Typography, Box, Grid, Button, Container, Paper, CircularProgress } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import axios from 'axios';
import { useGame } from "../GameContext";
import StatisticsUpdater from "./StatisticsUpdater";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { DoNotDisturbOnTotalSilence } from "@mui/icons-material";

// Create a theme with the blue color from the login screen
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
})

// Create a default statistics updater instance
const defaultStatisticsUpdater = new StatisticsUpdater('suddenDeath');

export const Question = ({ statisticsUpdater = defaultStatisticsUpdater }) => {
    const maxRounds = 10;
    const basePoints = 1000; // Base points for a correct answer
    const totalTime = 60;

    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [timeLeft, setTimeLeft] = useState(totalTime)
    const [isCorrect, setIsCorrect] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [round, setRound] = useState(1); // Track the round number
    const [isGameEnded, setIsGameEnded] = useState(false); // Track if the game has ended
    const [streak, setStreak] = useState(0); // Track the streak of correct answers
    const [score, setScore] = useState(0); // Track the score

    const { question, setQuestion, setGameEnded, questionType, AIAttempts, setAIAttempts, maxAIAttempts } = useGame();
    const gatewayEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    useEffect(() => {
        const fetchInitialQuesiton = async () => {
            await requestQuestion(true); // Pass true to indicate it's the initial load
        }
        fetchInitialQuesiton();
    }, [questionType])

    const progressPercentage = (timeLeft / totalTime) * 100

    // Timer effect
    useEffect(() => {
        if (timeLeft <= 0 && !isTimeUp) {
            setIsTimeUp(true);
            setTimeout(() => {
                requestQuestion(false).finally(() => {
                    setIsTimeUp(false); // Reset isTimeUp after the question is fetched
                });
            }, 2000); // Show "time up" message for 2 seconds before restarting
            return;
        }

        if (isPaused || isTimeUp) return; // Pause the timer if isPaused is true

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1)
        }, 1000)

        // Cleanup timer on unmount
        return () => clearInterval(timerId)
    }, [timeLeft, isPaused])

    const requestQuestion = async (isInitialLoad = false) => {
        setIsPaused(true);
        setGameEnded(true);
        try {
            let questionResponse = await axios.get(`${gatewayEndpoint}/question/${questionType}`);
            setQuestion(questionResponse.data);

            // Update gamesPlayed only on the first load
            if (isInitialLoad) {
                try {
                    await statisticsUpdater.newGame();
                } catch (error) {
                    console.error("Error incrementing games played:", error.message);
                }
            }

        } catch (error) {
            console.error("Error fetching question: ", error)
        }
        setImagesLoaded(false);
    }

    useEffect(() => {
        if (question.images?.length > 0) {
            const imagePromises = question.images.map((image) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = image;
                    img.onload = resolve;
                });
            });

            Promise.all(imagePromises).then(() => {
                setImagesLoaded(true);
                setTimeLeft(totalTime); // Reset time left to total time
                setSelectedAnswer(null);    // Fix the problem of having selected an image from the previous round
                setIsPaused(false);         // Resume the timer after images are loaded
            });
        }
    }, [question.images]);

    const handleAnswerSelect = async (answer) => {
        if (isCorrect || isIncorrect || isTimeUp) {
            return;
        }

        setSelectedAnswer(answer);
        setIsPaused(true); // Pause the timer when an answer is selected

        try {
            let response = await axios.post(`${gatewayEndpoint}/answer`, { questionId: question.id, answer: answer });

            if (response.data.correct) {
                // Update statistics for correct answer
                setStreak(streak + 1); // Increment streak on correct answer
                setScore(basePoints - (((totalTime - timeLeft) * 600) / totalTime) - AIAttempts*100 + getStreakBonus()); // Calculate score based on time left
                try {
                    await statisticsUpdater.recordCorrectAnswer(1000); // Assuming 1000 is the score for a correct answer
                } catch (error) {
                    console.error("Error recording correct answer:", error.message);
                }

                setIsCorrect(true);
                
                setTimeout(() => {
                    setIsCorrect(false);
                    requestQuestion(false); // Not the first question
                }, 2000);
            } else {
                // Update statistics for incorrect answer
                try {
                    await statisticsUpdater.recordIncorrectAnswer(); // Assuming no score for incorrect answer
                    setStreak(0); // Reset streak on incorrect answer
                } catch (error) {
                    console.error("Error recording incorrect answer:", error.message);
                }

                setIsIncorrect(true);
                setTimeout(() => {
                    setIsIncorrect(false);
                    requestQuestion(false); // Not the first question
                }, 2000);
            }
            setAIAttempts(0); // Reset AI attempts on each question
            if (round == maxRounds) {
                setGameEnded(true); // Notify the game context that the game has ended
                const endGameAndSaveResults = async () => {
                    try {
                        await statisticsUpdater.endGame(); // Record the game statistics
                        await statisticsUpdater.newGame(); // Record the game results
                    } catch (error) {
                        console.error("Error recording game:", error.message);
                    }
                }
                endGameAndSaveResults();
                setTimeout(() => {

                }, 2000); // Show message for 2 seconds before resetting
                setGameEnded(false); // Reset game ended state
                setRound(1); // Reset round count
                setStreak(0); // Reset streak count
            } else {
                setRound(round + 1); // Increment round count
            }
        } catch (error) {
            console.error("Error checking answer: ", error);
        }
    }


    useEffect(() => {
        if (isGameEnded) {
            // Handle game end logic here, e.g., show a message or redirect to a different page
            console.log("Game has ended. Show final score or redirect.");
            // You can also reset the game state here if needed
            // For example, you might want to reset the question and score

        }
    }, [isGameEnded])

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const getStreakBonus = () => {
        if(streak < 3) return 0; // No bonus for streaks less than 3
        let base = 50;
        return base + 15*(streak - 3); // 50 points for 3 streak, 15 points for each additional streak
    }


    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
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
                    <Paper
                        elevation={3}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "12px 24px",
                            borderRadius: "24px",
                            backgroundColor: "white",
                            border: "2px solid #1976d2",
                            width: { xs: "80%", sm: "30%" }, // Full width on mobile, smaller on larger screens
                        }}
                    >
                        <QuestionTypeSelector />
                    </Paper>
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
                <Button
                    onClick={() => requestQuestion(false)} // Not the first question when manually requesting
                    sx={{ display: "block", mx: "auto", mt: 3 }}
                >
                    Request new question
                </Button>
            </Container>
        </ThemeProvider>
    )
}