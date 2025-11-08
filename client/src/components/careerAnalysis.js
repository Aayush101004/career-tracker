import { FaSpinner } from 'react-icons/fa'; // Import a spinner

// Styles for the job links
const jobLinkStyle = {
    display: 'block',
    padding: '8px 0',
    color: '#00BFFF',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '1.1rem'
};

const jobCompanyStyle = {
    color: '#e2e8f0',
    fontSize: '1rem',
    marginTop: '-5px'
}

const snippetStyle = {
    fontSize: '0.9rem',
    color: '#a0aec0',
    marginBottom: '10px'
};

// New style for the loading status container
const loadingContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px', // Reduced space between spinner and text
    marginTop: '0.6rem',
    justifyContent: 'center'
};

const loadingTextStyle = {
    color: '#00BFFF',
    /* Light text color */
    fontSize: '0.95rem',
    fontStyle: 'italic',
    margin: 0
};

// Pass new props: isLoading and analysisStatus
function CareerAnalysis({ projects, handleAnalysis, analysisResult, isLoading, analysisStatus }) {
    const isButtonDisabled = projects.length < 3 || isLoading; // Also disable when loading
    const projectsNeeded = 3 - projects.length;

    const buttonTitle = isButtonDisabled && projects.length < 3
        ? `Add ${projectsNeeded} more project(s) to enable analysis.`
        : 'Analyze your career path';

    return (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
                onClick={handleAnalysis}
                disabled={isButtonDisabled}
                title={buttonTitle}
            >
                {isLoading ? 'Analyzing...' : 'Analyze Career Path'}
            </button>

            {/* --- UPDATED LOADING INDICATOR --- */}
            {isLoading && (
                <div style={loadingContainerStyle}>
                    <span style={loadingTextStyle}>{analysisStatus || 'Loading...'}</span>
                    <FaSpinner className="spinner" size={14} />
                </div>
            )}

            {analysisResult && !isLoading && (
                <div className="analysis-result" style={{ textAlign: 'left', maxWidth: '600px', margin: '2rem auto' }}>

                    {/* This error check will NOW work correctly */}
                    {analysisResult.error ? (
                        <p style={{ color: 'red', textAlign: 'center' }}>{analysisResult.error}</p>
                    ) : (
                        <>
                            <h3>Suggested Career Path:</h3>
                            <p style={{ fontSize: '1.25rem', color: '#00BFFF', fontWeight: '600' }}>
                                {analysisResult.suggestedCareer}
                            </p>
                            <p style={{ color: '#e2e8f0', fontStyle: 'italic' }}>{analysisResult.reasoning}</p>

                            {analysisResult.jobLinks && analysisResult.jobLinks.length > 0 ? (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4>Current Job Openings:</h4>
                                    {analysisResult.jobLinks.map((job, index) => (
                                        <div key={index} style={{ borderTop: '1px solid #4a5568', paddingTop: '10px', marginBottom: '10px' }}>
                                            <a href={job.url} target="_blank" rel="noopener noreferrer" style={jobLinkStyle}>
                                                {job.title}
                                            </a>
                                            <p style={jobCompanyStyle}>{job.company_name}</p>
                                            <p style={snippetStyle}>{job.snippet}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Added this to handle cases where no jobs are found
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4>Current Job Openings:</h4>
                                    <p style={{ color: '#a0aec0' }}>No job openings found for this career path in your specified country. You can update your country in the Profile page.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default CareerAnalysis;