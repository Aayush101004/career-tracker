import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import setAuthToken from '../utils/setAuthToken';

const Login = ({ loginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', { email, password });

            localStorage.setItem('token', res.data.token);
            setAuthToken(res.data.token);
            loginSuccess();
            navigate('/');
        } catch (err) {
            // --- IMPROVED ERROR HANDLING ---
            // Check if the error has a response from the server
            if (err.response && err.response.data) {
                // Log the specific error from the backend
                console.error(err.response.data);
                const errorMsg = err.response.data.errors.map(e => e.msg).join(', ');
                alert(`Login Failed: ${errorMsg}`);
            } else {
                // Handle network errors or other issues
                console.error('An unexpected error occurred:', err.message);
                alert('Login Failed: Could not connect to the server.');
            }
        }
    };

    return (
        <div className="auth-container">
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
                <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
    );
};

export default Login;

