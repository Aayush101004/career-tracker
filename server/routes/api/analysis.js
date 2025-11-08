// server/routes/api/analysis.js

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const axios = require('axios');
const Analysis = require('../../models/Analysis');
const User = require('../../models/User'); // <-- We need the User model

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;
const JSEARCH_API_URL = 'https://jsearch.p.rapidapi.com/search';

// @route   POST api/analysis/career
// @desc    Analyze technologies, find real jobs, and save the result
// @access  Private
router.post('/career', auth, async (req, res) => {
    const { technologies, projects } = req.body;

    if (!technologies || technologies.length === 0) {
        return res.status(400).json({ msg: 'No technologies provided for analysis.' });
    }
    if (!projects || projects.length === 0) {
        return res.status(400).json({ msg: 'No projects provided for analysis.' });
    }

    try {
        // 1. Create a stable, sorted key for caching
        const uniqueTechSet = new Set(technologies.map(t => String(t).toLowerCase().trim()));
        const sortedTechs = [...uniqueTechSet].sort();
        const technologiesKey = sortedTechs.join(', ');

        // --- MODIFIED: Fetch user data to get country ---
        const user = await User.findById(req.user.id);
        const searchCountry = user && user.country ? user.country : 'India'; // Default to India
        // --- END MODIFICATION ---

        // 2. Check for a cached analysis
        // Note: Cache is now tied to the country as well
        const cacheKey = `${technologiesKey}|${searchCountry}`;

        const cachedAnalysis = await Analysis.findOne({
            user: req.user.id,
            technologiesKey: cacheKey // Use the new combined key
        });

        if (cachedAnalysis) {
            console.log('Returning cached analysis.');
            return res.json({
                suggestedCareer: cachedAnalysis.careerPath,
                reasoning: cachedAnalysis.reasoning,
                jobLinks: cachedAnalysis.jobLinks
            });
        }

        // 3. If no cache, call Gemini for career suggestion
        console.log('No cache found. Calling Gemini API...');

        const geminiSchema = {
            type: 'OBJECT',
            properties: {
                suggestedCareer: { type: 'STRING' },
                reasoning: { type: 'STRING' }
            },
            required: ['suggestedCareer', 'reasoning']
        };

        const geminiPrompt = `
            Based on the following list of technologies, suggest a single, specific career path.
            Provide a brief reasoning (one sentence).
            Do NOT suggest job links or companies.
            
            Technologies: --- ${technologiesKey} ---
        `;

        const geminiPayload = {
            contents: [{ parts: [{ text: geminiPrompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: geminiSchema,
                temperature: 0
            }
        };

        const geminiResponse = await axios.post(GEMINI_API_URL, geminiPayload);
        if (!geminiResponse.data?.candidates?.[0]) {
            throw new Error('Invalid response from Gemini AI service');
        }
        const analysis = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text);

        // 4. Call JSearch API to get REAL job links
        console.log(`Gemini suggested: ${analysis.suggestedCareer}. Fetching jobs for ${searchCountry}...`);

        // --- MODIFIED: Use the searchCountry variable ---
        const jsearchOptions = {
            params: {
                query: `${analysis.suggestedCareer} in ${searchCountry}`,
                num_pages: '1',
                employment_types: 'FULLTIME',
                page: '1'
            },
            headers: {
                'X-RapidAPI-Key': process.env.JSEARCH_API_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };
        // --- END MODIFICATION ---

        const jobResponse = await axios.get(JSEARCH_API_URL, jsearchOptions);

        let jobLinks = [];
        if (jobResponse.data && jobResponse.data.data) {
            jobLinks = jobResponse.data.data.slice(0, 4).map(job => ({
                title: job.job_title,
                company_name: job.employer_name,
                url: job.job_apply_link,
                snippet: job.job_description ? job.job_description.slice(0, 150) + '...' : 'No description available.'
            })).filter(job => job.url); // Ensure we only keep jobs with an apply link
        }

        // 5. Save the complete analysis to the database
        const newAnalysis = new Analysis({
            user: req.user.id,
            careerPath: analysis.suggestedCareer,
            reasoning: analysis.reasoning,
            jobLinks: jobLinks,
            projects: projects,
            technologiesKey: cacheKey // Save with the country-specific cache key
        });

        console.log('Attempting to save new analysis with real job links...');
        await newAnalysis.save();
        console.log('New analysis saved successfully.');

        // 6. Send the combined analysis back to the client
        res.json({
            suggestedCareer: analysis.suggestedCareer,
            reasoning: analysis.reasoning,
            jobLinks: jobLinks
        });

    } catch (err) {
        console.error('--- CAREER ANALYSIS ERROR ---');
        if (err.response) {
            console.error('Axios Error Data:', err.response.data);
        } else if (err.name === 'ValidationError') {
            console.error('Mongoose Validation Error:', err.message);
        } else {
            console.error(err);
        }

        res.status(500).json({
            msg: 'Server Error during analysis.',
            error: err.message,
            name: err.name
        });
    }
});

// GET /api/analysis/history (No changes needed)
router.get('/history', auth, async (req, res) => {
    try {
        const analyses = await Analysis.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(analyses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;