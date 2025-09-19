import axios from 'axios';

function ProjectList({ projects, fetchProjects }) {
    const deleteProject = (id) => {
        axios.delete(`http://localhost:5001/projects/${id}`)
            .then(res => {
                console.log(res.data);
                fetchProjects(); // Refresh the list after deleting
            })
            .catch(err => console.log('Error:', err));
    };

    if (projects.length === 0) {
        return <p>No projects yet. Add one above!</p>;
    }

    return (
        <div>
            <h3>My Projects</h3>
            {projects.map(project => (
                <div key={project._id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
                    <h4>{project.title}</h4>
                    <p>{project.description}</p>
                    <strong>Technologies:</strong> {project.technologies.join(', ')}

                    {/* Add this block to conditionally render the link */}
                    {project.githubLink && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                                View on GitHub
                            </a>
                        </div>
                    )}

                    <button onClick={() => deleteProject(project._id)} style={{ marginTop: '0.5rem' }}>Delete</button>
                </div>
            ))}
        </div>
    );
}

export default ProjectList;