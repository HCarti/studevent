const Form = require('../models/Form');
const User = require('../models/User');
const { sendEmail } = require('../helpers/emailHelper');

// Submit new form for review
exports.submitForm = async (req, res) => {
    try {
        const { title, description, studentOrganization } = req.body;

        // Define initial review stages
        const reviewStages = [
            { role: 'Adviser', status: 'pending' },
            { role: 'Dean', status: 'pending' },
            { role: 'AcademicServices', status: 'pending' },
            { role: 'AcademicDirector', status: 'pending' }
        ];

        const form = new Form({ title, description, studentOrganization, reviewStages });
        await form.save();

        res.status(201).json({ message: 'Form submitted successfully', form });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit form', error });
    }
};

// Approve or decline the form at the current review stage
exports.updateReviewStage = async (req, res) => {
    try {
        const { formId } = req.params;
        const { userId, status, remarks } = req.body;

        const form = await Form.findById(formId);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        const currentReviewerStage = form.reviewStages[form.currentStep];

        // Verify user role matches the current review stage
        const user = await User.findById(userId);
        if (user.role !== currentReviewerStage.role) {
            return res.status(403).json({ message: 'Unauthorized for this review step' });
        }

        // Update the current review stage status and remarks
        currentReviewerStage.status = status;
        currentReviewerStage.remarks = remarks;
        currentReviewerStage.timestamp = new Date();

        if (status === 'approved' && form.currentStep < form.reviewStages.length - 1) {
            form.currentStep += 1; // Move to the next step
            const nextReviewerRole = form.reviewStages[form.currentStep].role;

            // Find the next reviewer with the required role
            const nextReviewer = await User.findOne({ role: nextReviewerRole });
            if (nextReviewer) {
                await sendEmail(
                    nextReviewer.email,
                    `New Form Approval Request`,
                    `You have a new form awaiting your review. Please log in to check the details.`
                );
            }
        } else if (status === 'declined') {
            form.finalStatus = 'declined';
        } else if (form.currentStep === form.reviewStages.length - 1 && status === 'approved') {
            form.finalStatus = 'approved';
        }

        await form.save();
        res.status(200).json({ message: 'Review stage updated and notification sent', form });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update review stage', error });
    }
};

// Get form details with progress tracker
exports.getFormDetails = async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await Form.findById(formId).populate('studentOrganization', 'organizationName emailAddress');

        if (!form) return res.status(404).json({ message: 'Form not found' });

        res.status(200).json({ form });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve form details', error });
    }
};
