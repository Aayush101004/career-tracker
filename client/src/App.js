// src/App.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';
import AddProjectForm from './components/AddProjectForm';
import ProjectList from './components/ProjectList';
import CareerAnalysis from './components/careerAnalysis'; // 1. Import the new component
import { analyzeCareers } from './utils/careerAnalyzer';

function App() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  const fetchProjects = () => {
    axios.get('http://localhost:5001/projects')
      .then(response => {
        setProjects(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the projects!", error);
      });
  };

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAnalysis = () => {
    setIsLoading(true);
    setAnalysisResult(''); // Clear previous results

    // Simulate a thinking process for better UX
    setTimeout(() => {
      const result = analyzeCareers(projects);
      setAnalysisResult(result);
      setIsLoading(false);
    }, 1500); // 1.5 second delay
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Career Project Tracker</h1>
      </header>
      <main>
        <AddProjectForm onProjectAdded={fetchProjects} />
        <ProjectList projects={projects} fetchProjects={fetchProjects} />

        {/* 5. Add the new component to the page */}
        <CareerAnalysis
          projects={projects}
          handleAnalysis={handleAnalysis}
          analysisResult={analysisResult}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;