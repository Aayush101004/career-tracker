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

// // @route   POST api/resume/build
// // @desc    Build a new resume tailored to a job role
// // @access  Private
// router.post('/build', [auth, upload.single('existingResume')], async (req, res) => {
//     const { jobRole, jobDescription } = req.body;

//     if (!req.file || !jobRole) {
//         return res.status(400).json({ msg: 'An existing resume file and a target job role are required.' });
//     }

//     try {
//         // 1. Extract text from the user's uploaded resume PDF
//         const resumeText = (await pdf(req.file.buffer)).text;

//         // 2. Create a new, more powerful prompt for the Gemini API
//         const prompt = `
//       You are an expert career coach and professional resume writer. Your task is to analyze and rewrite the provided resume to be perfectly tailored for a specific job role.

//       **Target Job Role:**
//       ${jobRole}

//       **Job Description (use this for keywords and focus):**
//       ---
//       ${jobDescription || 'No description provided. Focus on general best practices for the target role.'}
//       ---

//       **Original Resume Content:**
//       ---
//       ${resumeText}
//       ---

//       **Instructions:**
//       1.  Read the entire original resume to understand the candidate's skills and experience.
//       2.  Rewrite the professional summary to directly address the requirements of the "${jobRole}", using keywords from the job description.
//       3.  In the "Experience" and "Projects" sections, rewrite the descriptions of each role or project. Focus on transforming responsibilities into quantifiable achievements. For example, instead of "Managed a team," write "Led a team of 5 engineers to increase system efficiency by 15%." Use powerful action verbs and align the achievements with the skills mentioned in the job description.
//       4.  Review the "Skills" section. Reorder and highlight the skills that are most relevant to the target job role.
//       5.  The final output must be the complete, rewritten resume in clean, professional Markdown format. Do not include any of your own commentary or explanations, only the final resume content. Maintain a professional tone and structure.
//     `;

//         const payload = { contents: [{ parts: [{ text: prompt }] }] };

//         // 3. Call the Gemini API to get the rewritten resume content
//         const geminiResponse = await axios.post(GEMINI_API_URL, payload);
//         const resumeContent = geminiResponse.data.candidates[0].content.parts[0].text;

//         // 4. Save the generated resume to the database for the user's history
//         const newGeneratedResume = new GeneratedResume({
//             user: req.user.id,
//             jobRole: jobRole,
//             content: resumeContent
//         });
//         await newGeneratedResume.save();

//         // 5. Return the generated markdown content to the frontend
//         res.json({ content: resumeContent });

//     } catch (err) {
//         console.error('Resume build error:', err.response ? err.response.data : err.message);
//         res.status(500).send('Server Error during resume generation');
//     }
// });

module.exports = router;

