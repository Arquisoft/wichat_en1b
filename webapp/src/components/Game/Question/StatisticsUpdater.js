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

    /**
     * Update user statistics in the backend.
     * @param {Object} statsData - The statistics data to update.
     * @param {number} [statsData.gamesPlayed=0] - Number of games played to increment.
     * @param {number} [statsData.questionsAnswered=0] - Number of questions answered to increment.
     * @param {number} [statsData.correctAnswers=0] - Number of correct answers to increment.
     * @param {number} [statsData.incorrectAnswers=0] - Number of incorrect answers to increment.
     * @returns {Promise<Object>} - The updated statistics data.
     * @throws {Error} - Throws an error if the request fails.
     */
    async updateStatistics(statsData = {}) {
        try {
            // Validate input
            for (const key in statsData) {
                if (isNaN(parseInt(statsData[key]))) {
                    throw new Error(`Invalid value for ${key}: must be a number`);
                }
            }

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
            const response = await axios.post(
                `${this.apiUrl}/statistics`, 
                statsData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error("Error updating statistics:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error("Your session has expired. Please log in again.");
            }
            throw new Error(error.response?.data?.error || "Failed to update statistics");
        }
    }

    /**
     * Increment game played count.
     * @returns {Promise<Object>} - The updated statistics.
     */
    async incrementGamesPlayed() {
        return this.updateStatistics({ gamesPlayed: 1 });
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

    async recordCorrectAnswer2(score) {
        this.statsData.correctAnswers += 1;
        this.statsData.score += score;
        this.statsData.questionsAnswered += 1;
    }

    async recordIncorrectAnswer2() {
        this.statsData.incorrectAnswers += 1;
        this.statsData.questionsAnswered += 1;
    }

    async endGame() {
        this.statsData.endDate = Date.now();
        try {
            // Validate input
            for (const key in this.statsData) {
                if (isNaN(parseInt(this.statsData[key]))) {
                    throw new Error(`Invalid value for ${key}: must be a number`);
                }
            }

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
            const response = await axios.post(
                `${this.apiUrl}/recordGame`, 
                this.statsData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error("Error updating statistics:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error("Your session has expired. Please log in again.");
            }
            throw new Error(error.response?.data?.error || "Failed to update statistics");
        }
    }

    /**
     * Record a correct answer.
     * @returns {Promise<Object>} - The updated statistics.
     */
    async recordCorrectAnswer() {
        return this.updateStatistics({ 
            questionsAnswered: 1, 
            correctAnswers: 1
        });
    }

    /**
     * Record an incorrect answer.
     * @returns {Promise<Object>} - The updated statistics.
     */
    async recordIncorrectAnswer() {
        return this.updateStatistics({ 
            questionsAnswered: 1, 
            incorrectAnswers: 1
        });
    }
}

export default StatisticsUpdater;