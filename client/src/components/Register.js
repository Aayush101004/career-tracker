import axios from 'axios';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa'; // Import the spinner icon
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
        gender: '',
        country: '',
        state: ''
    });

    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate();
    const { name, email, password, password2, gender, country, state } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setNotification({ message: '', type: '' });
        setLoading(true); // Set loading to true

        if (password !== password2) {
            setNotification({ message: 'Passwords do not match', type: 'error' });
            setLoading(false); // Stop loading on client-side error
            return;
        }

        try {
            // Include all form fields in the body
            const body = { name, email, password, gender, country, state };

            // Clean up optional fields
            if (!gender) delete body.gender;
            if (!country) delete body.country;
            if (!state) delete body.state;


            await axios.post('/api/auth/register', body);

            setNotification({ message: 'User registered successfully!', type: 'success' });
            // Clear all fields on success
            setFormData({ name: '', email: '', password: '', password2: '', gender: '', country: '', state: '' });

        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'User may already exist.';
            setNotification({ message: `Registration failed: ${errorMsg}`, type: 'error' });
            console.error(err.response ? err.response.data : err.message);
        } finally {
            setLoading(false); // Set loading to false when done
        }
    };

    return (
        <div className="auth-container">
            <h1>Sign Up</h1>

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
                    <label htmlFor="gender">Gender (Optional)</label>
                    <select name="gender" value={gender} onChange={onChange}>
                        <option value="">-- Select an option --</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Rather not say</option>
                    </select>
                </div>
                <input
                    type="text"
                    placeholder="Country (Optional)"
                    name="country"
                    value={country}
                    onChange={onChange}
                />
                <input
                    type="text"
                    placeholder="State / Region (Optional)"
                    name="state"
                    value={state}
                    onChange={onChange}
                />
                <button type="submit" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : 'Register'}
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
};

export default Register;