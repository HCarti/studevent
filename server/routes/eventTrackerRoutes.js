const express = require('express');
const router = express.Router();
const { getEventTracker, updateEventTracker, createEventTracker } = require('../controllers/eventTrackerController');
const authenticate = require('../middleware/authenticateToken'); // Authentication middleware
const EventTracker = require('../models/EventTracker'); // Import the EventTracker model

// Create event tracker (POST /api/tracker)
router.post('/', authenticate, createEventTracker);

// Get event tracker by form ID (GET /api/tracker/:formId)
router.get('/:formId', authenticate, getEventTracker);

// Update event tracker status (PUT /api/tracker/:formId)
router.put('/:formId', authenticate, updateEventTracker);

// Update a specific step in the event tracker (PUT /api/tracker/update-step/:trackerId/:stepId)
router.put("/update-step/:trackerId/:stepId", authenticate, async (req, res) => {
    try {
        const { trackerId, stepId } = req.params;
        const { status, remarks } = req.body;
        const userId = req.user._id; // Get the logged-in user's ObjectId
        const userRole = req.user.facultyRole; // Ensure this is stored in JWT

        const validRoles = ["Adviser", "Dean", "Academic Services", "Academic Director", "Executive Director"];

        // Check if user has a valid faculty role
        if (!validRoles.includes(userRole)) {
            return res.status(403).json({ message: "Unauthorized: Only faculty roles can update the tracker." });
        }

        // Find the tracker
        const tracker = await EventTracker.findById(trackerId);
        if (!tracker) {
            return res.status(404).json({ message: "Tracker not found" });
        }

        // Find the step being updated
        const step = tracker.steps.find(step => step._id.toString() === stepId);
        if (!step) {
            return res.status(404).json({ message: "Step not found" });
        }

        // Find the first "pending" step (must be updated in order)
        const firstPendingStep = tracker.steps.find(step => step.status === "pending");

        // Ensure only the correct step is updated
        if (!firstPendingStep || firstPendingStep._id.toString() !== stepId) {
            return res.status(403).json({ message: "You are not allowed to update this step yet." });
        }

        // Ensure the logged-in user is assigned to this step
        if (firstPendingStep.reviewedBy && firstPendingStep.reviewedBy.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You are not assigned to review this step." });
        }

        // Assign the logged-in user if `reviewedBy` is null
        if (!firstPendingStep.reviewedBy) {
            firstPendingStep.reviewedBy = userId;
            firstPendingStep.reviewedByRole = userRole;
        }

        // Update step status and timestamp
        firstPendingStep.status = status;
        firstPendingStep.remarks = remarks || "";
        firstPendingStep.timestamp = new Date();

        // Move to the next step if approved
        if (status === "approved") {
            const nextStepIndex = tracker.steps.findIndex(s => s._id.toString() === stepId) + 1;
            if (nextStepIndex < tracker.steps.length) {
                tracker.currentStep = tracker.steps[nextStepIndex].stepName;
                tracker.currentAuthority = tracker.steps[nextStepIndex].reviewerRole;
            } else {
                tracker.currentStep = "Completed";
                tracker.currentAuthority = "None";
            }
        }

        await tracker.save(); // Save the updated tracker

        return res.status(200).json({ message: "Tracker step updated successfully", tracker });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
