// client/src/components/ProfilePage.js

import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';

const ProfilePage = ({ userData, loading }) => {
    const [expandedProjects, setExpandedProjects] = useState([]);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [analyses, setAnalyses] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const toggleProject = (id) => {
        setExpandedProjects(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
    };
    const onPasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const onPasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/users/change-password', passwordData);
            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            alert('Failed to change password. Please check your current password.');
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchAnalysisHistory = async () => {
            try {
                const res = await axios.get('/api/analysis/history');
                setAnalyses(res.data);
            } catch (err) {
                console.error('Error fetching analysis history:', err);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchAnalysisHistory();
    }, []);

    if (loading) {
        return <div>Loading Profile...</div>;
    }

    if (!userData) {
        return <div>Could not load profile data. Please try refreshing.</div>;
    }

    const { user, projects } = userData;

    return (
        <div
            className="profile-container"
            style={{
                backgroundColor: '#1a202c',
                color: '#e2e8f0',
                minHeight: '100vh'
            }}
        >
            <h2>My Profile</h2>
            <div className="profile-section">
                <h3>Account Details</h3>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>

            <div className="profile-section">
                <h3>Analysis History</h3>
                {loadingHistory ? (
                    <p>Loading history...</p>
                ) : analyses.length === 0 ? (
                    <p>No analysis history found. Analyze your career path from the main page!</p>
                ) : (
                    <div className="analysis-history-container">
                        {analyses.map(analysis => (
                            <div key={analysis._id} className="analysis-card">
                                <h4>
                                    Suggested Career: <span className="career-path-highlight">{analysis.careerPath}</span>
                                </h4>

                                {/* --- UPDATED RENDER LOGIC --- */}
                                <p className="analysis-reasoning">{analysis.reasoning}</p>

                                <p>
                                    <strong>Analyzed On:</strong> {new Date(analysis.createdAt).toLocaleDateString()}
                                </p>
                                <p><strong>Projects Analyzed:</strong></p>
                                <ul>
                                    {analysis.projects.map(project => (
                                        <li key={project._id}>{project.title}</li>
                                    ))}
                                </ul>

                                {analysis.jobLinks && analysis.jobLinks.length > 0 && (
                                    <div className="job-links-container">
                                        <strong>Job Openings Found:</strong>
                                        <ul>
                                            {analysis.jobLinks.map((job, index) => (
                                                <li key={index}>
                                                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="job-link">
                                                        {job.title} at {job.company_name}
                                                    </a>
                                                    <p className="job-snippet">{job.snippet}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* --- END UPDATE --- */}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="profile-section">
                <h3>My Projects ({projects.length})</h3>
                <div className="accordion-container">
                    {projects.map((project) => {
                        const isExpanded = expandedProjects.includes(project._id);
                        return (
                            <div key={project._id} className="project-accordion">
                                <button onClick={() => toggleProject(project._id)} className={`accordion-header ${isExpanded ? 'open' : ''}`}>
                                    {project.title}
                                    <FaAngleDown className="accordion-arrow" />
                                </button>
                                {isExpanded && (
                                    <div className="accordion-content">
                                        <p><strong>Source:</strong> <span className="project-source-text">{project.source}</span></p>
                                        <p><strong>Description:</strong> {project.description}</p>
                                        <p><strong>Technologies:</strong> {project.technologies.join(', ')}</p>
                                        {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="github-btn">View on GitHub</a>}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="profile-section">
                <h3>Change Password</h3>
                <form onSubmit={onPasswordSubmit}>
                    <input type="password" placeholder="Current Password" name="currentPassword" value={passwordData.currentPassword} onChange={onPasswordChange} required autoComplete="current-password" />
                    <input type="password" placeholder="New Password" name="newPassword" value={passwordData.newPassword} minLength="6" required autoComplete="new-password" />
                    <button type="submit">Update Password</button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;