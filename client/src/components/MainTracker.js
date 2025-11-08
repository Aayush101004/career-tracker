import axios from 'axios';
import { useEffect, useState } from 'react';
import AddProjectForm from './AddProjectForm';
import CareerAnalysis from './careerAnalysis';
import ProjectList from './ProjectList';

const MainTracker = ({ fetchUserData }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [notification, setNotification] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await axios.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error("There was an error fetching the projects!", err);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleAnalysis = async () => {
        setIsLoading(true);
        setAnalysisResult(null);

        // 1. Combine all technologies from all projects
        const allTechs = projects.flatMap(p => p.technologies);

        // 2. Projects to save (only id and title to keep payload small)
        const projectsToSave = projects.map(p => ({ _id: p._id, title: p.title }));

        // 3. Set up headers
        const config = {
            headers: {
                'Content-Type': 'application/json'
                // Auth token should be set globally by your setAuthToken util
            }
        };

        // 4. Create the request body with technologies AND projects
        const body = JSON.stringify({ technologies: allTechs, projects: projectsToSave });

        try {
            // 5. Call the API endpoint
            const res = await axios.post('/api/analysis/career', body, config);

            // 6. Set the result from the AI's response
            setAnalysisResult(res.data);

        } catch (err) {
            console.error(err.response ? err.response.data.msg : err.message);
            setAnalysisResult('Error: Could not analyze career path.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AddProjectForm onProjectAdded={fetchProjects} />
            <ProjectList projects={projects} fetchProjects={fetchProjects} />

            {notification && <div className="notification">{notification}</div>}

            {projects.length > 0 && (
                <CareerAnalysis
                    projects={projects}
                    handleAnalysis={handleAnalysis}
                    analysisResult={analysisResult}
                    isLoading={isLoading}
                />
            )}
        </>
    );
};

export default MainTracker;

