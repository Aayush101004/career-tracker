import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
        gender: ''
    });

    // State to hold notification messages (e.g., for success or error)
    const [notification, setNotification] = useState({ message: '', type: '' });

    const navigate = useNavigate();
    const { name, email, password, password2, gender } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setNotification({ message: '', type: '' }); // Clear previous notifications

        if (password !== password2) {
            // Set an error notification instead of an alert
            setNotification({ message: 'Passwords do not match', type: 'error' });
            return;
        }

        try {
            const body = { name, email, password };
            if (gender) {
                body.gender = gender;
            }

            await axios.post('/api/auth/register', body);

            // Set a success notification
            setNotification({ message: 'User registered successfully!', type: 'success' });

            // Clear the form after successful registration
            setFormData({ name: '', email: '', password: '', password2: '', gender: '' });

        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'User may already exist.';
            // Set an error notification
            setNotification({ message: `Registration failed: ${errorMsg}`, type: 'error' });
            console.error(err.response ? err.response.data : err.message);
        }
    };

    return (
        <div className="auth-container">
            <h1>Sign Up</h1>

            {/* Render the notification message if it exists */}
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                    {notification.type === 'success' && (
                        <Link to="/login" className="notification-link"> Proceed to Login</Link>
                    )}
                </div>
            )}

            <form onSubmit={onSubmit} autoComplete="off">
                <input
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                />
                <input
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={email}
                    onChange={onChange}
                    autoComplete="off"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    minLength="6"
                    autoComplete="new-password"
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    name="password2"
                    value={password2}
                    onChange={onChange}
                    minLength="6"
                    autoComplete="new-password"
                    required
                />

                <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select name="gender" value={gender} onChange={onChange} required>
                        <option value="" disabled>-- Select an option --</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Rather not say</option>
                    </select>
                </div>

                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
};

export default Register;

