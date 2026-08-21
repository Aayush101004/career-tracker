const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');
const User = require('../../models/User');
const Project = require('../../models/Project');

const upload = multer({ storage: multer.memoryStorage() });

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

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

        // 1. Updated Schema for the new data points
        const analysisSchema = {
            type: 'OBJECT',
            properties: {
                atsScore: { type: 'INTEGER', description: 'A simulated ATS match score from 0 to 100.' },
                recruiterGoodPoints: { type: 'ARRAY', items: { type: 'STRING' } },
                recruiterBadPoints: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['atsScore', 'recruiterGoodPoints', 'recruiterBadPoints']
        };

        // 2. Updated Prompt for recruiter perspective
        const prompt = `
            You are a senior technical recruiter and an Applicant Tracking System (ATS) expert.
            Evaluate the following resume against the provided target role of "${jobRole}".

            - "atsScore": Assign a simulated match percentage from 0 to 100 based on skills, keywords, and experience alignment with the role.
            - "recruiterGoodPoints": List 3 to 5 strong points in the resume that would impress a recruiter for this specific role. Focus on evidence, real tools, and quantified metrics.
            - "recruiterBadPoints": List 3 to 5 red flags, missing keywords, or weak formatting choices that would cause a recruiter to reject the resume. Be brutally honest and suggest specific fixes.

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

        // 3. Parse the guaranteed JSON string and send the response
        const analysis = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text);

        // Structured response for the frontend
        res.status(200).json({
            success: true,
            data: analysis
        });

    } catch (err) {
        console.error('Resume analysis error:', err.response ? err.response.data : err.message);
        res.status(500).json({ success: false, msg: 'Server Error during resume analysis' });
    }
});

module.exports = router;