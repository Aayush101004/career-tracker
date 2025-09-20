const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Project = require('../../models/Project');
const Analysis = require('../../models/Analysis');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// GET current user's profile, projects, and all analyses
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Fetches all analyses. No populate is needed because the titles are now stored directly.
        const analyses = await Analysis.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.json({ user, projects, analyses });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Change user password
router.post(
    '/change-password',
    [
        auth,
        [
            check('currentPassword', 'Current password is required').not().isEmpty(),
            check('newPassword', 'New password with 6 or more characters is required').isLength({ min: 6 })
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { currentPassword, newPassword } = req.body;
        try {
            const user = await User.findById(req.user.id);
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Current password is not correct' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.json({ msg: 'Password updated successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// Save a new career analysis result
router.post('/analysis', auth, async (req, res) => {
    const { career, projectIds } = req.body;
    if (!career || !projectIds) {
        return res.status(400).json({ msg: 'Career path and project IDs are required' });
    }
    try {
        // Find the full project documents to get their titles
        const projectsUsed = await Project.find({ '_id': { $in: projectIds } }).select('title');

        // Create an array of objects containing both the ID and title
        const projectsToStore = projectsUsed.map(p => ({
            _id: p._id,
            title: p.title
        }));

        const newAnalysis = new Analysis({
            user: req.user.id,
            careerPath: career,
            projects: projectsToStore // Save the copied project data
        });

        await newAnalysis.save();
        res.json(newAnalysis);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during analysis saving');
    }
});

module.exports = router;

