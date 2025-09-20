const router = require('express').Router();
let Project = require('../models/Project');
const auth = require('../middleware/auth'); // Import the auth middleware

// @route   GET /projects
// @desc    Get all projects for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find projects matching the user ID from the token
        const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /projects/add
// @desc    Add a new project
// @access  Private
router.post('/add', auth, async (req, res) => {
    const { title, description, technologies, githubLink } = req.body;
    try {
        const newProject = new Project({
            title,
            description,
            technologies,
            githubLink,
            user: req.user.id,
            source: 'manual' // Explicitly set the source
        });

        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Make sure the user owns the project
        if (project.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await project.deleteOne();

        res.json({ msg: 'Project removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;