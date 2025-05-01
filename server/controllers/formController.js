const Form = require('../models/Form');
const User = require('../models/User');
const Notification = require("../models/Notification");
const EventTracker = require("../models/EventTracker");
const mongoose = require("mongoose");
const CalendarEvent = require("../models/CalendarEvent");
const moment = require('moment');
const BudgetProposal = require("../models/BudgetProposal");
const LocalOffCampus = require('../models/LocalOffCampus');

// HELPERS

// Enhanced event capacity check that handles both form types
const checkEventCapacity = async (startDate, endDate, currentFormId = null) => {
  // Ensure moment is available
  if (!moment) throw new Error("Moment.js library is not available");
  
  // Convert to UTC and normalize dates
  const start = moment.utc(startDate).startOf('day');
  const end = moment.utc(endDate).startOf('day');
  
  if (!start.isValid() || !end.isValid()) {
    throw new Error("Invalid date range provided");
  }

  // Build query to find overlapping events
  const query = {
    $or: [
      { startDate: { $lte: end.toDate() } }, 
      { endDate: { $gte: start.toDate() } }
    ]
  };
  
  if (currentFormId) {
    query.formId = { $ne: currentFormId };
  }

  const existingEvents = await CalendarEvent.find(query);
  
  // Count events per date
  const eventCounts = {};
  existingEvents.forEach(event => {
    const eventStart = moment.utc(event.startDate).startOf('day');
    const eventEnd = moment.utc(event.endDate).startOf('day');
    
    for (let date = eventStart.clone(); date <= eventEnd; date.add(1, 'days')) {
      const dateStr = date.format('YYYY-MM-DD');
      eventCounts[dateStr] = (eventCounts[dateStr] || 0) + 1;
    }
  });
  
  // Validate new event dates
  for (let date = start.clone(); date <= end; date.add(1, 'days')) {
    const dateStr = date.format('YYYY-MM-DD');
    if ((eventCounts[dateStr] || 0) >= 3) {
      throw new Error(`Maximum events reached (3) on ${date.format('MMMM Do YYYY')}`);
    }
  }
};

// Unified calendar event creator that handles both form types
// Updated createCalendarEventFromForm
// Updated createCalendarEventFromForm with better logging
const createCalendarEventFromForm = async (form, session) => {
  try {
    console.log(`Creating calendar event for form ${form._id} of type ${form.formType}`);
    
    if (!['Activity', 'Project'].includes(form.formType)) {
      console.log('Skipping - invalid form type');
      return null;
    }

    // Get dates based on form type
    const startDate = form.formType === 'Project' 
      ? form.startDate 
      : form.eventStartDate;
    const endDate = form.formType === 'Project'
      ? form.endDate || form.startDate
      : form.eventEndDate || form.eventStartDate;

    if (!startDate) {
      console.log('Skipping calendar event - missing start date');
      return null;
    }

    console.log(`Event dates: ${startDate} to ${endDate}`);

    // Double-check capacity
    await checkEventCapacity(startDate, endDate, form._id);

    // Create event data
    const eventData = {
      title: form.formType === 'Project' 
        ? form.projectTitle 
        : form.eventTitle,
      description: form.formType === 'Project'
        ? form.projectDescription
        : form.objectives,
      location: form.formType === 'Project'
        ? form.venue
        : form.venueAddress,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      formId: form._id,
      formType: form.formType,
      createdBy: form.createdBy,
      organization: form.studentOrganization || 
                  (await User.findById(form.createdBy)).organizationId
    };

    console.log('Creating event with data:', eventData);
    const createdEvent = await CalendarEvent.create([eventData], { session });
    console.log('Event created successfully:', createdEvent);
    return createdEvent;
  } catch (error) {
    console.error('Calendar event creation failed:', error);
    throw error; // Re-throw to handle in calling function
  }
};

// Helper to update calendar event when form changes
const updateCalendarEventFromForm = async (form) => {
  try {
    // Find existing event for this form
    const existingEvent = await CalendarEvent.findOne({ formId: form._id });
    
    if (!existingEvent) {
      return await createCalendarEventFromForm(form);
    }
    if (form.eventStartDate) {
      await checkEventCapacity(
        form.eventStartDate, 
        form.eventEndDate || form.eventStartDate, 
        form._id
      );
    }
    // Update event details
    existingEvent.title = form.title || form.projectTitle || `${form.formType} Form`;
    existingEvent.description = form.description || form.projectDescription || existingEvent.description;
    existingEvent.startDate = form.eventStartDate;
    existingEvent.endDate = form.eventEndDate || form.eventStartDate;
    existingEvent.location = form.location || existingEvent.location;

    return await existingEvent.save();
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return null;
  }
};

