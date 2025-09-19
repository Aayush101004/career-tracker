// server/routes/projects.js
const router = require('express').Router();
let Project = require('../models/Project');

// GET: Fetch all projects
router.route('/').get((req, res) => {
    Project.find()
        .then(projects => res.json(projects))
        .catch(err => res.status(400).json('Error: ' + err));
});

// POST: Add a new project
router.route('/add').post((req, res) => {
    // Destructure the new field from req.body
    const { title, description, technologies, githubLink } = req.body;

    const newProject = new Project({
        title,
        description,
        technologies,
        githubLink, // Add it to the new project object
    });

    newProject.save()
        .then(() => res.json('Project added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE: Remove a project by ID
router.route('/:id').delete((req, res) => {
    Project.findByIdAndDelete(req.params.id)
        .then(() => res.json('Project deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;