

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
})

export const Timer = ({ time, onTimeUp }) => {
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    
    return (
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
    )
}