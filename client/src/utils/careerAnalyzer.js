// Expanded keywords for more accurate analysis
const careerKeywords = {
    'Machine Learning Engineer / Data Scientist': [
        'python', 'scikit-learn', 'tensorflow', 'keras', 'prophet', 'xgboost', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'pytorch'
    ],
    'Frontend Developer': [
        'react', 'recharts', 'leaflet', 'react-leaflet', 'drei', 'axios', 'javascript', 'html', 'css', 'typescript', 'vue', 'angular', 'redux', 'webpack'
    ],
    'Backend Developer': [
        'python', 'flask', 'node', 'express', 'java', 'spring', 'c#', '.net', 'ruby', 'rails', 'php', 'laravel', 'sql', 'mysql', 'postgresql', 'mongodb', 'rest api'
    ],
    'Full-Stack Developer': [
        'react', 'python', 'flask', 'node', 'express', 'javascript', 'typescript', 'mongodb', 'sql'
    ],
    'DevOps / Cloud Engineer': [
        'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins', 'terraform', 'ansible', 'ci/cd'
    ]
};

export const analyzeCareers = (projects) => {
    const scores = {
        'Machine Learning Engineer / Data Scientist': 0,
        'Frontend Developer': 0,
        'Backend Developer': 0,
        'Full-Stack Developer': 0,
        'DevOps / Cloud Engineer': 0
    };

    // Combine all technologies from all projects into one list, making them lowercase and trimming whitespace
    const allTechs = projects.flatMap(p =>
        p.technologies.map(t => t.toLowerCase().trim())
    );

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

    // THE FIX: Changed the condition from maxScore > 1 to maxScore > 0
    // Now, as long as at least one relevant technology is found, it will suggest the top match.
    return maxScore > 0 ? bestCareer : 'Your profile is versatile! Add more projects with specific technologies to refine the analysis.';
};