// Helper function to get required reviewers based on form type
const getRequiredReviewers = async (formType, organizationId = null) => {
  // For Project forms (unchanged)
  if (formType === 'Project') {
    return [
      { stepName: "Admin", reviewerRole: "Admin" },
      { stepName: "Academic Services", reviewerRole: "Academic Services" },
      { stepName: "Executive Director", reviewerRole: "Executive Director" }
    ];
  }

  // For Activity forms - dynamic based on organization type
  const baseSteps = [
    { stepName: "Adviser", reviewerRole: "Adviser" },
    { stepName: "Admin", reviewerRole: "Admin" },
    { stepName: "Academic Services", reviewerRole: "Academic Services" },
    { stepName: "Academic Director", reviewerRole: "Academic Director" },
    { stepName: "Executive Director", reviewerRole: "Executive Director" }
  ];

  // Only add Dean step if this is an academic organization
  if (organizationId) {
    const org = await User.findById(organizationId);
    if (org && org.organizationType === 'Recognized Student Organization - Academic') {
      // Insert Dean step after Adviser
      baseSteps.splice(1, 0, { 
        stepName: "Dean", 
        reviewerRole: "Dean" 
      });
    }
  }

  return baseSteps;
};

// Main controller methods
exports.getAllForms = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get all form types in parallel
    const [regularForms, localOffForms] = await Promise.all([
      Form.find({})
        .populate("studentOrganization")
        .populate("attachedBudget")
        .lean(),
      LocalOffCampus.find({})
        .populate("submittedBy")
        .lean()
    ]);

    // Transform LocalOffCampus forms to match the expected structure
    const transformedLocalOffForms = localOffForms.map(form => ({
      ...form,
      _id: form._id,
      formType: 'LocalOffCampus',
      finalStatus: form.status,
      applicationDate: form.createdAt || new Date(),
      emailAddress: form.submittedBy?.email || form.emailAddress,
      currentStep: form.currentStep || 0,
      // Add other necessary fields
      eventTitle: `Local Off-Campus (${form.formPhase})`,
      nameOfHei: form.nameOfHei,
      organizationName: form.nameOfHei // For consistent display
    }));

    // Combine all forms
    const allForms = [...regularForms, ...transformedLocalOffForms];

    // Fetch tracker data for all forms
    const formsWithTrackers = await Promise.all(
      allForms.map(async form => {
        try {
          const tracker = await EventTracker.findOne({ formId: form._id }).lean();
          return {
            ...form,
            currentStep: tracker?.currentStep || form.currentStep || 0,
            trackerId: tracker?._id
          };
        } catch (error) {
          console.error(`Error fetching tracker for form ${form._id}:`, error);
          return form;
        }
      })
    );

    if (!formsWithTrackers.length) {
      return res.status(404).json({ message: "No forms found" });
    }

    res.status(200).json(formsWithTrackers);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
};
// Update getFormById to populate attachedBudget:
exports.getFormById = async (req, res) => {
  try {
    const formId = req.params.formId;
    
    // First try regular Form collection
    let form = await Form.findById(formId)
      .populate('attachedBudget')
      .populate('studentOrganization');

    // If not found, try LocalOffCampus collection
    if (!form) {
      form = await LocalOffCampus.findById(formId)
        .populate('submittedBy');
      
      if (form) {
        // Transform to match expected structure
        form = {
          ...form.toObject(),
          formType: 'LocalOffCampus',
          finalStatus: form.status,
          eventTitle: `Local Off-Campus (${form.formPhase})`
        };
      }
    }

    // If still not found, try Budget collection if needed
    if (!form) {
      form = await BudgetProposal.findById(formId);
      if (form) {
        form = {
          ...form.toObject(),
          formType: 'Budget'
        };
      }
    }

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error('Error in getFormById:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.createForm = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // === 1. Set createdBy (MIRRORS BUDGET PROPOSAL) ===
    req.body.createdBy = req.user._id;

    // === 2. Set default application date if not provided ===
    if (!req.body.applicationDate) {
      req.body.applicationDate = new Date();
    }

    // === 3. Auto-populate email if user is logged in ===
    if (!req.body.emailAddress && req.user?.email) {
      req.body.emailAddress = req.user.email;
    }

    // === 4. Handle organization lookup (FOR ACTIVITY FORMS) ===
    if (req.body.studentOrganization) {
      let organization = null;


      if (req.body.studentOrganization) {
        if (mongoose.Types.ObjectId.isValid(req.body.studentOrganization)) {
          organization = await User.findOne({
            _id: req.body.studentOrganization,
            role: "Organization"
          }).session(session);
        } else {
          organization = await User.findOne({
            organizationName: req.body.studentOrganization,
            role: "Organization"
          }).session(session);
        }
      
        if (!organization) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: "Organization not found" });
        }
      
        req.body.studentOrganization = organization._id;
        req.body.presidentName = organization.presidentName;
        req.body.presidentSignature = organization.presidentSignature;
        
        if (!organization.presidentSignature) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            error: "Organization president signature is required" 
          });
        }
      }
    }

    // === 5. Budget Attachment Logic (UPDATED TO MIRROR BUDGET PROPOSAL) ===
   // In your formController's createForm function:

