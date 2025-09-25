const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Project = require('../../models/Project');
const axios = require('axios');

// --- Gemini API Configuration ---
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;

// This route remains the same to generate the initial set of questions.
router.post('/prepare', auth, async (req, res) => {
    const { jobRole, projectIds } = req.body;

    if (!jobRole || !projectIds || projectIds.length === 0) {
        return res.status(400).json({ msg: 'Job role and at least one project are required.' });
    }

    try {
        const projects = await Project.find({ '_id': { $in: projectIds }, 'user': req.user.id });

        if (projects.length === 0) {
            return res.status(404).json({ msg: 'Selected projects not found.' });
        }

        const projectsText = projects.map(p =>
            `---\nProject Title: "${p.title}"\nDescription: ${p.description}\nTechnologies Used: ${p.technologies.join(', ')}\n---`
        ).join('\n\n');

        const questionSchema = {
            type: 'OBJECT',
            properties: {
                technicalQuestions: { type: 'ARRAY', items: { type: 'STRING' } },
                behavioralQuestions: { type: 'ARRAY', items: { type: 'STRING' } },
                fundamentalQuestions: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['technicalQuestions', 'behavioralQuestions', 'fundamentalQuestions']
        };

        const prompt = `
      You are an expert technical interviewer preparing a candidate for a job interview for the role of "${jobRole}".
      You have been given a list of the candidate's personal projects to use as context.

      **Candidate's Projects:**
      ${projectsText}

      **Your Task and Strict Instructions:**
      Generate three distinct categories of interview questions. You MUST follow these rules precisely:

      1.  **Technical & Project Deep Dive Questions:**
          * You MUST generate at least one specific question for EACH of the projects provided above, mentioning the project by its title.
          * These questions should test the candidate's understanding of the technologies and architectural decisions within their projects.

      2.  **Behavioral Questions:**
          * Generate behavioral questions that ask the candidate to describe a situation, challenge, or learning experience related to their projects.
          * Aim to cover different projects if possible.

      3.  **Fundamental Questions (This is a separate, required task):**
          * First, analyze the job role: "${jobRole}".
          * IF the job role contains keywords like "AI", "Machine Learning", "ML", "Data Scientist", or "Analyst", you MUST generate 3 questions about core AI/ML concepts (e.g., model training, overfitting, data bias, specific algorithms, confusion matrix).
          * ELSE (for any other software role), you MUST generate 3 questions about fundamental Computer Science concepts (e.g., data structures like Hash Maps vs. Arrays, Big O notation, REST vs. GraphQL, OOP principles).

      Return the final list of questions in the specified JSON format. Do not include any extra text, headings, or explanations outside of the JSON structure.
    `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: questionSchema
            }
        };

        const geminiResponse = await axios.post(GEMINI_API_URL, payload);

        if (!geminiResponse.data?.candidates?.[0]) {
            throw new Error('Invalid response from AI service');
        }

        const questions = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text);
        res.json(questions);

    } catch (err) {
        console.error('Interview prep error:', err.response ? err.response.data : err.message);
        res.status(500).send('Server Error during interview preparation');
    }
});


// @route   POST api/interview/evaluate
// @desc    Evaluate a user's spoken answer to an interview question
// @access  Private
router.post('/evaluate', auth, async (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ msg: 'Both a question and an answer are required for evaluation.' });
    }

    try {
        const evaluationSchema = {
            type: 'OBJECT',
            properties: {
                score: {
                    type: 'NUMBER',
                    description: 'A score from 1 to 10, where 1 is poor and 10 is excellent.'
                },
                feedback: {
                    type: 'STRING',
                    description: 'A concise, overall summary of the feedback.'
                },
                goodPoints: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                    description: 'A list of specific things the user did well.'
                },
                improvementPoints: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                    description: 'A list of specific, actionable suggestions for improvement.'
                }
            },
            required: ['score', 'feedback', 'goodPoints', 'improvementPoints']
        };

        const prompt = `
      You are an expert technical interviewer and career coach. Your task is to evaluate a candidate's answer to a specific interview question and provide constructive feedback.

      **The Interview Question:**
      "${question}"

      **The Candidate's Answer:**
      "${answer}"

      **Your Evaluation Task:**
      1.  **Assess Correctness and Completeness:** Analyze the candidate's answer for technical accuracy and whether it fully addresses all parts of the question.
      2.  **Evaluate Clarity and Structure:** Consider how well-structured and easy to understand the answer is. For behavioral questions, check if they used a clear method like the STAR technique.
      3.  **Provide a Score:** Give a score from 1 (poor) to 10 (excellent) based on the overall quality of the answer.
      4.  **Generate Feedback:** Write a concise, overall summary of your feedback.
      5.  **List Good Points:** Identify specific things the candidate did well (e.g., "Used a strong action verb," "Provided a concrete example").
      6.  **List Improvement Points:** Provide specific, actionable advice (e.g., "Could have mentioned the time complexity of the algorithm," "Try to quantify the impact of your project by mentioning specific metrics.").

      Return your complete evaluation in the specified JSON format.
    `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: evaluationSchema
            }
        };

        const geminiResponse = await axios.post(GEMINI_API_URL, payload);

        if (!geminiResponse.data?.candidates?.[0]) {
            throw new Error('Invalid response from AI service');
        }

        const evaluation = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text);
        res.json(evaluation);

    } catch (err) {
        console.error('Answer evaluation error:', err.response ? err.response.data : err.message);
        res.status(500).send('Server Error during answer evaluation');
    }
});


module.exports = router;

