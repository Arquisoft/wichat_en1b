import { useState, useEffect } from "react"
import { Typography, Box, Grid, Button, Container, Paper, CircularProgress } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import Cookies from "js-cookie";
import axios from 'axios';
import { useGame } from "../GameContext";

// Create a theme with the blue color from the login screen
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
})

export const Question = () => {

    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [timeLeft, setTimeLeft] = useState(60)
    const [isCorrect, setIsCorrect] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const { question, setQuestion, setGameEnded } = useGame();

    const userCookie = Cookies.get('user');
    const isUserLogged = !!userCookie;
    const gatewayEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
    const statisticsEndpoint = process.env.STATS_SERVICE_URL || 'http://localhost:8005';

    useEffect(() => {
        const fetchData = async () => {
            await requestQuestion();
        };
        fetchData();
    }, [])

    const progressPercentage = (timeLeft / 60) * 100

    // Timer effect
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimeUp(true);
            setTimeout(() => {
                setIsTimeUp(false);
                requestQuestion();
            }, 2000); // Show "time up" message for 2 seconds before restarting
            return;
        }

        if (isPaused) return; // Pause the timer if isPaused is true

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1)
        }, 1000)

        // Cleanup timer on unmount
        return () => clearInterval(timerId)
    }, [timeLeft, isPaused])

    const requestQuestion = async () => {
        setIsPaused(true);
        setGameEnded(true);
        try {
            let questionResponse = await axios.get(`${gatewayEndpoint}/question`)
            setQuestion(questionResponse.data);
        } catch (error) {
            console.error("Error fetching question: ", error)
        }
        setImagesLoaded(false);
    }

    useEffect(() => {
        if (question.images.length > 0) {
            const imagePromises = question.images.map((image) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = image;
                    img.onload = resolve;
                });
            });

            Promise.all(imagePromises).then(() => {
                setImagesLoaded(true);
                setTimeLeft(60);
                setSelectedAnswer(null); // Fix the problem of having selected an image from the previous round
                setIsPaused(false); // Resume the timer after images are loaded
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

            const userCookie = Cookies.get('user');         // Retrieve the 'user' cookie
            if (!userCookie) throw new Error("Authentication token is missing.");
            
            const token = JSON.parse(userCookie)?.token;    // Parse the token from the cookie
            if (!token) throw new Error("Cannot parse authentication token.");

            if (response.data.correct) {

                await axios.post(
                    `${statisticsEndpoint}/statistics`,
                    { questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}` // Include the JWT in the Authorization header
                        }
                    }
                ).catch((error) => {
                    console.error("Error updating statistics:", error.response?.data || error.message);
                });

                setIsCorrect(true);
                setTimeout(() => {
                    setIsCorrect(false);
                    requestQuestion();
                }, 2000);

            } else {

                await axios.post(
                    `${statisticsEndpoint}/statistics`,
                    { questionsAnswered: 1, correctAnswers: 0, incorrectAnswers: 1 },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}` // Include the JWT in the Authorization header
                        }
                    }
                ).catch((error) => {
                    console.error("Error updating statistics:", error.response?.data || error.message);
                });

                setIsIncorrect(true);
                setTimeout(() => {
                    setIsIncorrect(false);
                    requestQuestion();
                }, 2000);
            }

        } catch (error) {
            console.error("Error checking answer: ", error);
        }
    }

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return (

        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Large Timer at the top */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "12px 24px",
                            borderRadius: "24px",
                            backgroundColor: timeLeft <= 10 ? "#ffebee" : "white",
                            border: timeLeft <= 10 ? "2px solid #f44336" : "1px solid #e0e0e0",
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
                        Correct!
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
                            question.images.map((image, index) => (
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
                    onClick={requestQuestion}
                    sx={{ display: "block", mx: "auto", mt: 3 }}
                >
                    Request new question
                </Button>
            </Container>
        </ThemeProvider>
    )
}


