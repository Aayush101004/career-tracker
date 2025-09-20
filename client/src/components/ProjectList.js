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
                    <h4>{project.title}</h4>
                    <div className="accordion-content">
                        <p><strong>Description:</strong><br /> {project.description}</p>
                        <p><strong>Technologies:</strong><br /> {project.technologies.join(', ')}</p>
                        {project.githubLink &&
                            <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="github-btn" // Apply the new button class here
                            >
                                View on GitHub
                            </a>
                        }
                    </div>

                    <button onClick={() => deleteProject(project._id)} style={{ marginTop: '1rem' }}>Delete</button>
                </div>
            ))}
        </div>
    );
}

export default ProjectList;
