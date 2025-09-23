const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Project = require('../../models/Project');
const Analysis = require('../../models/Analysis');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// @route   GET api/users/me
// @desc    Get current user's profile, projects, and all generated content
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
        const analyses = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.json({ user, projects, analyses});
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
        const projectsUsed = await Project.find({ '_id': { $in: projectIds } }).select('title');
        const projectsToStore = projectsUsed.map(p => ({ _id: p._id, title: p.title }));
        const newAnalysis = new Analysis({
            user: req.user.id,
            careerPath: career,
            projects: projectsToStore
        });
        await newAnalysis.save();
        res.json(newAnalysis);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during analysis saving');
    }
});

module.exports = router;