if (req.body.attachedBudget) {
  // Resolve organization context
  let organizationId;
  
  // Case 1: Activity form with studentOrganization
  if (req.body.studentOrganization) {
    organizationId = req.body.studentOrganization;
  } 
  // Case 2: Project form - get org from user
  else {
    if (req.user.role === 'Organization') {
      organizationId = req.user._id;
    } else {
      organizationId = req.user.organizationId;
    }
  }

  // Validate budget belongs to org
  const validBudget = await BudgetProposal.findOne({
    _id: req.body.attachedBudget,
    organization: organizationId,
    isActive: true
  }).session(session);

  if (!validBudget) {
    await session.abortTransaction();
    session.endSession();
    return res.status(403).json({ 
      error: "Budget not found or not owned by your organization" 
    });
  }

  // Attach budget data
  req.body.budgetAmount = validBudget.grandTotal;
  req.body.budgetFrom = validBudget.nameOfRso;
}
    // === 6. New Budget Creation (FOR PROJECTS/ACTIVITIES) ===
    else if (req.body.budgetData) {
      let organizationId, organizationName;

      // Priority 1: Explicit studentOrganization (Activity forms)
      if (req.body.studentOrganization) {
        organizationId = req.body.studentOrganization;
        const org = await User.findById(organizationId).session(session);
        organizationName = org?.organizationName || 'Organization';
      } 
      // Priority 2: User's organization (Project forms)
      else if (req.user.organizationId) {
        organizationId = req.user.organizationId;
        organizationName = req.user.organizationName || 'Organization';
      }
      // Priority 3: User is an organization
      else if (req.user.role === 'Organization') {
        organizationId = req.user._id;
        organizationName = req.user.organizationName || 'Organization';
      } 
      else {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          error: "Cannot create budget: No organization specified" 
        });
      }

      const budgetProposal = new BudgetProposal({
        nameOfRso: organizationName,
        eventTitle: req.body.budgetData.eventTitle || req.body.eventTitle || 'Budget Proposal',
        items: req.body.budgetData.items.map(item => ({
          quantity: Number(item.quantity),
          unit: item.unit.trim(),
          description: item.description.trim(),
          unitCost: Number(item.unitCost),
          totalCost: Number(item.quantity * item.unitCost)
        })),
        grandTotal: req.body.budgetData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
        createdBy: req.user._id,
        organization: organizationId,
        isActive: true,
        status: 'submitted'
      });

      await budgetProposal.save({ session });
      req.body.attachedBudget = budgetProposal._id;
      req.body.budgetAmount = budgetProposal.grandTotal;
      req.body.budgetFrom = budgetProposal.nameOfRso;
    }

    // === 7. Form Type Validation ===
    switch (req.body.formType) {
      case 'Activity':
        if (!req.body.studentOrganization) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: "studentOrganization is required for Activity forms" });
        }
        break;

      case 'Project':
        if (!req.body.projectTitle || !req.body.projectDescription) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: "Project title and description are required" });
        }
        break;

      case 'Budget':
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          error: `${req.body.formType} forms require specialized submission endpoints` 
        });

      default:
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Invalid form type" });
    }

    // === 8. Create Form ===
    const form = new Form({
      ...req.body,
      createdBy: req.user._id // Ensured to be set
    });
    await form.save({ session });

    // === 9. Post-Creation Steps ===
    // Link budget to form
    if (req.body.attachedBudget) {
      await BudgetProposal.findByIdAndUpdate(
        req.body.attachedBudget,
        { associatedForm: form._id },
        { session }
      );
    }

