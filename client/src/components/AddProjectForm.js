// client/src/components/AddProjectForm.js
import axios from 'axios';
import { useState } from 'react';

function AddProjectForm({ onProjectAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [technologies, setTechnologies] = useState('');
    // 1. Add new state for the link
    const [githubLink, setGithubLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newProject = {
            title,
            description,
            technologies: technologies.split(',').map(tech => tech.trim()),
            // 2. Include the link in the submission object
            githubLink,
        };

        axios.post('http://localhost:5001/projects/add', newProject)
            .then(res => {
                console.log(res.data);
                onProjectAdded();
                setTitle('');
                setDescription('');
                setTechnologies('');
                // 3. Clear the link field after submission
                setGithubLink('');
            })
            .catch(err => console.log('Error:', err));
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <h3>Add New Project</h3>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <input type="text" placeholder="Technologies (comma-separated)" value={technologies} onChange={(e) => setTechnologies(e.target.value)} required />
            {/* 4. Add the new input field */}
            <input type="url" placeholder="GitHub Link (optional)" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
            <button type="submit">Add Project</button>
        </form>
    );
}

export default AddProjectForm;