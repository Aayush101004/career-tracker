const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');
const User = require('../../models/User');
const Project = require('../../models/Project');

const upload = multer({ storage: multer.memoryStorage() });

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;

// @route   POST api/resume/analyze
// @desc    Analyze a resume for a specific job role
// @access  Private
router.post('/analyze', [auth, upload.single('resume')], async (req, res) => {
    const { jobRole } = req.body;
    if (!req.file) {
        return res.status(400).json({ msg: 'A resume file is required.' });
    }
    if (!jobRole) {
        return res.status(400).json({ msg: 'A target job role is required.' });
    }

    try {
        const data = await pdf(req.file.buffer);
        const resumeText = data.text;

        const analysisSchema = {
            type: 'OBJECT',
            properties: {
                goodPoints: { type: 'ARRAY', items: { type: 'STRING' } },
                badPoints: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['goodPoints', 'badPoints']
        };

        const prompt = `
      Analyze the following resume text based on its suitability for the job role of "${jobRole}".
      Identify key strengths and weaknesses.
      - For "goodPoints", list specific skills or experiences that are a strong fit for the role.
      - For "badPoints", list areas for improvement, suggesting specific actions like "Add quantifiable results to project descriptions."
      Return the analysis in the specified JSON format.
      Resume Text: --- ${resumeText} ---
    `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema
            }
        };

        const geminiResponse = await axios.post(GEMINI_API_URL, payload);

        if (!geminiResponse.data?.candidates?.[0]) {
            throw new Error('Invalid response from AI service');
        }

        const analysis = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text);
        res.json(analysis);
    } catch (err) {
        console.error('Resume analysis error:', err.response ? err.response.data : err.message);
        res.status(500).send('Server Error during resume analysis');
    }
});

module.exports = router;

