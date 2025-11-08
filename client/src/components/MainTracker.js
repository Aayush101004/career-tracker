import axios from 'axios';
import { useEffect, useState } from 'react';
import AddProjectForm from './AddProjectForm';
import CareerAnalysis from './careerAnalysis';
import ProjectList from './ProjectList';

const MainTracker = ({ fetchUserData }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null); // Changed initial state to null
    const [notification, setNotification] = useState('');

    // New state for loading messages
    const [analysisStatus, setAnalysisStatus] = useState('');

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
        setAnalysisStatus('Analyzing technologies...'); // Initial status

        // 1. Combine all technologies from all projects
        const allTechs = projects.flatMap(p => p.technologies);

        // 2. Projects to save (only id and title)
        const projectsToSave = projects.map(p => ({ _id: p._id, title: p.title }));

        // 3. Set up headers
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // 4. Create the request body
        const body = JSON.stringify({ technologies: allTechs, projects: projectsToSave });

        try {
            // 5. Call the API endpoint
            setAnalysisStatus('Calling AI for career suggestion...');
            const res = await axios.post('/api/analysis/career', body, config);

            // 6. Set the result
            setAnalysisStatus('Fetching relevant job openings...');

            // Simulate a small delay if needed, or just set result
            // In a real app, you'd get this status from backend logs
            setAnalysisResult(res.data);
            setAnalysisStatus(''); // Clear status on success

        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Could not analyze career path. Please try again.';
            console.error(err.response ? err.response.data : err.message);

            // --- THIS IS THE FIX ---
            // Set an error OBJECT, not a string
            setAnalysisResult({ error: errorMsg });
            // -----------------------

            setAnalysisStatus(''); // Clear status on error
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
                    analysisStatus={analysisStatus} // Pass the new status prop
                />
            )}
        </>
    );
};

export default MainTracker;