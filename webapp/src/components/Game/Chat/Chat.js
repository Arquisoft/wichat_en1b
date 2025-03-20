import { useState, useRef, useEffect } from "react"
import { Box, Paper, Typography, TextField, Button, IconButton, Avatar, Divider, CircularProgress } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import ChatIcon from "@mui/icons-material/Chat"
import CloseIcon from "@mui/icons-material/Close"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import axios from "axios"
import { useGame } from "../GameContext"


export function Chat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const { question, gameEnded, setGameEnded } = useGame();
    // Adjust in function of the height of the navbar
    const navbarHeight = 64
    const gatewayEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"

    // Scroll to bottom of messages when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    useEffect(() => {
        if (gameEnded) {
            setMessages([]);
            setGameEnded(false);
        }
    }, [gameEnded]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen)
    }

    const handleInputChange = (e) => {
        setInput(e.target.value)
    }


    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!input.trim() || isLoading) return

        // Create a unique ID for the message
        const userMessageId = Date.now().toString()

        // Add user message to the chat
        const userMessage = {
            id: userMessageId,
            role: "user",
            content: input.trim(),
        }

        setMessages((prevMessages) => [...prevMessages, userMessage])
        setInput("") // Clear input field
        setIsLoading(true)

        try {
            // Make the API call to your backend
            const model = "empathy";
            let questionLLM = "You are intended to provide clues about the question " + question.question + "to the user."
            questionLLM += "The user is playing a game where he have the question that I've provided to you and 4 images to choose."
            questionLLM += "Your goal is to give short clues strictly about the question that I provided to you. If the user wants to change topic, do not allow them."
            questionLLM += "Now I will provide you with the question of the user. REMEMBER NOT TO GIVE THE DEFINITIVE ANSWER, ONLY CLUES. One clue at a time. User message:\n"
            questionLLM += userMessage.content
            const response = await axios.post(`${gatewayEndpoint}/askllm`, {
                question: questionLLM, model
            })

            // Add the response from your backend to the chat
            const assistantMessage = {
                id: Date.now().toString(),
                role: "assistant",
                content: response.data.answer || "Sorry, I couldn't process your request.",
            }

            setMessages((prevMessages) => [...prevMessages, assistantMessage])
        } catch (error) {
            console.error("Error fetching response:", error)

            // Add an error message
            const errorMessage = {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, there was an error processing your request. Please try again.",
            }

            setMessages((prevMessages) => [...prevMessages, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Box
            sx={{
                position: "fixed",
                right: 0,
                // Start below the navbar
                top: `${navbarHeight}px`,
                // Adjust height to account for navbar
                height: `calc(100% - ${navbarHeight}px)`,
                zIndex: 1050,
                display: "flex",
                transition: "width 0.3s ease-in-out",
                width: isOpen ? "25%" : "56px",
            }}
        >
            {/* Collapsed sidebar toggle button */}
            <IconButton
                onClick={toggleSidebar}
                sx={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: isOpen ? "translate(-50%, -50%)" : "translate(-100%, -50%)",
                    zIndex: 1060,
                    backgroundColor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    border: "1px solid #e0e0e0",
                    "&:hover": {
                        backgroundColor: "#f5f5f5",
                    },
                }}
            >
                {isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>

            {/* Chat container */}
            <Paper
                elevation={3}
                sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 0,
                    borderLeft: "1px solid #e0e0e0",
                    display: "flex",
                    flexDirection: "column",
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderBottom: "1px solid #e0e0e0",
                    }}
                >
                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ChatIcon fontSize="small" />
                        Chat Assistant
                    </Typography>
                    <IconButton onClick={toggleSidebar} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Messages */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        padding: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    {messages.length === 0 ? (
                        <Box
                            sx={{
                                display: "flex",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                color: "text.secondary",
                            }}
                        >
                            <Box>
                                <ChatIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                                <Typography>Ask me anything about the quiz!</Typography>
                            </Box>
                        </Box>
                    ) : (
                        messages.map((message) => (
                            <Box
                                key={message.id}
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 1,
                                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                                }}
                            >
                                {message.role !== "user" && (
                                    <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32, fontSize: "0.875rem" }}>AI</Avatar>
                                )}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        padding: "8px 12px",
                                        maxWidth: "80%",
                                        borderRadius: "12px",
                                        backgroundColor: message.role === "user" ? "#1976d2" : "#f5f5f5",
                                        color: message.role === "user" ? "white" : "text.primary",
                                    }}
                                >
                                    <Typography variant="body2">{message.content}</Typography>
                                </Paper>
                                {message.role === "user" && (
                                    <Avatar
                                        sx={{ bgcolor: "#e0e0e0", width: 32, height: 32, fontSize: "0.875rem", color: "text.primary" }}
                                    >
                                        You
                                    </Avatar>
                                )}
                            </Box>
                        ))
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                justifyContent: "flex-start",
                            }}
                        >
                            <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32, fontSize: "0.875rem" }}>AI</Avatar>
                            <Paper
                                elevation={0}
                                sx={{
                                    padding: "8px 12px",
                                    borderRadius: "12px",
                                    backgroundColor: "#f5f5f5",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <CircularProgress size={16} />
                                <Typography variant="body2">Thinking...</Typography>
                            </Paper>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Box>

                <Divider />

                {/* Input */}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: "flex",
                        padding: 2,
                        gap: 1,
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Type your message..."
                        value={input}
                        onChange={handleInputChange}
                        disabled={!isOpen || isLoading}
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading || !input.trim()}
                        sx={{ minWidth: "unset", width: 40, height: 40, padding: 0 }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon fontSize="small" />}
                    </Button>
                </Box>
            </Paper>

            {/* Collapsed chat button */}
            <IconButton
                onClick={toggleSidebar}
                color="primary"
                sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: isOpen ? 0 : 1,
                    pointerEvents: isOpen ? "none" : "auto",
                    transition: "opacity 0.3s ease-in-out",
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {
                        backgroundColor: "#1565c0",
                    },
                }}
            >
                <ChatIcon />
            </IconButton>
        </Box>
    )
}

