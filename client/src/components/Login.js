import axios from 'axios';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import setAuthToken from '../utils/setAuthToken';

const Login = ({ loginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { email, password });

            // Use sessionStorage to store the token for the current session only
            sessionStorage.setItem('token', res.data.token);
            setAuthToken(res.data.token);
            loginSuccess();
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Could not connect to the server.';
            alert(`Login Failed: ${errorMsg}`);
            console.error(err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
                <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
                <button type="submit" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : 'Login'}
                </button>
            </form>
            <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
    );
};

export default Login;

