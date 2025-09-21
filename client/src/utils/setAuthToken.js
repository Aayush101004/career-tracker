import axios from 'axios';

if (process.env.REACT_APP_API_URL) {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;
}

const setAuthToken = token => {
    if (token) {
        // Apply authorization token to every request if logged in
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        // Delete auth header
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

export default setAuthToken;

