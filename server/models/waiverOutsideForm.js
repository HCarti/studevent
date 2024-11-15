const mongoose = require('mongoose');

// const reviewStageSchema = new mongoose.Schema({
//     role: { type: String, enum: ['Adviser', 'Dean', 'AcademicServices', 'AcademicDirector'], required: true },
//     status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
//     remarks: { type: String },
//     timestamp: { type: Date }
// });

const projectProposalSchema = new mongoose.Schema({
    projectTitle: { type: String,  required: true },
    projectDescription: { type: String,  required: true },
    objectives: { type: String,  required: true },

    // currentStep: { type: Number, default: 0 }, // Tracks the current stage index
    // reviewStages: [reviewStageSchema], // Holds details of each reviewer's status
    // finalStatus: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' } // Overall status of the form
});

const ProjectProposalForm = mongoose.model('ProjectProposalForm', projectProposalSchema);
module.exports = ProjectProposalForm;
