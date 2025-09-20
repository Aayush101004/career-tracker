
function CareerAnalysis({ projects, handleAnalysis, analysisResult, isLoading }) {
    const isButtonDisabled = projects.length < 3;
    const projectsNeeded = 3 - projects.length;

    // Create the hover message for the button's title attribute
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

            {isLoading && <p style={{ marginTop: '1rem' }}>Analyzing...</p>}

            {analysisResult && (
                <div className="analysis-result">
                    <h3>Suggested Career Path:</h3>
                    <p>{analysisResult}</p>
                </div>
            )}
        </div>
    );
}

export default CareerAnalysis;