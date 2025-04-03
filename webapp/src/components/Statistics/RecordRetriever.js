import axios from "axios";
import Cookies from "js-cookie";

class RecordRetriever {
    constructor() {     
        this.apiUrl = process.env.GATEWAY_SERVICE_URL || 'http://localhost:8000'
    }

    /**
     * Fetch user statistics from the backend.
     * @returns {Promise<Object>} - The user statistics data.
     * @throws {Error} - Throws an error if the request fails.
     */
   async getRecords() {
        try {
            // Retrieve the 'user' cookie
            const userCookie = Cookies.get('user');         
            if (!userCookie) throw new Error("You are not logged in. Please log in to view your statistics.");

            // Parse the cookie value
            const parsedUserCookie = JSON.parse(userCookie); 
            if (!parsedUserCookie) throw new Error("Cannot parse user cookie.");

            // Parse the token from the cookie
            const token = parsedUserCookie.token;    
            if (!token) throw new Error("Cannot parse authentication token.");

            // Make a GET request to the gateway with the authorization token
            
            console.log("Accessing url :", this.apiUrl + "/statistics");
            console.log("Username inside cookie:", parsedUserCookie.username);
            console.log("Fetching statistics with token:", token);
            
            const response = await axios.get(this.apiUrl + "/statistics", {
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