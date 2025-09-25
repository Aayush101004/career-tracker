import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaBrain, FaCode, FaProjectDiagram, FaSpinner } from 'react-icons/fa';

const InterviewCoach = () => {
    const [jobRole, setJobRole] = useState('');
    const [userProjects, setUserProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [generatedQuestions, setGeneratedQuestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get('/projects');
                setUserProjects(res.data);
            } catch (err) {
                console.error("Could not fetch projects", err);
            }
        };
        fetchProjects();
    }, []);

    const handleProjectSelection = (projectId) => {
        setSelectedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jobRole || selectedProjects.length === 0) {
            setNotification('Please provide a job role and select at least one project.');
            setTimeout(() => setNotification(''), 5000);
            return;
        }
        setLoading(true);
        setGeneratedQuestions(null);
        setNotification('');

        try {
            const res = await axios.post('/api/interview/prepare', {
                jobRole,
                projectIds: selectedProjects
            });
            setGeneratedQuestions(res.data);
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Failed to generate questions.';
            setNotification(errorMsg);
            setTimeout(() => setNotification(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const getFundamentalsTitle = (role) => {
        const aiKeywords = ['ai', 'machine learning', 'ml', 'data scientist', 'analyst'];
        const isAiRole = aiKeywords.some(keyword => role.toLowerCase().includes(keyword));
        return isAiRole ? 'AI / ML Fundamentals' : 'CS Fundamentals';
    };


    return (
        <div className="interview-coach-container">
            <h2>AI Interview Coach</h2>
            <p>Get personalized interview questions based on your projects for any job role.</p>

            {notification && <div className="notification error">{notification}</div>}

            <form onSubmit={handleSubmit} className="coach-form">
                <div className="form-section">
                    <h4>1. Target Job Role</h4>
                    <input
                        type="text"
                        placeholder="Enter the Job Role (e.g., 'React Native Developer', 'AI Engineer')"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        required
                    />
                </div>

                <div className="form-section">
                    <h4>2. Select Relevant Projects</h4>
                    <div className="project-selection-list">
                        {userProjects.length > 0 ? userProjects.map(p => (
                            <div key={p._id} className="project-checkbox">
                                <input
                                    type="checkbox"
                                    id={p._id}
                                    value={p._id}
                                    checked={selectedProjects.includes(p._id)}
                                    onChange={() => handleProjectSelection(p._id)}
                                />
                                <label htmlFor={p._id}>{p.title}</label>
                            </div>
                        )) : <p>No projects found. Please add projects in the Career Project Tracker first.</p>}
                    </div>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : 'Generate Questions'}
                </button>
            </form>

            {generatedQuestions && (
                <div className="questions-results-container">
                    <h3>Generated Questions for '{jobRole}'</h3>

                    <div className="points-section">
                        <h4><FaProjectDiagram /> Technical & Project Deep Dive</h4>
                        <ul>
                            {(generatedQuestions.technicalQuestions || []).map((q, i) => <li key={`tech-${i}`}>{q}</li>)}
                        </ul>
                    </div>

                    <div className="points-section">
                        <h4><FaBrain /> Behavioral Questions</h4>
                        <ul>
                            {(generatedQuestions.behavioralQuestions || []).map((q, i) => <li key={`behav-${i}`}>{q}</li>)}
                        </ul>
                    </div>

                    {/* This section will now populate correctly */}
                    <div className="points-section">
                        <h4><FaCode /> {getFundamentalsTitle(jobRole)}</h4>
                        <ul>
                            {(generatedQuestions.fundamentalQuestions || []).map((q, i) => <li key={`fund-${i}`}>{q}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;

