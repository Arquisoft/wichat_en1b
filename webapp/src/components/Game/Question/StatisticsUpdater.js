import axios from "axios";
import Cookies from "js-cookie";

class StatisticsUpdater {

    constructor(type) {    
        this.apiUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
        this.type = type || 'classical';
        this.statsData = {
            questionsAnswered: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            score: 0,
            gameType: this.type || 'classical',
            registrationDate: Date.now()
        }
    }

    async newGame() {
        this.statsData = { 
            questionsAnswered: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            score: 0,
            gameType: this.type || 'classical',
            registrationDate: Date.now(),
            endDate: null
        }
    }

    async recordCorrectAnswer(score) {
        this.statsData.correctAnswers += 1;
        this.statsData.score += score;
        this.statsData.questionsAnswered += 1;
    }

    async recordIncorrectAnswer() {
        this.statsData.incorrectAnswers += 1;
        this.statsData.questionsAnswered += 1;
    }

    async endGame() {
        this.statsData.endDate = Date.now();
        try {
            // Retrieve the 'user' cookie
            const userCookie = Cookies.get('user');        
            if (!userCookie) throw new Error("You are not logged in. Please log in to update your statistics.");
            
            // Parse the cookie value
            const parsedUserCookie = JSON.parse(userCookie);
            if (!parsedUserCookie) throw new Error("Cannot parse user cookie.");
            
            // Parse the token from the cookie
            const token = parsedUserCookie.token;    
            if (!token) throw new Error("Cannot parse authentication token.");
            
            // Make a POST request to the gateway with the authorization token
            console.log("Recording game with data:", this.statsData);
            const response = await axios.post(
                `${this.apiUrl}/recordGame`, 
                this.statsData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log("Game recorded successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating statistics:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error("Your session has expired. Please log in again.");
            }
            throw new Error(error.response?.data?.error || "Failed to update statistics");
        }
    }
}

export default StatisticsUpdater;