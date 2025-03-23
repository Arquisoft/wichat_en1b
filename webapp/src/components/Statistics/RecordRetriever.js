import axios from "axios";

class RecordRetriever {
    constructor() {
        // Set the API URL for the statistics endpoint (process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8005') + "/statistics"
        this.apiUrl = 'http://localhost:8005/statistics';
    }

   /**
     * Fetch user statistics from the backend.
     * @param {string} username - The username to fetch statistics for.
     * @param {string} token - The authorization token for the request.
     * @returns {Promise<Object>} - The user statistics data.
     * @throws {Error} - Throws an error if the request fails.
     */
   async getRecords(username, token) {
        try {
            
            // Make a GET request to the statistics endpoint with the authorization token and username
            const response = await axios.get(this.apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    username    // Pass the username as a query parameter
                }
            });

            // Return the response data (user statistics)
            return response.data;

        } catch (error) {
            console.error("Error fetching statistics:", error);

            // Handle errors based on the type of Axios error
            if (error.response) {

                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);

                // Handle unauthorized or forbidden errors
                if (error.response.status === 401 || error.response.status === 403) {
                    throw new Error("Your session has expired. Please log in again.");
                }

                // Throw a server error with the response message or status
                throw new Error(error.response.data.error || `Server error (${error.response.status})`);
            } else if (error.request) {
                // Request was made but no response was received
                console.error("No response received from server");
                throw new Error("No response from server. Please check if the backend service is running.");
            } else {
                // Other errors
                throw new Error(error.message || "Failed to retrieve statistics");
            }
        }
    }
}

export default RecordRetriever;