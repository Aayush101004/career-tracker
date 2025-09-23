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
                return <Man size={20} />;
            case 'female':
                return <Female size={20} />;
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
                <span>Welcome, {user ? user.name : ''}</span>
                {getUserIcon()}
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

    return (
        <nav className="navbar">
            <h1>
                <Link to="/">Stepwise</Link>
            </h1>
            {/* ADDED a specific className to this ul */}
            <ul className="navbar-links">{isAuthenticated ? authLinks : ""}</ul>
        </nav>
    );
};

export default Navbar;