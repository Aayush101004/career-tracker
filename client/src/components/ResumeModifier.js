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
        if (!file || !jobRole) {
            setError('Please upload a resume and provide a job role.');
            return;
        }
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
            setAnalysis(res.data);
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

    return (
        <div className="resume-modifier-container">

            {!analysisVisible ? (
                <>
                    <h2>Resume Modifier</h2>
                    <p>Upload your resume and paste a job description to get tailored feedback.</p>
                    {error && <div className="notification error">{error}</div>}
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
                                {file ? file.name : 'Choose your resume (PDF)...'}
                            </label>
                            <input
                                id="resume-input"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                required
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
                        <div className="points-columns">
                            <div className="good-points">
                                <h4>What's good:</h4>
                                <ul>
                                    {(analysis.goodPoints || []).map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bad-points">
                                <h4>To improve:</h4>
                                <ul>
                                    {(analysis.badPoints || []).map((point, index) => (
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