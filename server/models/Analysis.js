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
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project' // Corrected from 'project' to 'Project'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('analysis', AnalysisSchema);

