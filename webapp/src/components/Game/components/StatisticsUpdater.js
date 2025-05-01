import axios from "axios";
import Cookies from "js-cookie";
import { retrieveUserToken } from "../../utils/utils";

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

    newGame() {
        console.log("Starting new game of type:", this.type);
        this.statsData.endDate = null;
        this.statsData.gameType = this.type || 'classical';
        this.statsData.score = 0;
        this.statsData.questionsAnswered = 0;
        this.statsData.correctAnswers = 0;
        this.statsData.incorrectAnswers = 0;
        this.statsData.registrationDate = Date.now();
        console.log("New game stats initialized:", this.statsData);
    }

    recordCorrectAnswer(score) {
        this.statsData.correctAnswers += 1;
        this.statsData.score += score;
        this.statsData.questionsAnswered += 1;
    }

    recordIncorrectAnswer() {
        this.statsData.incorrectAnswers += 1;
        this.statsData.questionsAnswered += 1;
    }

    getCurrentScore() {
        return this.statsData.score;
    }

    async endGame(shouldRecord = true) {
        this.statsData.endDate = Date.now();
        if (shouldRecord) {
            try {
                const token = retrieveUserToken();

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
            } catch (error) {
                console.error("Error updating statistics:", error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    throw new Error("statistics.errors.sessionExpired");
                }
                throw new Error(error.response?.data?.error || "statistics.errors.failedToUpdate");
            }
        }
        return this.statsData;
    }
}

export default StatisticsUpdater;