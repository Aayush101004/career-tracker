import { FaFileAlt, FaProjectDiagram } from 'react-icons/fa'; // Add new icon
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="home-container">
            <h2>Welcome to Your Career Toolkit</h2>
            <p>Choose a tool to get started.</p>
            <div className="home-options">
                <Link to="/tracker" className="home-card">
                    <FaProjectDiagram size={50} />
                    <h3>Career Project Tracker</h3>
                    <p>Log and manage your personal and professional projects.</p>
                </Link>
                <Link to="/resume-modifier" className="home-card">
                    <FaFileAlt size={50} />
                    <h3>Resume Modifier</h3>
                    <p>Analyze and tailor your resume for a specific job role.</p>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;

