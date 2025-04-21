import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


export const useAuth = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();    
    localStorage.removeItem('topic'); // Clear the topic from local storage on every login/logout
    localStorage.removeItem('customSettings'); // Clear the custom settings from local storage on every login/logout
    
    const authenticateUser = async (action, username, password, confirmpassword) => {
        try {
            const payload = action === 'addUser'
            ? { username, password, confirmpassword }
            : { username, password };

            const response = await axios.post(`${apiEndpoint}/${action}`, payload);

            let oneHourAfter = new Date().getTime() + (1 * 60 * 60 * 1000)
            Cookies.set('user', JSON.stringify({ username: response.data.username, token: response.data.token })
                , { expires: oneHourAfter });
            navigate('/home');
            window.location.reload();
        } catch (error) {
            const message =
            error?.response?.data?.error ??
            error?.message ??
            'An unknown error occurred';
            setError(String(message));
            console.error(message);
        }
    }

    return { authenticateUser, error };
}