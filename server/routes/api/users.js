const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Project = require('../../models/Project');
const Analysis = require('../../models/Analysis');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// @route   GET api/users/me
// @desc    Get current user's profile, projects, and all analyses
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });

        // THE CHANGE: Fetch all analyses for the user, sorted by newest first
        const analyses = await Analysis.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('projects', ['title']); // Still populate the project titles

        res.json({ user, projects, analyses }); // Send the full array of analyses
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/users/change-password
// @desc    Change user password
// @access  Private
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


// @route   POST api/users/analysis
// @desc    Save a new career analysis result
// @access  Private
router.post('/analysis', auth, async (req, res) => {
    const { career, projectIds } = req.body;

    if (!career || !projectIds) {
        return res.status(400).json({ msg: 'Career path and project IDs are required' });
    }

    try {
        // We are no longer updating the user, but creating a new Analysis document
        const newAnalysis = new Analysis({
            user: req.user.id,
            careerPath: career,
            projects: projectIds
        });

        await newAnalysis.save();

        res.json(newAnalysis);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

