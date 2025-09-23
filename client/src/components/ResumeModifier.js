import axios from 'axios';
import { useState } from 'react';
import { FaSpinner, FaThumbsDown, FaThumbsUp } from 'react-icons/fa';

const ResumeModifier = () => {
    const [jobRole, setJobRole] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState('');

    const clearNotification = () => setTimeout(() => setNotification(''), 5000);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile || !jobRole) {
            setNotification('Please provide both a job role and a resume file.');
            clearNotification();
            return;
        }
        setLoading(true);
        setAnalysisResult(null);
        setNotification('');

        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobRole', jobRole);

        try {
            const res = await axios.post('/api/resume/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAnalysisResult(res.data);
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Failed to analyze resume.';
            setNotification(errorMsg);
            clearNotification();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resume-modifier-container">
            <h2>AI-Powered Resume Modifier</h2>
            <p>Upload your resume and provide a target job role to get feedback on how to improve it.</p>

            {notification && <div className="notification error">{notification}</div>}

            <form onSubmit={handleSubmit} className="resume-form">
                <input
                    type="text"
                    placeholder="Enter Target Job Role (e.g., Senior Frontend Developer)"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                />
                <div className="file-input-container">
                    <label htmlFor="resume-input" className="file-label">
                        {resumeFile ? resumeFile.name : 'Choose your resume (PDF)...'}
                    </label>
                    <input
                        id="resume-input"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : 'Modify & Analyze Resume'}
                </button>
            </form>

            {analysisResult && (
                <div className="analysis-results-container">
                    <h3>Analysis for '{jobRole}'</h3>
                    <div className="points-section good-points">
                        <h4><FaThumbsUp /> Good Points</h4>
                        <ul>
                            {analysisResult.goodPoints.map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                    <div className="points-section bad-points">
                        <h4><FaThumbsDown /> Areas for Improvement</h4>
                        <ul>
                            {analysisResult.badPoints.map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeModifier;