// In your createForm function, before calendar event creation:
if (['Activity', 'Project'].includes(form.formType)) {
  try {
    const startDate = form.formType === 'Project' 
      ? form.startDate 
      : form.eventStartDate;
    const endDate = form.formType === 'Project'
      ? form.endDate || form.startDate
      : form.eventEndDate || form.eventStartDate;

    await checkEventCapacity(startDate, endDate);
    
    // Proceed with calendar event creation
    console.log(`Attempting to create calendar event for form ${form._id}`);
    await createCalendarEventFromForm(form, session);
  } catch (capacityError) {
    console.log('Event capacity check failed:', capacityError.message);
    // Continue form submission but skip calendar event
  }
}
    // Create progress tracker
// Create progress tracker
const requiredReviewers = await getRequiredReviewers(
  form.formType, 
  organization?._id
);

// Find advisers and deans first if needed
const adviser = organization ? await User.findOne({
  role: "Authority",
  faculty: "Adviser",
  organization: organization.organizationName,
  status: "Active"
}).session(session).select('_id') : null;

const dean = (organization?.organizationType === 'Recognized Student Organization - Academic') ? 
  await User.findOne({  
    role: "Authority",
    faculty: "Dean",
    organization: organization.organizationName,
    status: "Active"
  }).session(session).select('_id') : null;

// Create progress tracker
const tracker = new EventTracker({
  formId: form._id,
  formType: form.formType,
  steps: requiredReviewers.map(reviewer => ({
    stepName: reviewer.stepName,
    reviewerRole: reviewer.reviewerRole,
    status: "pending",
    // For Adviser step, use pre-fetched adviser
    ...(reviewer.reviewerRole === 'Adviser' && adviser ? {
      assignedReviewer: adviser._id
    } : {}),
    // For Dean step, use pre-fetched dean
    ...(reviewer.reviewerRole === 'Dean' && dean ? {
      assignedReviewer: dean._id
    } : {})
  })),
  currentStep: 0,
  currentAuthority: requiredReviewers[0].reviewerRole,
  organizationId: organization?._id,
  organizationType: organization?.organizationType
});

await tracker.save({ session });

    // Send notification
    if (form.emailAddress) {
      await Notification.create([{
        userEmail: form.emailAddress,
        message: `Your ${form.formType} form has been submitted!`,
        read: false,
        timestamp: new Date()
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      form: form.toObject(),
      tracker: tracker.toObject()
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Form creation error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: "Server Error",
      details: error.message 
    });
  }
};

