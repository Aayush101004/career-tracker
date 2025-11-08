// server/models/Analysis.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    careerPath: {
        type: String,
        required: true
    },
    reasoning: {
        type: String,
        required: false
    },
    technologiesKey: {
        type: String,
        index: true
    },
    locationSearched: {
        type: String
    },
    // --- UPDATED THIS SECTION ---
    // We will store the actual, direct job links from the API
    jobLinks: [{
        title: { type: String },
        company_name: { type: String },
        url: { type: String },
        snippet: { type: String }
    }],
    // --- END UPDATE ---
    projects: [{
        _id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('analysis', AnalysisSchema);