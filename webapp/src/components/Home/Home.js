import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from 'axios';
import { Typewriter } from "react-simple-typewriter";
import { Container, Grid, Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { User, BarChart, Gamepad2, Layers } from "lucide-react";


export const Home = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const menuItems = [
        { id: 1, title: "Your Profile", icon: <User size={50} />, link: "/profile", color: "#A7E3FF" },
        { id: 2, title: "New Game", icon: <Gamepad2 size={50} />, link: "/game", color: "#D0C3FF" },
        { id: 3, title: "Statistics", icon: <BarChart size={50} />, link: "/statistics", color: "#FFCF9D" },
        { id: 4, title: "Game Modes", icon: <Layers size={50} />, link: "/game-modes", color: "#C3CADF" },
    ];

    const userCookie = Cookies.get('user');
    const isUserLogged = !!userCookie;
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

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
        console.log(message);
    }

    useEffect(() => {
        document.title = "WiChat - Home";
        getGreetingMessage();
    }, [])

    return (
        <Container maxWidth="sm" style={{ marginTop: "20px" }}>
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
            <div style={{ marginTop: "40px" }}></div>
            <Grid container spacing={3}>
                {menuItems.map((item) => (
                    <Grid item xs={6} key={item.id}>
                        <Link to={item.link} style={{ textDecoration: "none" }}>
                            <Card
                                sx={{
                                    textAlign: "center",
                                    padding: "20px",
                                    backgroundColor: item.color,
                                    borderRadius: "10px",
                                    '&:hover': { boxShadow: 6 }
                                }}
                            >
                                <CardContent>
                                    {item.icon}
                                    <Typography variant="h6" mt={2}>
                                        {item.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}
