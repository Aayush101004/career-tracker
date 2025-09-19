// A simple keyword-based scoring system for career analysis
const careerKeywords = {
    'Machine Learning Engineer / Data Scientist': ['python', 'scikit-learn', 'tensorflow', 'keras', 'prophet', 'xgboost', 'pandas'],
    'Frontend Developer': ['react', 'recharts', 'leaflet', 'react-leaflet', 'drei', 'axios'],
    'Backend Developer': ['python', 'flask', 'node', 'express'],
    'Full-Stack Developer': ['react', 'python', 'flask', 'node', 'express']
};

export const analyzeCareers = (projects) => {
    const scores = {
        'Machine Learning Engineer / Data Scientist': 0,
        'Frontend Developer': 0,
        'Backend Developer': 0,
        'Full-Stack Developer': 0
    };

    // Combine all technologies from all projects into one list
    const allTechs = projects.flatMap(p => p.technologies.map(t => t.toLowerCase().trim()));

    // Score each career path based on keyword matches
    for (const tech of allTechs) {
        for (const career in careerKeywords) {
            if (careerKeywords[career].includes(tech)) {
                scores[career]++;
            }
        }
    }

    // Find the career with the highest score
    let bestCareer = 'General Software Developer';
    let maxScore = 0;
    for (const career in scores) {
        if (scores[career] > maxScore) {
            maxScore = scores[career];
            bestCareer = career;
        }
    }

    // Return the result only if there's a reasonably strong signal
    return maxScore > 1 ? bestCareer : 'Your profile is versatile! Continue adding projects to refine the analysis.';
};