exports.deleteForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const userEmail = req.user?.email;
    const isAdmin = req.user?.role === 'Admin';

    // Find the form - check both Form and LocalOffCampus collections
    let form = await Form.findById(formId);
    if (!form) {
      form = await LocalOffCampus.findById(formId);
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
    }

    const isSubmitter = form.emailAddress === userEmail || 
                      (form.createdBy && form.createdBy.equals(req.user._id));
    if (!isAdmin && !isSubmitter) {
      return res.status(403).json({ 
        message: 'Only the form submitter or admin can delete this form' 
      });
    }

    // Get tracker if it's not a Budget form
    const tracker = form.formType === 'Budget' ? null : await EventTracker.findOne({ formId });
    
    // Define restricted stages based on form type
    let restrictedStages = [];
    if (form.formType === 'Project') {
      restrictedStages = ['Admin', 'Academic Services', 'Executive Director'];
    } else if (form.formType === 'Activity') {
      restrictedStages = ['Dean', 'Admin', 'Academic Services', 'Academic Director', 'Executive Director'];
    }
    // LocalOffCampus forms might have different restrictions

    if (tracker && restrictedStages.length > 0) {
      const hasPassedRestrictedStage = tracker.steps.some(step => {
        return restrictedStages.includes(step.reviewerRole) && 
               (step.status === 'approved' || step.status === 'declined');
      });

      if (hasPassedRestrictedStage && !isAdmin) {
        return res.status(403).json({
          message: 'Form cannot be deleted as it has progressed beyond allowed review stages'
        });
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete from appropriate collection
      if (form instanceof LocalOffCampus) {
        await LocalOffCampus.findByIdAndDelete(formId).session(session);
      } else {
        await Form.findByIdAndDelete(formId).session(session);
      }

      // Delete tracker if exists
      if (tracker) {
        await EventTracker.deleteOne({ formId }).session(session);
      }

      // Delete calendar event if exists
      await CalendarEvent.deleteOne({ formId }).session(session);

      // Delete notifications
      const emailToCheck = form.emailAddress || req.user.email;
      if (emailToCheck) {
        await Notification.deleteMany({
          userEmail: emailToCheck,
          message: { $regex: form.formType, $options: 'i' }
        }).session(session);
      }

      // If it's a Project form with attached budget, handle budget
      if (form.formType === 'Project' && form.attachedBudget) {
        await BudgetProposal.findByIdAndUpdate(
          form.attachedBudget,
          { isActive: false },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ 
        message: 'Form and all associated data deleted successfully',
        deletedFormId: formId
      });

    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction Error:", transactionError);
      throw transactionError;
    }

  } catch (error) {
    console.error("Form Deletion Error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: "Invalid form ID format" 
      });
    }
    
    res.status(500).json({ 
      error: "Server error during form deletion", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const updates = req.body;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.emailAddress !== req.user.email) {
      return res.status(403).json({ 
        message: 'Only the original submitter can edit this form' 
      });
    }

    // Skip budget-specific validation since budget forms will be handled separately
    if (form.formType === 'Activity' || form.formType === 'Project') {
      if (updates.eventStartDate) {
        const endDate = updates.eventEndDate || form.eventEndDate || updates.eventStartDate;
        await checkEventCapacity(updates.eventStartDate, endDate, formId);
      }
    }

    const tracker = await EventTracker.findOne({ formId });
    if (form.formType !== 'Budget' && !tracker) {
      return res.status(404).json({ message: 'Progress tracker not found' });
    }

    if (form.formType === 'Project' && tracker) {
      const isUnderReview = tracker.steps.some(
        step => step.status === 'approved' || step.status === 'declined'
      );
      
      if (isUnderReview) {
        return res.status(403).json({ 
          message: 'Project form cannot be edited once review has started' 
        });
      }
    } else if (tracker) {
      const isDeanReviewing = tracker.currentAuthority === 'Dean';
      const isDeanApproved = tracker.steps.some(
        step => step.stepName === 'Dean' && step.status === 'approved'
      );

      if (isDeanReviewing || isDeanApproved) {
        return res.status(403).json({ 
          message: 'Form cannot be edited once it reaches the Dean for review/approval' 
        });
      }
    }

    const updateOptions = {
      new: true,
      runValidators: true
    };

    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      { 
        ...updates,
        lastEdited: new Date()
      },
      updateOptions
    );

    // Reset tracker if exists
    if (tracker) {
      const firstStep = tracker.steps[0];
      if (tracker.currentStep !== firstStep.stepName) {
        await EventTracker.updateOne(
          { formId },
          { 
            $set: { 
              currentStep: firstStep.stepName,
              currentAuthority: firstStep.reviewerRole,
              "steps.$[].status": "pending",
              "steps.$[].remarks": "",
              "steps.$[].timestamp": null
            } 
          }
        );
        await EventTracker.updateOne(
          { formId, "steps.stepName": firstStep.stepName },
          { $set: { "steps.$.status": "pending" } }
        );
      }
    }

    if (['Activity', 'Project'].includes(form.formType) && updates.eventStartDate) {
      await updateCalendarEventFromForm(updatedForm);
    }

    if (form.emailAddress) {
      await Notification.create({
        userEmail: form.emailAddress,
        message: `Your ${form.formType} form has been updated!`,
        read: false,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      message: 'Form updated successfully',
      form: updatedForm,
      tracker: form.formType !== 'Budget' ? await EventTracker.findOne({ formId }) : null
    });

  } catch (error) {
    console.error("Form Update Error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation Error",
        details: errors 
      });
    }
    
    res.status(500).json({ 
      error: "Server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
