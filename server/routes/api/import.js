const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Project = require('../../models/Project');
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// --- Gemini API Configuration ---
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;


// --- GitHub Import Route ---
router.post('/github', auth, async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ msg: 'GitHub URL is required' });
    }

    try {
        const urlParts = new URL(url);
        const pathParts = urlParts.pathname.split('/').filter(p => p);
        if (pathParts.length < 2) {
            return res.status(400).json({ msg: 'Invalid GitHub URL format' });
        }
        const [username, repoName] = pathParts;

        const repoRes = await axios.get(`https://api.github.com/repos/${username}/${repoName}`);
        const langRes = await axios.get(repoRes.data.languages_url);
        const technologies = Object.keys(langRes.data);
        let projectDescription = repoRes.data.description || 'No description found.';

        try {
            const readmeRes = await axios.get(`https://api.github.com/repos/${username}/${repoName}/readme`, {
                headers: { 'Accept': 'application/vnd.github.v3.raw' }
            });
            const readmeContent = readmeRes.data;

            // THE FIX #1: Updated the prompt to explicitly request plain text.
            const summaryPayload = {
                contents: [{ parts: [{ text: `Summarize the following project README in a single, plain-text paragraph for a project portfolio. Do not use any markdown formatting like asterisks or bolding: ${readmeContent}` }] }]
            };

            const geminiResponse = await axios.post(GEMINI_API_URL, summaryPayload);

            if (geminiResponse.data && geminiResponse.data.candidates && geminiResponse.data.candidates.length > 0) {
                const summary = geminiResponse.data.candidates[0].content.parts[0].text;
                if (summary) {
                    // THE FIX #2: Clean any remaining markdown characters from the response.
                    projectDescription = summary.replace(/\*\*/g, '');
                }
            }
        } catch (readmeError) {
            console.error('Could not fetch or summarize README. Falling back to default description.');
            if (readmeError.response) console.error('API Error:', readmeError.response.data);
        }

        const newProject = new Project({
            user: req.user.id,
            title: repoRes.data.name,
            description: projectDescription,
            technologies: technologies.length > 0 ? technologies : ['Not specified'],
            githubLink: repoRes.data.html_url,
            source: 'github'
        });

        await newProject.save();
        res.json(newProject);
    } catch (err) {
        console.error('GitHub import error:', err.message);
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ msg: 'Repository not found. Please check the URL.' });
        }
        res.status(500).send('Server Error while fetching from GitHub');
    }
});


// --- Resume Import Route ---
router.post('/resume', auth, upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Resume file is required' });
    }

    try {
        const data = await pdf(req.file.buffer);
        const resumeText = data.text;

        const projectSchema = {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    description: { type: 'STRING' },
                    technologies: { type: 'ARRAY', items: { type: 'STRING' } }
                },
                required: ['title', 'description', 'technologies']
            }
        };

        const prompt = `
      Analyze the following resume text. Find the section with a heading like "Projects", "My Projects", or "Personal Projects".
      Extract every project listed under that heading until you reach the next major heading (like "Experience" or "Education").
      For each project, extract its title, a brief description, and a list of technologies used.
      Return the data in the specified JSON format. If no projects section is found, return an empty array.
      
      Resume Text:
      ---
      ${resumeText}
      ---
    `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: projectSchema
            }
        };

        const geminiResponse = await axios.post(GEMINI_API_URL, payload);

        if (!geminiResponse.data || !geminiResponse.data.candidates || geminiResponse.data.candidates.length === 0) {
            throw new Error('Invalid response from Gemini API');
        }

        const extractedProjects = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text);

        if (!extractedProjects || extractedProjects.length === 0) {
            return res.status(400).json({ msg: 'Could not find a "Projects" section in the resume.' });
        }

        const projectsToSave = extractedProjects.map(p => ({
            ...p,
            user: req.user.id,
            source: 'resume'
        }));

        const savedProjects = await Project.insertMany(projectsToSave);
        res.json(savedProjects);
    } catch (err) {
        console.error('Resume processing error:', err.message);
        if (err.response) console.error('API Error:', err.response.data);
        res.status(500).send('Server Error during resume processing');
    }
});

module.exports = router;

