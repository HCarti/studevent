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
        const userId = req.user._id; // Logged-in user ID
        const userRole = req.user.role; // Admin or Faculty
        const facultyRole = req.user.facultyRole; // Faculty-specific role

        // List of allowed faculty roles
        const facultyRoles = ["Adviser", "Dean", "Academic Services", "Academic Director", "Executive Director"];

        // Ensure user is an Admin or Faculty with a valid facultyRole
        if (userRole !== "Admin" && (!facultyRole || !facultyRoles.includes(facultyRole))) {
            return res.status(403).json({ message: "Unauthorized: Only Admins or Faculty reviewers can update the tracker." });
        }

        // Fetch the tracker
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

        // Ensure the correct step is being updated in order
        if (!firstPendingStep || firstPendingStep._id.toString() !== stepId) {
            return res.status(403).json({ message: "You cannot skip steps. Approve them in order." });
        }

        // Prevent users from modifying completed steps
        if (step.status !== "pending") {
            return res.status(400).json({ message: "This step has already been reviewed." });
        }

        // Ensure the logged-in user is the correct reviewer
        if (firstPendingStep.step === "Adviser" && facultyRole !== "Adviser") {
            return res.status(403).json({ message: "Unauthorized: Only the Adviser can review the first step." });
        }
        if (firstPendingStep.step === "Dean" && facultyRole !== "Dean") {
            return res.status(403).json({ message: "Unauthorized: Only the Dean can review this step." });
        }
        if (firstPendingStep.step === "Academic Services" && facultyRole !== "Academic Services") {
            return res.status(403).json({ message: "Unauthorized: Only Academic Services can review this step." });
        }
        if (firstPendingStep.step === "Academic Director" && facultyRole !== "Academic Director") {
            return res.status(403).json({ message: "Unauthorized: Only the Academic Director can review this step." });
        }
        if (firstPendingStep.step === "Executive Director" && facultyRole !== "Executive Director") {
            return res.status(403).json({ message: "Unauthorized: Only the Executive Director can review this step." });
        }

        // Assign the logged-in user if `reviewedBy` is null
        if (!firstPendingStep.reviewedBy) {
            firstPendingStep.reviewedBy = userId;
            firstPendingStep.reviewedByRole = facultyRole || userRole; // Use facultyRole if available, otherwise role
        }

        // Update step status and timestamp
        firstPendingStep.status = status;
        firstPendingStep.remarks = remarks || "";
        firstPendingStep.timestamp = new Date();

        // Move to the next step if approved
        if (status === "approved") {
            const nextStepIndex = tracker.steps.findIndex(s => s._id.toString() === stepId) + 1;
            if (nextStepIndex < tracker.steps.length) {
                tracker.currentStep = tracker.steps[nextStepIndex].step;
                tracker.currentAuthority = tracker.steps[nextStepIndex].reviewedByRole;
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
