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
      
          const form = await Form.findById(formId).populate('studentOrganization', 'email');
          if (!form) return res.status(404).json({ message: 'Form not found' });
      
          const currentReviewerStage = form.reviewStages[form.currentStep];
      
          // Verify user role matches the current review stage
          const user = await User.findById(userId);
          if (!user || user.role !== currentReviewerStage.role) {
            return res.status(403).json({ message: 'Unauthorized for this review step' });
          }
      
          // Update the current review stage status
          currentReviewerStage.status = status;
          currentReviewerStage.remarks = remarks;
          currentReviewerStage.timestamp = new Date();
      
          if (status === 'approved') {
            if (form.currentStep < form.reviewStages.length - 1) {
              // Move to the next step
              form.currentStep += 1;
              const nextReviewerRole = form.reviewStages[form.currentStep].role;
      
              // Find the next reviewer
              const nextReviewer = await User.findOne({ role: nextReviewerRole });
              if (nextReviewer) {
                await sendEmail(
                  nextReviewer.email,
                  'New Form for Approval',
                  `You have a new form to review. Please check the details in your account.`
                );
              }
            } else {
              // If the last reviewer approves, mark the form as fully approved
              form.finalStatus = 'approved';
              await sendEmail(
                form.studentOrganization.email,
                'Form Fully Approved',
                `Your form "${form.title}" has been fully approved.`
              );
            }
          } else if (status === 'declined') {
            // If declined, notify the submitting organization
            form.finalStatus = 'declined';
            await sendEmail(
              form.studentOrganization.email,
              'Form Declined',
              `Your form "${form.title}" has been declined. Remarks: ${remarks}`
            );
          }
      
          await form.save();
          res.status(200).json({ message: 'Review stage updated successfully', form });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Failed to update review stage', error });
        }
      };
      

    // Get form details with progress tracker
    exports.getFormDetails = async (req, res) => {
        try {
            const { formId } = req.params;
            const form = await Form.findById(formId).populate('studentOrganization', 'organizationName', 'emailAddress');

            if (!form) return res.status(404).json({ message: 'Form not found' });

            res.status(200).json({ form });
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve form details', error });
        }
    };
