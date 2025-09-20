const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    // Add this user field to link to the User model
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    technologies: {
        type: [String], // An array of strings
        required: true
    },
    githubLink: {
        type: String,
        required: false, // Make it optional
        trim: true
    }
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
