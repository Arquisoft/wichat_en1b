import axios from "axios";
import Cookies from "js-cookie";

class RecordRetriever {
    constructor() {
        // Set the API URL for the statistics endpoint (process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8005') + "/statistics"
        this.apiUrl = 'http://localhost:8005/statistics';
    }

   /**
     * Fetch user statistics from the backend.
     * @returns {Promise<Object>} - The user statistics data.
     * @throws {Error} - Throws an error if the request fails.
     */
   async getRecords() {
        try {
            const userCookie = Cookies.get('user');         // Retrieve the 'user' cookie
            if (!userCookie) throw new Error("Authentication token is missing.");

            const token = JSON.parse(userCookie)?.token;    // Parse the token from the cookie
            if (!token) throw new Error("Cannot parse authentication token.");
            
            // Make a GET request to the statistics endpoint with the authorization token
            const response = await axios.get(this.apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Return the response data (user statistics)
            return response.data;

        } catch (error) {
            console.error("Error fetching statistics:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error("Your session has expired. Please log in again.");
            }
            throw new Error(error.response?.data?.error || "Failed to retrieve statistics");
        }
    }
}

export default RecordRetriever;