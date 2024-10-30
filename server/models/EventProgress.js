const mongoose = require('mongoose');

const eventProgressSchema = new mongoose.Schema({
    formId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Form', // Assuming your Form model is named 'Form'
        required: true 
    },
    currentReviewer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Assuming your User model is named 'User'
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
        default: 'Pending' 
    },
    reviewHistory: [{ 
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date, default: Date.now },
        comment: { type: String } // Optional comments from the reviewer
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const EventProgress = mongoose.model('EventProgress', eventProgressSchema);
module.exports = EventProgress;
