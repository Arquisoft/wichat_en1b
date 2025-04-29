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
            const params = new URLSearchParams();
            const allowed = ['sort', 'order', 'limit', 'offset', 'gameType', 'minGames', 'minScore', 'registeredBefore', 'registeredAfter'];
            allowed.forEach(key => {
                if (filters[key] !== '' && filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key]);
                }
            });
            
            const url = `${this.apiUrl}/statistics${params.toString() ? '?' + params.toString() : ''}`;
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            
            return { 
                users: response.data.users,
                pagination: response.data.pagination,
                username: parsedUserCookie.username,
            };

        } catch (error) {
            console.error("Error fetching statistics:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error("statistics.errors.sessionExpired");
            }
            throw new Error(error.response?.data?.error || "profile.errors.failedToRetrieveStatistics");
        }
    }


    getStaticProfileImageUrl(username) {
        return `${this.apiUrl}/users/${username}/image`;
    }
}

export default RecordRetriever;