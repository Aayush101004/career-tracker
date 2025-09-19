
function CareerAnalysis({ projects, handleAnalysis, analysisResult, isLoading }) {
    const isButtonDisabled = projects.length < 3;

    return (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button onClick={handleAnalysis} disabled={isButtonDisabled}>
                Analyze Career Path
            </button>
            {isButtonDisabled && (
                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                    Add {3 - projects.length} more project(s) to enable analysis.
                </p>
            )}

            {isLoading && <p style={{ marginTop: '1rem' }}>Analyzing...</p>}

            {analysisResult && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #61dafb', borderRadius: '5px' }}>
                    <h3>Suggested Career Path:</h3>
                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{analysisResult}</p>
                </div>
            )}
        </div>
    );
}

export default CareerAnalysis;