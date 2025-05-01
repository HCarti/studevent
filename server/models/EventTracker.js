const mongoose = require('mongoose');

const eventTrackerSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Form' },
    currentStep: { type: String, default: "Adviser" }, // Starts with the first step
    currentAuthority: { type: String, default: "Adviser" }, // First reviewer
    steps: [
        {
            stepName: { type: String, required: true },
            reviewerRole: { type: String, required: true }, // Role expected to review
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            reviewedByRole: { type: String, default: null },
            status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
            remarks: { type: String, default: "" },
            timestamp: { type: Date, default: null},
            signature: { type: String, default: null }, // NEW: Signature URL
            assignedReviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Add this
        }
    ]
});

const EventTracker = mongoose.model('EventTracker', eventTrackerSchema);
module.exports = EventTracker;
