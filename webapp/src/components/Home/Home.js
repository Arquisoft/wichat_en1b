import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from 'axios';
import { Typewriter } from "react-simple-typewriter";
import { Container, Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { User, BarChart, Gamepad2, Layers, Puzzle, Library, BookOpenText } from "lucide-react";
import { keyframes } from "@mui/system";
import "@fontsource/inter";


const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(6px); }
  100% { transform: translateY(0); }
`;

const Logo = () => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                my: 4,
                animation: `${floatAnimation} 3s ease-in-out infinite`,
            }}
        >
            <Typography
                variant="h2"
                component="div"
                sx={{
                    fontWeight: "bold",
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: 1,
                    fontSize: { xs: "10vw", sm: "9vw", md: "8.5vw", lg: "8vw" },
                    textAlign: "center",
                }}
            >
                <span style={{ color: "black" }}>wichat</span>
                <span style={{ color: "#1976D2" }}>_en1b</span>
            </Typography>
        </Box>
    );
};

export const Home = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const userCookie = Cookies.get('user');
    const isUserLogged = !!userCookie;
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    let username = '';
    if (userCookie) {
        try {
            const parsedUser = JSON.parse(userCookie);
            username = parsedUser.username || '';
        } catch (e) {
            console.error('Error parsing user cookie', e);
        }
    }

    const menuItems = [
        {
            id: 1,
            title: "Your Profile",
            icon: <User size={45} color="#1976D2" />,
            link: `/profile/${username}`,
        },
        {
            id: 2,
            title: "Classical Game",
            icon: <BookOpenText size={45} color="#1976D2" />,
            link: "/game",
        },
        {
            id: 3,
            title: "Statistics",
            icon: <BarChart size={45} color="#1976D2" />,
            link: "/statistics",
        },
        {
            id: 4,
            title: "Game Modes",
            icon: <Layers size={45} color="#1976D2" />,
            link: "/game-modes",
        },
    ]

    const getGreetingMessage = async () => {

        try {
            const model = "empathy";
            let question = "";
            if (isUserLogged) {
                const userData = JSON.parse(userCookie);
                question = "Please, generate a  greeting message for a student called " + userData.username + " that is a student of the Software Architecture course in the University of Oviedo. Be nice and polite. Two to three sentences max.";
            } else {
                question = "Please, generate a generic greeting message for an unregistered user visiting the WiChat webapp. Take into account that the WiChat website is a question game webapp. Encourage him to log in or create a new user, while beign nice and polite. Two to three sentences max";
            }
            let answerLLM = await axios.post(`${apiEndpoint}/askllm`, { question, model })
            setMessage(answerLLM.data.answer);
        } catch (error) {
            setError(error.response.data.error);
        }
    }

    useEffect(() => {
        document.title = "WiChat - Home";
        getGreetingMessage();
    }, [])

    return (
        <Container maxWidth="sm" style={{ marginTop: "20px" }}>
            {!isUserLogged && <Logo />}
            <div>
                {message ? (
                    <Typewriter
                        words={[message]} // Pass your message as an array of strings
                        cursor
                        cursorStyle="|"
                        typeSpeed={50} // Typing speed in ms
                    />) : (
                    <Typography align="center" sx={{ marginTop: 2 }}>
                        Loading message...
                    </Typography>
                )}
            </div>
            {isUserLogged && (
                <>
                    <div style={{ marginTop: "40px" }}></div>
                    <Grid container spacing={3}>
                        {menuItems.map((item) => (
                            <Grid item xs={6} key={item.id}>
                                <Link to={item.link} style={{ textDecoration: "none" }}>
                                    <Card
                                        sx={{
                                            textAlign: "center",
                                            padding: "20px",
                                            backgroundColor: "#ffffff",
                                            borderRadius: "12px",
                                            border: "3px solid #1976D2", // More prominent blue border
                                            transition: "all 0.3s ease",
                                            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                                            "&:hover": {
                                                boxShadow: "0 8px 15px rgba(25, 118, 210, 0.3)",
                                                transform: "translateY(-5px)",
                                                borderColor: "#1565C0",
                                                borderWidth: "3px",
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    mb: 2,
                                                    borderRadius: "50%",
                                                    width: "80px",
                                                    height: "80px",
                                                    margin: "0 auto 12px",
                                                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                                                    border: "2px solid #1976D2", // Added border to the icon container
                                                }}
                                            >
                                                {item.icon}
                                            </Box>
                                            <Typography variant="h6" color="#333333" fontWeight="500">
                                                {item.title}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Container>
    )
}
