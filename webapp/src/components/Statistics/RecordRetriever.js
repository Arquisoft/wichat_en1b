import axios from "axios";
import Cookies from "js-cookie";

class RecordRetriever {
    constructor() {
        this.apiUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000'
    }

    /**
     * Fetch user statistics from the backend with optional filters.
     * @param {Object} filters - Optional filter parameters
     * @returns {Promise<Object>} - The user statistics data.
     * @throws {Error} - Throws an error if the request fails.
     */
    async getRecords(filters = {}) {
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

            // Build query parameters
            const queryParams = new URLSearchParams();
            const validFilters = ['sort', 'order', 'limit', 'offset', 'gameType',
                'minGames', 'minScore', 'registeredBefore', 'registeredAfter'];;

            validFilters.forEach(filter => {
                if (filters[filter]) queryParams.append(filter, filters[filter]);
            });

            // Build URL with query parameters
            const url = `${this.apiUrl}/statistics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            // Make a GET request to the gateway with the authorization token
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Return the response data (user statistics) and the username
            return {
                statsData: response.data,
                username: parsedUserCookie.username,
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

export default RecordRetriever;