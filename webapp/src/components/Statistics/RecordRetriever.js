import axios from "axios";

class RecordRetriever {
    constructor(){
        this.apiUrl = (process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000') + "/statistics";
        
    }

    async getRecords(user, token) {
        try {
            const response = await axios.get(this.apiUrl + '/' + user, { headers : {'token':token}});
            const receivedRecords = await response.data;
            return receivedRecords.record;
        } catch (error) {
            throw new Error(error);
            
        }
    }
}

export default RecordRetriever;