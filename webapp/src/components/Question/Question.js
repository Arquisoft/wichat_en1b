import { useState, useEffect } from "react"
import { Typography, Box, Grid, Button, Container, Paper, CircularProgress } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import Cookies from "js-cookie";
import axios from 'axios';

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
    const [timeLeft, setTimeLeft] = useState(60) // 60 seconds timer
    const [question, setQuestion] = useState({
        question: "Pregunta",
        images: []
    });


    const userCookie = Cookies.get('user');
    const isUserLogged = !!userCookie;
    const gatewayEndpoint = process.env.GATEWAY_SERVICE_URL || 'http://localhost:8000';
    

    useEffect(() => {
        const fetchData = async () => {
            await requestQuestion();
        };
        fetchData();
    }, [])

    const progressPercentage = (timeLeft / 60) * 100

    // Timer effect
    useEffect(() => {
        if (timeLeft <= 0) return // Stop when timer reaches 0

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1)
        }, 1000)

        // Cleanup timer on unmount
        return () => clearInterval(timerId)
    }, [timeLeft])

    const requestQuestion = async () => {
        let questionResponse = await axios.get(`${gatewayEndpoint}/question`)
        console.log(questionResponse.data);
        setQuestion(questionResponse.data);
    }

    const handleAnswerSelect = async (answer) => {
        setSelectedAnswer(answer);
        let response = await axios.post(`${gatewayEndpoint}/checkanswer`, { questionID: question.id, answer: answer });
        let isCorrect = response.data.correct;
    }

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Calculate progress for the circular timer (from 0 to 360 degrees)
    const calculateProgress = (timeLeft, totalTime = 60) => {
        const percentage = timeLeft / totalTime
        return percentage * 360 // Convert to degrees for the circle
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

                {/* Question */}
                <Typography variant="h5" component="h2" align="center" sx={{ my: 3, fontWeight: 500 }}>
                    {question.question}
                </Typography>

                {/* Options */}
                <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
                    <Grid container spacing={2}>
                        {question.images.map((image, index) => (
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
                                        backgroundColor: selectedAnswer === image ? undefined : "white",
                                    }}
                                >
                                    <img
                                        src={image || "/placeholder.svg"}
                                        alt="Game Question"
                                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                    />
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <Button onClick={requestQuestion}>Generar pregunta</Button>
            </Container>
        </ThemeProvider>
    )
}


