import axios from 'axios';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

const AddProjectForm = ({ onProjectAdded }) => {
    const [activeTab, setActiveTab] = useState('manual');
    const [formData, setFormData] = useState({ title: '', description: '', technologies: '', githubLink: '' });
    const [githubUrl, setGithubUrl] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const clearNotification = () => setTimeout(() => setNotification({ message: '', type: '' }), 5000);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ message: '', type: '' });
        try {
            const body = {
                ...formData,
                technologies: formData.technologies.split(',').map(tech => tech.trim()),
            };
            await axios.post('/projects/add', body);
            setFormData({ title: '', description: '', technologies: '', githubLink: '' });
            onProjectAdded();
            setNotification({ message: 'Project added manually!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Failed to add project.', type: 'error' });
        } finally {
            setLoading(false);
            clearNotification();
        }
    };

    const handleGithubSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ message: '', type: '' });
        try {
            await axios.post('/api/import/github', { url: githubUrl });
            setGithubUrl('');
            onProjectAdded();
            setNotification({ message: 'Project imported from GitHub!', type: 'success' });
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Failed to import from GitHub.';
            setNotification({ message: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
            clearNotification();
        }
    };

    const handleResumeSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            setNotification({ message: 'Please select a resume file.', type: 'error' });
            clearNotification();
            return;
        }
        setLoading(true);
        setNotification({ message: '', type: '' });
        const resumeFormData = new FormData();
        resumeFormData.append('resume', resumeFile);

        try {
            await axios.post('/api/import/resume', resumeFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumeFile(null);
            document.getElementById('resume-input').value = null; // Clear file input
            onProjectAdded();
            setNotification({ message: 'Projects imported from resume!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Failed to parse resume.', type: 'error' });
        } finally {
            setLoading(false);
            clearNotification();
        }
    };

    return (
        <div className="add-project-container">
            <h3>Add New Project</h3>
            <div className="tabs">
                <button className={activeTab === 'manual' ? 'active' : ''} onClick={() => setActiveTab('manual')}>Manual</button>
                <button className={activeTab === 'github' ? 'active' : ''} onClick={() => setActiveTab('github')}>From GitHub</button>
                <button className={activeTab === 'resume' ? 'active' : ''} onClick={() => setActiveTab('resume')}>From Resume</button>
            </div>

            <div className="tab-content">
                {notification.message && <div className={`notification ${notification.type}`}>{notification.message}</div>}

                {activeTab === 'manual' && (
                    <form onSubmit={handleManualSubmit}>
                        <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                        <input type="text" placeholder="Technologies (comma-separated)" value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} required />
                        <input type="url" placeholder="GitHub Link (optional)" value={formData.githubLink} onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })} />
                        <button type="submit" disabled={loading}>{loading ? <FaSpinner className="spinner" /> : 'Add Project'}</button>
                    </form>
                )}

                {activeTab === 'github' && (
                    <form onSubmit={handleGithubSubmit}>
                        <input type="url" placeholder="Enter public GitHub repository URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required />
                        <button type="submit" disabled={loading}>{loading ? <FaSpinner className="spinner" /> : 'Fetch Project'}</button>
                    </form>
                )}

                {activeTab === 'resume' && (
                    <form onSubmit={handleResumeSubmit}>
                        <div className="file-input-container">
                            <label htmlFor="resume-input" className="file-label">
                                {resumeFile ? resumeFile.name : 'Choose a resume file...'}
                            </label>
                            <input id="resume-input" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
                        </div>
                        <button type="submit" disabled={loading}>{loading ? <FaSpinner className="spinner" /> : 'Upload & Parse Projects'}</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddProjectForm;
