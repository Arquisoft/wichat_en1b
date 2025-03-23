import axios from "axios";

class RecordRetriever {
    constructor(){
        this.apiUrl = (process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8005') + "/statistics";
    }
    
    async getRecords(username, token) {
        try {
            console.log(`Fetching statistics for user: ${username}`);
            const response = await axios.post(this.apiUrl, {
                user: { username: username }
            }, { 
                headers: {
                    'token': token,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("Statistics received successfully");
            return response.data;
        } catch (error) {
            console.error("Error fetching statistics:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                throw new Error(error.response.data.error || `Server error (${error.response.status})`);
            } else if (error.request) {
                console.error("No response received from server");
                throw new Error("No response from server. Please check if the backend service is running.");
            } else {
                throw new Error(error.message || "Failed to retrieve statistics");
            }
        }
    }
    
}

export default RecordRetriever;
