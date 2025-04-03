import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


export const useAuth = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();    
    
    const authenticateUser = async (action, username, password) => {
        try {
            console.log(apiEndpoint);
            const response = await axios.post(`${apiEndpoint}/${action}`, { username, password });
            let oneHourAfter = new Date().getTime() + (1 * 60 * 60 * 1000)
            Cookies.set('user', JSON.stringify({ username: response.data.username, token: response.data.token })
                , { expires: oneHourAfter });
            navigate('/home');
            window.location.reload();
        } catch (error) {
            setError(error.response.data.error);
            console.error(error.response.data.error);
        }
    }

    return { authenticateUser, error };
}