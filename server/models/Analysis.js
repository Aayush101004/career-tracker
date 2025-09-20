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
    // This structure ensures a permanent, historical record of the project titles
    // at the time of analysis.
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

