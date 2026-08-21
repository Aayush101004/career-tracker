import axios from 'axios';
import { useState } from 'react';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

const ResumeModifier = () => {
    const [file, setFile] = useState(null);
    const [jobRole, setJobRole] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisVisible, setAnalysisVisible] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- NEW VALIDATION LOGIC ---
        if (!file && !jobRole) {
            setError('Please upload a resume and provide a job role.');
            return;
        } else if (!file && jobRole) {
            setError('Please upload a resume file.');
            return;
        } else if (file && !jobRole) {
            setError('Please provide a job role.');
            return;
        }
        // ----------------------------

        setLoading(true);
        setError('');
        setAnalysis(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobRole', jobRole);

        try {
            const res = await axios.post('/api/resume/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAnalysis(res.data.data); 
            setAnalysisVisible(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to analyze resume.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setAnalysisVisible(false);
        setAnalysis(null);
        setFile(null);
        setJobRole('');
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#4caf50'; 
        if (score >= 60) return '#ff9800'; 
        return '#f44336'; 
    };

    return (
        <div className="resume-modifier-container">
            {!analysisVisible ? (
                <>
                    <h2>Resume Modifier</h2>
                    <p>Upload your resume and paste a job description to get tailored feedback.</p>
                    
                    {/* The error message will render here if triggered */}
                    {error && <div className="notification error">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="resume-form">
                        <input
                            type="text"
                            placeholder="Enter Target Job Role (e.g., Senior Frontend Developer)"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            // Note: Removed 'required' attribute here to allow custom React validation to fire
                        />
                        <div className="file-input-container">
                            <label htmlFor="resume-input" className="file-label">
                                {file ? file.name : 'Choose your resume (PDF)...'}
                            </label>
                            <input
                                id="resume-input"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                // Note: Removed 'required' attribute here as well
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : 'Modify and Analyze Resume'}
                        </button>
                    </form>
                </>
            ) : (
                analysis && (
                    <div className="questions-results-container">
                        <button onClick={handleBack} className="back-button">
                            <FaArrowLeft />
                        </button>
                        
                        <h3>Resume Analysis</h3>

                        <div style={{ textAlign: 'center', margin: '20px 0', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Simulated ATS Match</h4>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: getScoreColor(analysis.atsScore) }}>
                                {analysis.atsScore}%
                            </div>
                        </div>

                        <div className="points-columns">
                            <div className="good-points">
                                <h4>What's good (Recruiter View):</h4>
                                <ul>
                                    {(analysis.recruiterGoodPoints || []).map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bad-points">
                                <h4>To improve (Red Flags):</h4>
                                <ul>
                                    {(analysis.recruiterBadPoints || []).map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default ResumeModifier;