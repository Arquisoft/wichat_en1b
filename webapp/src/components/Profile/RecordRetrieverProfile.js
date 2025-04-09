import axios from "axios";
import Cookies from "js-cookie";

class RecordRetrieverProfile {
    constructor() {     
        this.apiUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000'
    }

    /**
     * Validates a username to prevent NoSQL injection
     * @param {string} username - The username to validate
     * @returns {boolean} - True if the username is valid, false otherwise
     */
    validateUsername(username) {
        if (!username) return false;

        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        return usernameRegex.test(username);
    }

    /**
     * Fetch user statistics from the backend.
     * @returns {Promise<Object>} - The user statistics data.
     * @throws {Error} - Throws an error if the request fails.
     */
   async getRecords(targetUsername) {
        try {
            // Validate the username to prevent NoSQL injection
            if (!this.validateUsername(targetUsername)) {
                throw new Error("Invalid username format. Please use a valid username.");
            }
            
            // Retrieve the 'user' cookie
            const userCookie = Cookies.get('user');        
            if (!userCookie) throw new Error("You are not logged in. Please log in to view statistics.");
            
            // Parse the cookie value
            const parsedUserCookie = JSON.parse(userCookie);
            if (!parsedUserCookie) throw new Error("Cannot parse user cookie.");
            
            // Parse the token from the cookie
            const token = parsedUserCookie.token;    
            if (!token) throw new Error("Cannot parse authentication token.");
            
            // Make a GET request to the gateway with the authorization token
            const response = await axios.get(`${this.apiUrl}/profile/${encodeURIComponent(targetUsername)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Return the response data (user statistics) and the username
            return {
                statsData: response.data,
                username: targetUsername,
                currentUser: parsedUserCookie.username
            };

        } catch (error) {
            console.error("Error fetching statistics:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error("Your session has expired. Please log in again.");
            }
            throw new Error(error.response?.data?.error || "Failed to retrieve statistics");
        }
    }
}

export default RecordRetrieverProfile;