import axios from 'axios';
import { useEffect, useState } from 'react';
// Import FaTrash for the delete icon
import { FaAngleDown, FaEdit, FaSpinner, FaTimes, FaTrash } from 'react-icons/fa';

const ProfilePage = ({ userData, loading }) => {
    // State for the main profile data display
    const [profile, setProfile] = useState(null);

    // State for the edit form
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', country: '', state: '' });
    const [isSaving, setIsSaving] = useState(false);

    // State for password form
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // State for analysis history
    const [analyses, setAnalyses] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Project Accordion State
    const [expandedProjects, setExpandedProjects] = useState([]);

    // --- NEW STATE FOR MODAL AND TOAST ---
    const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, id: null });
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Helper to show a toast message
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000); // Hide after 3 seconds
    };
    // --- END NEW STATE ---


    // Pre-fill profile state and edit form state when userData loads
    useEffect(() => {
        if (userData?.user) {
            setProfile(userData.user);
            setFormData({
                name: userData.user.name || '',
                email: userData.user.email || '',
                country: userData.user.country || '',
                state: userData.user.state || ''
            });
        }
    }, [userData]);

    // Fetch analysis history
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

    const toggleProject = (id) => {
        setExpandedProjects(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
    };

    const onPasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    const onProfileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onPasswordSubmit = async (e) => {
        e.preventDefault();
        setIsChangingPassword(true);
        try {
            await axios.post('/api/users/change-password', passwordData);
            showToast('Password changed successfully!'); // Use toast
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            showToast('Failed to change password. Please check your current password.', 'error'); // Use toast
            console.error(err);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const onProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await axios.put('/api/auth/profile', formData);
            // Update the profile state with the new user data from the API
            setProfile(res.data);
            setEditMode(false);
            showToast('Profile updated successfully!'); // Use toast
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Failed to update profile.';
            showToast(errorMsg, 'error'); // Use toast
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        // Reset form data to match the current profile state
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                country: profile.country || '',
                state: profile.state || ''
            });
        }
    };

    // --- UPDATED DELETE HANDLER ---
    // This just shows the confirmation modal
    const handleDeleteAnalysis = (id) => {
        setShowDeleteConfirm({ show: true, id: id });
    };

    // This runs when the user clicks "Yes, Delete"
    const confirmDelete = async () => {
        const idToDelete = showDeleteConfirm.id;
        if (!idToDelete) return;

        try {
            await axios.delete(`/api/analysis/history/${idToDelete}`);
            // Remove the analysis from state to update the UI
            setAnalyses(prevAnalyses => prevAnalyses.filter(a => a._id !== idToDelete));
            showToast('Analysis deleted successfully');
        } catch (err) {
            console.error('Failed to delete analysis', err);
            showToast('Could not delete analysis. Please try again.', 'error');
        } finally {
            // Hide the modal
            setShowDeleteConfirm({ show: false, id: null });
        }
    };

    // This runs when the user clicks "Cancel"
    const cancelDelete = () => {
        setShowDeleteConfirm({ show: false, id: null });
    };
    // --- END UPDATED DELETE HANDLER ---

    if (loading || !profile) {
        return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading Profile...</div>;
    }

    const { projects } = userData; //

    return (
        <div
            className="profile-container"
            style={{
                backgroundColor: '#1a202c',
                color: '#e2e8f0',
                minHeight: '100vh'
            }}
        >
            {/* --- NEW TOAST COMPONENT --- */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* --- NEW CONFIRMATION MODAL --- */}
            {showDeleteConfirm.show && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <h4>Confirm Deletion</h4>
                        <p>Are you sure you want to delete this analysis? This action cannot be undone.</p>
                        <div className="confirm-modal-actions">
                            <button onClick={cancelDelete} className="modal-btn-cancel">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="modal-btn-delete">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2>My Profile</h2>
            <div className="profile-section">
                <div className="profile-section-header">
                    <h3>Account Details</h3>
                    {!editMode && (
                        <button onClick={() => setEditMode(true)} className="edit-profile-btn">
                            <FaEdit /> Edit
                        </button>
                    )}
                </div>

                {!editMode ? (
                    <div className="profile-details-view">
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Country:</strong> {profile.country || 'Not Set'}</p>
                        <p><strong>State/Region:</strong> {profile.state || 'Not Set'}</p>
                    </div>
                ) : (
                    <form onSubmit={onProfileSubmit} className="profile-edit-form">
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={onProfileChange} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={onProfileChange} required />
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <input type="text" name="country" placeholder="e.g., India, USA" value={formData.country} onChange={onProfileChange} />
                        </div>
                        <div className="form-group">
                            <label>State / Region</label>
                            <input type="text" name="state" placeholder="e.g., California, Maharashtra" value={formData.state} onChange={onProfileChange} />
                        </div>
                        <div className="form-actions">
                            <button type="submit" disabled={isSaving}>
                                {isSaving ? <FaSpinner className="spinner" /> : 'Save Changes'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={handleCancelEdit} disabled={isSaving}>
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </form>
                )}
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
                                {/* --- HEADER AND DELETE BUTTON MOVED --- */}
                                <button
                                    className="delete-analysis-btn"
                                    onClick={() => handleDeleteAnalysis(analysis._id)}
                                    title="Delete this analysis"
                                >
                                    <FaTrash />
                                </button>
                                <br />
                                <br />
                                <h4 className="analysis-card-header">
                                    <span>
                                        Suggested Career: <span className="career-path-highlight">{analysis.careerPath}</span>
                                    </span>
                                </h4>
                                {/* --- END OF HEADER --- */}

                                <p className="analysis-reasoning">{analysis.reasoning}</p>
                                <p><strong>Analyzed On:</strong> {new Date(analysis.createdAt).toLocaleDateString()}</p>
                                <p><strong>Projects Analyzed:</strong></p>
                                <ul>
                                    {analysis.projects.map(project => (
                                        <li key={project._id}>{project.title}</li>
                                    ))}
                                </ul>

                                {analysis.jobLinks && analysis.jobLinks.length > 0 ? (
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
                                ) : (
                                    <p><strong>Job Openings:</strong> No specific job openings were found for this analysis.</p>
                                )}
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
                <form onSubmit={onPasswordSubmit} className="password-change-form">
                    <input type="password" placeholder="Current Password" name="currentPassword" value={passwordData.currentPassword} onChange={onPasswordChange} required autoComplete="current-password" />
                    <input type="password" placeholder="New Password" name="newPassword" value={passwordData.newPassword} minLength="6" required autoComplete="new-password" />
                    <button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? <FaSpinner className="spinner" /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;