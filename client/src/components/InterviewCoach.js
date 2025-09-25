import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaBrain, FaCode, FaMicrophone, FaPaperPlane, FaProjectDiagram, FaSpinner, FaStopCircle } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const InterviewCoach = () => {
    const [jobRole, setJobRole] = useState('');
    const [userProjects, setUserProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [generatedQuestions, setGeneratedQuestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState('');

    // State for the interactive parts
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
    const [feedback, setFeedback] = useState({});
    const [isEvaluating, setIsEvaluating] = useState(null);

    // Speech recognition hooks
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        // Fetch projects on component mount
        const fetchProjects = async () => {
            try {
                const res = await axios.get('/projects');
                setUserProjects(res.data);
            } catch (err) { console.error("Could not fetch projects", err); }
        };
        fetchProjects();
    }, []);

    if (!browserSupportsSpeechRecognition) {
        return <div className="notification error">Your browser does not support speech recognition. Please try Google Chrome.</div>;
    }

    const handleProjectSelection = (projectId) => {
        setSelectedProjects(prev => prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]);
    };

    const handleGenerateQuestions = async (e) => {
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
            const res = await axios.post('/api/interview/prepare', { jobRole, projectIds: selectedProjects });
            setGeneratedQuestions(res.data);
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Failed to generate questions.';
            setNotification(errorMsg);
            setTimeout(() => setNotification(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleStartRecording = (index) => {
        resetTranscript();
        setActiveQuestionIndex(index);
        setFeedback(prev => ({ ...prev, [index]: null })); // Clear old feedback for this question
        SpeechRecognition.startListening({ continuous: true });
    };

    const handleStopRecording = () => {
        SpeechRecognition.stopListening();
    };

    const handleSubmitAnswer = async (question) => {
        if (!transcript) {
            alert("Please record an answer first.");
            return;
        }
        setIsEvaluating(activeQuestionIndex);
        try {
            const res = await axios.post('/api/interview/evaluate', { question, answer: transcript });
            setFeedback(prev => ({ ...prev, [activeQuestionIndex]: res.data }));
        } catch (err) {
            console.error("Failed to evaluate answer", err);
            setFeedback(prev => ({ ...prev, [activeQuestionIndex]: { error: "Could not get feedback." } }));
        } finally {
            setIsEvaluating(null);
        }
    };

    const getFundamentalsTitle = (role) => {
        const aiKeywords = ['ai', 'machine learning', 'ml', 'data scientist', 'analyst'];
        return aiKeywords.some(keyword => role.toLowerCase().includes(keyword)) ? 'AI / ML Fundamentals' : 'CS Fundamentals';
    };

    // Helper to render a list of questions with interactive elements
    const renderQuestionList = (questions, category) => {
        return (questions || []).map((q, index) => {
            const globalIndex = `${category}-${index}`;
            const isCurrent = activeQuestionIndex === globalIndex;
            const currentFeedback = feedback[globalIndex];

            return (
                <li key={globalIndex} className="question-item">
                    <p>{q}</p>
                    <div className="answer-section">
                        <div className="controls">
                            <button onClick={() => isCurrent && listening ? handleStopRecording() : handleStartRecording(globalIndex)} className={`mic-btn ${isCurrent && listening ? 'recording' : ''}`}>
                                {isCurrent && listening ? <FaStopCircle /> : <FaMicrophone />}
                                {isCurrent && listening ? ' Stop' : ' Answer'}
                            </button>
                            {isCurrent && transcript && !listening && (
                                <button onClick={() => handleSubmitAnswer(q)} className="submit-answer-btn" disabled={isEvaluating === globalIndex}>
                                    {isEvaluating === globalIndex ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
                                    &nbsp;Get Feedback
                                </button>
                            )}
                        </div>
                        {isCurrent && <p className="transcript"><strong>Your Answer:</strong> {transcript || "..."}</p>}

                        {isEvaluating === globalIndex && <div className="spinner-overlay-small"><FaSpinner className="spinner" /></div>}

                        {currentFeedback && !isEvaluating && (
                            <div className={`feedback-container ${currentFeedback.error ? 'error' : ''}`}>
                                {currentFeedback.error ? <p>{currentFeedback.error}</p> : (
                                    <>
                                        <div className="feedback-header">
                                            <strong>AI Feedback:</strong>
                                            <div className="score-circle">{currentFeedback.score}/10</div>
                                        </div>
                                        <p>{currentFeedback.feedback}</p>
                                        <div className="points-columns">
                                            <div className="good-points"><strong>What went well:</strong><ul>{(currentFeedback.goodPoints || []).map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                                            <div className="bad-points"><strong>To improve:</strong><ul>{(currentFeedback.improvementPoints || []).map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </li>
            );
        });
    };

    return (
        <div className="interview-coach-container">
            <h2>AI Interview Coach</h2>
            <p>Practice your interview answers and get instant AI-powered feedback.</p>
            {notification && <div className="notification error">{notification}</div>}
            <form onSubmit={handleGenerateQuestions} className="coach-form">
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
                    <div className="points-section"><h4><FaProjectDiagram /> Technical & Project Deep Dive</h4><ul>{renderQuestionList(generatedQuestions.technicalQuestions, 'tech')}</ul></div>
                    <div className="points-section"><h4><FaBrain /> Behavioral Questions</h4><ul>{renderQuestionList(generatedQuestions.behavioralQuestions, 'behav')}</ul></div>
                    <div className="points-section"><h4><FaCode /> {getFundamentalsTitle(jobRole)}</h4><ul>{renderQuestionList(generatedQuestions.fundamentalQuestions, 'fund')}</ul></div>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;

