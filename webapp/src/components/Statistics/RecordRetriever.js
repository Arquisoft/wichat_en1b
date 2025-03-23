import axios from "axios";

class RecordRetriever {
    constructor(){
        this.apiUrl = (process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8005') + "/statistics";
    }
    
    async getRecords(token) {
        try {
          const response = await axios.get(this.apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          return response.data;

        } catch (error) {
            console.error("Error fetching statistics:", error);
            
            // Check if it's an axios error with response
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
                
                // If token is invalid, we might want to redirect to login
                if (error.response.status === 401 || error.response.status === 403) {
                    // Consider redirecting to login or clearing invalid token
                    // window.location.href = '/login';
                    throw new Error("Your session has expired. Please log in again.");
                }
                
                throw new Error(error.response.data.error || `Server error (${error.response.status})`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("No response received from server");
                throw new Error("No response from server. Please check if the backend service is running.");
            } else {
                // Something happened in setting up the request
                throw new Error(error.message || "Failed to retrieve statistics");
            }
        }
    }

}

export default RecordRetriever;
