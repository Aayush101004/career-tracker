const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');
const GeneratedResume = require('../../models/GeneratedResume');
const User = require('../../models/User');
const Project = require('../../models/Project');

// Configure multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// --- Gemini API Configuration ---
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;

// @route   POST api/resume/analyze
// @desc    Analyze a resume for a specific job role
// @access  Private
router.post('/analyze', [auth, upload.single('resume')], async (req, res) => {
    const { jobRole } = req.body;
    if (!req.file || !jobRole) {
        return res.status(400).json({ msg: 'A resume file and job role are required.' });
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
      - For "goodPoints", list specific skills or projects that align with the role.
      - For "badPoints", list areas for improvement, suggesting specific actions like "Add quantifiable results" or "Include more keywords like 'agile'".
      Return the analysis in the specified JSON format.
      Resume Text: --- ${resumeText} ---
    `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", responseSchema: analysisSchema }
        };

        const geminiResponse = await axios.post(GEMINI_API_URL, payload);
        const analysis = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text);
        res.json(analysis);
    } catch (err) {
        console.error('Resume analysis error:', err.response ? err.response.data : err.message);
        res.status(500).send('Server Error during resume analysis');
    }
});

module.exports = router;

