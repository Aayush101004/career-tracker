import axios from 'axios';

// No changes to logic, just applying a CSS class
function ProjectList({ projects, fetchProjects }) {
    const deleteProject = (id) => {
        axios.delete(`/projects/${id}`)
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
                <div key={project._id} className="project-card">
                    {/* Add the source badge here */}
                    <span className="project-source-badge">Added via {project.source}</span>

                    <h4>{project.title}</h4>
                    <p>{project.description}</p>
                    <strong>Technologies:</strong> {project.technologies.join(', ')}

                    {project.githubLink && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="github-btn"
                            >
                                View on GitHub
                            </a>
                        </div>
                    )}

                    <button onClick={() => deleteProject(project._id)} style={{ marginTop: '1rem' }}>Delete</button>
                </div>
            ))}
        </div>
    );
}

export default ProjectList;
