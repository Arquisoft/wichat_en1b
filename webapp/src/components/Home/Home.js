import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from 'axios';
import { Typewriter } from "react-simple-typewriter";
import { Container, Typography } from "@mui/material";


const Home = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');



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
        <Container >
            <Typography component="h1" variant="h5" align="center" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', marginTop: 2 }}>
                Welcome to the 2025 edition of the Software Architecture course!
            </Typography>
            {!isUserLogged ? (
                <Typography component="h2" variant="h5" align="center" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', marginTop: 2 }}>
                    You're not logged into the app!!
                </Typography>
            ) : (
                <Typography component="h2" variant="h5" align="center" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', marginTop: 2 }}>
                    You're logged as {JSON.parse(userCookie).username}!!
                </Typography>
            )}
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
        </Container>
    )
}

export default Home;
