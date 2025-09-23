import axios from 'axios';
import { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';

const ProfilePage = ({ userData, loading }) => {
    const [expandedProjects, setExpandedProjects] = useState([]);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

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

    if (loading) {
        return <div>Loading Profile...</div>;
    }

    if (!userData) {
        return <div>Could not load profile data. Please try refreshing.</div>;
    }

    const { user, projects, analyses} = userData;

    return (
        <div className="profile-container">
            <h2>My Profile</h2>
            <div className="profile-section">
                <h3>Account Details</h3>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                <p><strong>Location:</strong> {user.location || 'Not provided'}</p>
            </div>

            <div className="profile-section">
                <h3>Analysis History</h3>
                {analyses && analyses.length > 0 ? (
                    <div className="analysis-history-container">
                        {analyses.map(analysis => (
                            <div key={analysis._id} className="analysis-card">
                                <p className="career-path-result">{analysis.careerPath}</p>
                                <small className="analysis-date">Analyzed on: {new Date(analysis.createdAt).toLocaleDateString()}</small>
                                <p><strong>Based on Projects:</strong></p>
                                <ul>{analysis.projects.map(p => <li key={p._id}>{p.title}</li>)}</ul>
                            </div>
                        ))}
                    </div>
                ) : <p>No career path analyzed yet.</p>}
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
                    <input type="password" placeholder="New Password" name="newPassword" value={passwordData.newPassword} onChange={onPasswordChange} minLength="6" required autoComplete="new-password" />
                    <button type="submit">Update Password</button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;

