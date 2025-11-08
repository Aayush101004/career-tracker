// client/src/components/careerAnalysis.js


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


function CareerAnalysis({ projects, handleAnalysis, analysisResult, isLoading }) {
    const isButtonDisabled = projects.length < 3;
    const projectsNeeded = 3 - projects.length;

    const buttonTitle = isButtonDisabled
        ? `Add ${projectsNeeded} more project(s) to enable analysis.`
        : 'Analyze your career path';

    return (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
                onClick={handleAnalysis}
                disabled={isButtonDisabled}
                title={buttonTitle}
            >
                Analyze Career Path
            </button>

            {isLoading && <div className="loader"></div>}

            {analysisResult && !isLoading && (
                <div className="analysis-result" style={{ textAlign: 'left', maxWidth: '600px', margin: '2rem auto' }}>
                    {analysisResult.error ? (
                        <p style={{ color: 'red' }}>{analysisResult.error}</p>
                    ) : (
                        <>
                            <h3>Suggested Career Path:</h3>
                            <p style={{ fontSize: '1.25rem', color: '#00BFFF', fontWeight: '600' }}>
                                {analysisResult.suggestedCareer}
                            </p>
                            <p style={{ color: '#e2e8f0', fontStyle: 'italic' }}>{analysisResult.reasoning}</p>

                            {analysisResult.jobLinks && analysisResult.jobLinks.length > 0 && (
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
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default CareerAnalysis;