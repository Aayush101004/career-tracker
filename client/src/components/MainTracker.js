import axios from 'axios';
import { useEffect, useState } from 'react';
import { analyzeCareers } from '../utils/careerAnalyzer';
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
        setAnalysisResult('');
        setNotification('');

        setTimeout(async () => {
            const result = analyzeCareers(projects);
            setAnalysisResult(result);
            setIsLoading(false);

            try {
                // Collect the IDs of the projects being analyzed
                const projectIds = projects.map(p => p._id);

                // Send both the career result and the project IDs
                await axios.post('/api/users/analysis', {
                    career: result,
                    projectIds: projectIds
                });

                setNotification('Analysis complete and saved to your profile!');
                fetchUserData(); // This tells App.js to refetch all user data
                setTimeout(() => setNotification(''), 5000);
            } catch (err) {
                console.error('Could not save analysis:', err);
                setNotification('Error: Could not save analysis to profile.');
                setTimeout(() => setNotification(''), 5000);
            }
        }, 1500);
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

