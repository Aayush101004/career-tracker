import { useState } from 'react';
import { FaAngleDown, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Female from './Female';
import Man from './Man';

const Navbar = ({ auth, logout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { isAuthenticated, user } = auth;

    const onLogout = () => {
        setDropdownOpen(false);
        logout();
    };

    const getUserIcon = () => {
        if (!user) return <FaUser />;
        switch (user.gender) {
            case 'male':
                return <Man size={24} />;
            case 'female':
                return <Female size={24} />;
            default:
                return <FaUser />;
        }
    };

    const authLinks = (
        <li className="user-info">
            <button
                className={`user-menu-button ${dropdownOpen ? 'open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                {getUserIcon()}
                <span>Welcome, {user ? user.name : ''}</span>
                <span className="dropdown-arrow">
                    <FaAngleDown />
                </span>
            </button>
            {dropdownOpen && (
                <ul className="dropdown-menu">
                    {/* CORRECTED ORDER */}
                    <li>
                        <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                            My Profile
                        </Link>
                    </li>
                    <li>
                        <a href="#!" onClick={onLogout}>
                            Logout
                        </a>
                    </li>
                </ul>
            )}
        </li>
    );

    const guestLinks = (
        <>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
        </>
    );

    return (
        <nav className="navbar">
            <h1>
                <Link to="/">Career Project Tracker</Link>
            </h1>
            {/* ADDED a specific className to this ul */}
            <ul className="navbar-links">{isAuthenticated ? authLinks : guestLinks}</ul>
        </nav>
    );
};

export default Navbar;