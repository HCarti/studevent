const Form = require('../models/Form');
const User = require('../models/User');
const Notification = require("../models/Notification");
const EventTracker = require("../models/EventTracker");
const mongoose = require("mongoose");
const CalendarEvent = require("../models/CalendarEvent");
const moment = require('moment');
const BudgetProposal = require("../models/BudgetProposal");
const LocalOffCampus = require('../models/LocalOffCampus');
const notificationController = require('./notificationController');

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
// formController.js
exports.getAllForms = async (req, res) => {
  try {
    const user = req.user;
    console.log('User making request:', {
      _id: user._id,
      role: user.role,
      faculty: user.faculty,
      organization: user.organization,
      deanForOrganization: user.deanForOrganization
    });
    
    // For Admin - return all forms
    if (user.faculty === 'Admin') {
      console.log('Processing admin request');
      const allForms = await getAllFormsWithTrackers();
      return res.status(200).json(allForms);
    }

    // For Organization - return all their forms
    if (user.role === 'Organization') {
      console.log('Processing organization request');
      const orgForms = await getOrganizationForms(user._id, user.organizationName);
      return res.status(200).json(orgForms);
    }

    // For all other roles
    console.log(`Processing request for ${user.faculty || user.role}`);
    const roleSpecificForms = await getFormsByTrackerStep(user);
    return res.status(200).json(roleSpecificForms);

  } catch (error) {
    console.error("Error in getAllForms:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to get forms where tracker.currentStep matches user role
async function getFormsByTrackerStep(user) {
  // Determine current step based on role/faculty
  let currentStep;
  if (user.faculty === 'Adviser') {
    currentStep = 'Adviser';
  } else if (user.faculty === 'Dean') {
    currentStep = 'Dean';
  } else {
    // For Academic Services, Academic Director, Executive Director
    currentStep = user.faculty;
  }

  console.log(`Processing forms for ${user.faculty || user.role} at step: ${currentStep}`);

  let validTrackers = [];

  // Adviser-specific filtering
  if (user.faculty === 'Adviser') {
    if (!user.organization) {
      console.error('Adviser missing organization field');
      return [];
    }

    console.log(`Looking for forms in organization: ${user.organization}`);
    const orgFormIds = await getFormIdsForOrganization(user.organization);
    console.log(`Found ${orgFormIds.length} form IDs for organization`);
    
    if (orgFormIds.length === 0) return [];

    const trackers = await EventTracker.find({
      formId: { $in: orgFormIds },
      currentStep: 'Adviser'
    }).populate('formId').lean();

    validTrackers = trackers.filter(t => t.formId && t.formId._id);
  }
  // Dean-specific filtering
  else if (user.faculty === 'Dean') {
    if (!user.deanForOrganization) {
      console.error('Dean missing deanForOrganization field');
      return [];
    }

    console.log(`Looking for academic forms in organization: ${user.deanForOrganization}`);
    const orgFormIds = await getFormIdsForOrganization(user.deanForOrganization);
    console.log(`Found ${orgFormIds.length} form IDs for academic organization`);
    
    if (orgFormIds.length === 0) return [];

    const trackers = await EventTracker.find({
      formId: { $in: orgFormIds },
      currentStep: 'Dean'
    }).populate('formId').lean();

    validTrackers = trackers.filter(t => t.formId && t.formId._id);
  }
  // For Academic Services, Academic Director, Executive Director
  else {
    // Simply find all trackers at current step
    const trackers = await EventTracker.find({
      currentStep: currentStep
    }).populate('formId').lean();

    validTrackers = trackers.filter(t => t.formId && t.formId._id);
  }

  console.log(`Found ${validTrackers.length} valid trackers`);

  if (validTrackers.length === 0) return [];

  // Get form data
  const formIds = validTrackers.map(t => t.formId._id || t.formId);
  
  const [regularForms, localOffForms] = await Promise.all([
    Form.find({ _id: { $in: formIds } })
      .populate("studentOrganization")
      .lean(),
    LocalOffCampus.find({ _id: { $in: formIds } })
      .populate("submittedBy")
      .lean()
  ]);

  const transformedLocalOffForms = transformLocalForms(localOffForms);
  const allForms = [...regularForms, ...transformedLocalOffForms];

  return allForms.map(form => {
    const tracker = validTrackers.find(t => 
      (t.formId._id || t.formId).toString() === form._id.toString()
    );
    return {
      ...form,
      currentStep: tracker.currentStep,
      currentAuthority: tracker.currentAuthority,
      trackerId: tracker._id,
      trackerData: tracker.steps || []
    };
  });
}

// Helper function to get form IDs for an organization name
async function getFormIdsForOrganization(organizationName) {
  try {
    // Find organization by name (works for both regular and academic orgs)
    const organization = await User.findOne({
      organizationName: organizationName,
      $or: [
        { role: 'Organization' },
        { organizationType: 'Recognized Student Organization - Academic' }
      ]
    }).select('_id organizationType').lean();

    if (!organization) {
      console.log(`No organization found with name: ${organizationName}`);
      return [];
    }

    console.log(`Found ${organization.organizationType || 'regular'} organization: ${organization._id}`);

    // Rest of the function remains the same...
    const [regularForms, localOffForms] = await Promise.all([
      Form.find({ 
        $or: [
          { studentOrganization: organization._id },
          { 'studentOrganization.organizationName': organizationName }
        ]
      }).select('_id').lean(),
      LocalOffCampus.find({ 
        $or: [
          { nameOfHei: organizationName },
          { organizationName: organizationName }
        ]
      }).select('_id').lean()
    ]);

    return [...regularForms.map(f => f._id), ...localOffForms.map(f => f._id)];
  } catch (error) {
    console.error('Error in getFormIdsForOrganization:', error);
    return [];
  }
}

// Other helper functions remain the same
async function getAllFormsWithTrackers() {
  try {
    console.log('Fetching all forms for admin');
    
    // Get all forms (both regular and local) with full population
    const [regularForms, localOffForms] = await Promise.all([
      Form.find({})
        .populate({
          path: "studentOrganization",
          select: "_id organizationName organizationType faculty"
        })
        .populate("attachedBudget")
        .lean(),
      
      LocalOffCampus.find({})
        .populate("submittedBy", "_id email firstName lastName")
        .lean()
    ]);

    console.log(`Found ${regularForms.length} regular forms and ${localOffForms.length} local forms`);

    // Transform local forms to match regular form structure
    const transformedLocalOffForms = localOffForms.map(form => ({
      ...form,
      formType: 'LocalOffCampus',
      finalStatus: form.status,
      applicationDate: form.createdAt || new Date(),
      emailAddress: form.submittedBy?.email || form.emailAddress,
      eventTitle: `Local Off-Campus (${form.formPhase})`,
      nameOfHei: form.nameOfHei,
      organizationName: form.nameOfHei
    }));

    const allForms = [...regularForms, ...transformedLocalOffForms];
    
    // Add tracker data to all forms
    const formsWithTrackers = await Promise.all(
      allForms.map(async form => {
        const tracker = await EventTracker.findOne({ formId: form._id }).lean();
        return {
          ...form,
          currentStep: tracker?.currentStep || "N/A",
          currentAuthority: tracker?.currentAuthority || "N/A",
          trackerId: tracker?._id,
          trackerData: tracker?.steps || []
        };
      })
    );

    console.log(`Returning ${formsWithTrackers.length} forms with tracker data`);
    return formsWithTrackers;
    
  } catch (error) {
    console.error('Error in getAllFormsWithTrackers:', error);
    throw error; // Let the parent function handle the error
  }
}

async function getOrganizationForms(orgId, orgName) {
  const [regularForms, localOffForms] = await Promise.all([
    Form.find({ studentOrganization: orgId })
      .populate("studentOrganization", "_id organizationName organizationType faculty")
      .populate("attachedBudget")
      .lean(),
    LocalOffCampus.find({ nameOfHei: orgName })
      .populate("submittedBy", "_id email firstName lastName")
      .lean()
  ]);

  const transformedLocalOffForms = transformLocalForms(localOffForms);
  const allForms = [...regularForms, ...transformedLocalOffForms];
  
  return addTrackerData(allForms);
}

function transformLocalForms(localOffForms) {
  return localOffForms.map(form => ({
    ...form,
    formType: 'LocalOffCampus',
    finalStatus: form.status,
    applicationDate: form.createdAt || new Date(),
    emailAddress: form.submittedBy?.email || form.emailAddress,
    eventTitle: `Local Off-Campus (${form.formPhase})`,
    nameOfHei: form.nameOfHei,
    organizationName: form.nameOfHei
  }));
}

async function addTrackerData(forms) {
  return Promise.all(
    forms.map(async form => {
      const tracker = await EventTracker.findOne({ formId: form._id }).lean();
      return {
        ...form,
        currentStep: tracker?.currentStep || "N/A",
        currentAuthority: tracker?.currentAuthority || "N/A",
        trackerId: tracker?._id,
        trackerData: tracker?.steps || []
      };
    })
  );
}

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
  let transactionCompleted = false;

  try {
    await session.startTransaction();

    // === 1. Set createdBy ===
    req.body.createdBy = req.user._id;

    // === 2. Set default application date ===
    if (!req.body.applicationDate) {
      req.body.applicationDate = new Date();
    }

    // === 3. Auto-populate email ===
    if (!req.body.emailAddress && req.user?.email) {
      req.body.emailAddress = req.user.email;
    }

    // === 4. Handle organization lookup ===
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

    // === 5. Budget Attachment Logic ===
    if (req.body.attachedBudget) {
      let organizationId;
      if (req.body.studentOrganization) {
        organizationId = req.body.studentOrganization;
      } else {
        if (req.user.role === 'Organization') {
          organizationId = req.user._id;
        } else {
          organizationId = req.user.organizationId;
        }
      }

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

      req.body.budgetAmount = validBudget.grandTotal;
      req.body.budgetFrom = validBudget.nameOfRso;
    }
    // === 6. New Budget Creation ===
    else if (req.body.budgetData) {
      let organizationId, organizationName;

      if (req.body.studentOrganization) {
        organizationId = req.body.studentOrganization;
        const org = await User.findById(organizationId).session(session);
        organizationName = org?.organizationName || 'Organization';
      } else if (req.user.organizationId) {
        organizationId = req.user.organizationId;
        organizationName = req.user.organizationName || 'Organization';
      } else if (req.user.role === 'Organization') {
        organizationId = req.user._id;
        organizationName = req.user.organizationName || 'Organization';
      } else {
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
      createdBy: req.user._id
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

    // Create calendar event if applicable
    if (['Activity', 'Project'].includes(form.formType)) {
      try {
        const startDate = form.formType === 'Project' 
          ? form.startDate 
          : form.eventStartDate;
        const endDate = form.formType === 'Project'
          ? form.endDate || form.startDate
          : form.eventEndDate || form.eventStartDate;

        await checkEventCapacity(startDate, endDate);
        await createCalendarEventFromForm(form, session);
      } catch (capacityError) {
        console.log('Event capacity check failed:', capacityError.message);
      }
    }

    // Create progress tracker
    const requiredReviewers = await getRequiredReviewers(
      form.formType, 
      organization?._id
    );

    // Find adviser with email
    const adviser = organization ? await User.findOne({
      role: "Authority",
      faculty: "Adviser",
      organization: organization.organizationName,
      status: "Active"
    }).session(session).select('_id email firstName lastName') : null;

    // Create tracker
    const tracker = new EventTracker({
      formId: form._id,
      formType: form.formType,
      steps: requiredReviewers.map(reviewer => ({
        stepName: reviewer.stepName,
        reviewerRole: reviewer.reviewerRole,
        status: "pending"
      })),
      currentStep: requiredReviewers[0].stepName,
      currentAuthority: requiredReviewers[0].reviewerRole,
      organizationId: organization?._id,
      organizationType: organization?.organizationType
    });
    await tracker.save({ session });

    // Send notifications after all database operations are complete
    if (adviser?.email) {
      try {
        const formName = form.formType === 'Activity' 
          ? form.eventTitle || `Activity Form ${form._id}`
          : form.formType === 'Project' 
            ? form.projectTitle || `Project Form ${form._id}`
            : `Form ${form._id}`;

        const submitterName = req.user.firstName 
          ? `${req.user.firstName} ${req.user.lastName}` 
          : req.user.email.split('@')[0] || 'a submitter';

        await notificationController.createNotification(
          adviser.email,
          `New ${form.formType} form "${formName}" has been submitted by ${submitterName} and requires your review.`,
          'tracker',
          { 
            formId: form._id, 
            formType: form.formType,
            organizationName: organization?.organizationName 
          }
        );
      } catch (notificationError) {
        console.error('Failed to send adviser notification:', notificationError);
      }
    }

    // Send confirmation to submitter
    if (form.emailAddress) {
      try {
        await Notification.create([{
          userEmail: form.emailAddress,
          message: `Your ${form.formType} form has been submitted successfully!`,
          type: 'tracker',
          formId: form._id,
          formType: form.formType,
          read: false,
          createdAt: new Date()
        }], { session });
      } catch (submitterNotificationError) {
        console.error('Failed to send submitter notification:', submitterNotificationError);
      }
    }

    // Commit transaction
    await session.commitTransaction();
    transactionCompleted = true;
    session.endSession();

    res.status(201).json({
      form: form.toObject(),
      tracker: tracker.toObject()
    });

  } catch (error) {
    // Only abort transaction if it wasn't completed
    if (!transactionCompleted && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) {
      session.endSession();
    }
    
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
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { formId } = req.params;
    const updates = req.body;
    const user = req.user;

    // Find the form with budget populated
    let form = await Form.findById(formId)
      .populate('attachedBudget')
      .session(session);
      
    if (!form) {
      form = await LocalOffCampus.findById(formId).session(session);
      if (!form) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Form not found' });
      }
    }

    // Authorization check
    const isSubmitter = form.emailAddress === user.email || 
                       (form.createdBy && form.createdBy.equals(user._id));
    const isAdmin = user.role === 'Admin';
    
    if (!isSubmitter && !isAdmin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ 
        message: 'Only the original submitter or admin can edit this form' 
      });
    }

    // Find the tracker
    const tracker = await EventTracker.findOne({ formId }).session(session);
    
    // Check if this is a declined form that's being resubmitted
    const hasDeclinedStep = tracker && tracker.steps.some(step => step.status === 'declined');
    const isDeanApproved = tracker && tracker.steps.some(
      step => step.stepName === 'Dean' && step.status === 'approved'
    );

    // For non-declined forms, perform regular checks
    if (tracker && !hasDeclinedStep) {
      if (form.formType === 'Project') {
        const isUnderReview = tracker.steps.some(
          step => step.status === 'approved' || step.status === 'declined'
        );
        
        if (isUnderReview) {
          await session.abortTransaction();
          session.endSession();
          return res.status(403).json({ 
            message: 'Project form cannot be edited once review has started' 
          });
        }
      } else {
        const isDeanReviewing = tracker.currentAuthority === 'Dean';

        if (isDeanReviewing || isDeanApproved) {
          await session.abortTransaction();
          session.endSession();
          return res.status(403).json({ 
            message: 'Form cannot be edited once it reaches the Dean for review/approval' 
          });
        }
      }
    }
    
    // Enhanced budget validation with debug logging
    // In your updateForm controller
        // Enhanced budget validation in updateForm controller
        if (updates.attachedBudget !== undefined) {
          // If removing budget
          if (!updates.attachedBudget) {
            updates.budgetAmount = undefined;
            updates.budgetFrom = undefined;
          } 
          // If adding/changing budget
          else {
            // Skip validation if budget hasn't changed
            if (form.attachedBudget && String(form.attachedBudget._id) === String(updates.attachedBudget)) {
              console.log('Budget unchanged - skipping validation');
            } else {
              // Simplified validation - just check existence and active status
              const budget = await BudgetProposal.findOne({
                _id: updates.attachedBudget,
                isActive: true
              }).session(session);
        
              if (!budget) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                  error: "Invalid Budget",
                  message: "Budget must exist and be active"
                });
              }
        
              // Form-type specific validations
              if (form.formType === 'Activity') {
                // Example: Activity forms require budget to have eventTitle
                if (!budget.eventTitle) {
                  await session.abortTransaction();
                  session.endSession();
                  return res.status(400).json({
                    error: "Invalid Budget",
                    message: "Activity forms require budgets with event titles"
                  });
                }
              }
              else if (form.formType === 'Project') {
                // Project-specific validations
              }
        
              // Auto-populate related fields
              updates.budgetAmount = budget.grandTotal;
              updates.budgetFrom = budget.nameOfRso || 'Org';
            }
          }
        }

    // Handle declined form resubmission
    if (hasDeclinedStep) {
      const isOrganizationUser = user.role === 'Organization' && 
                               (form.studentOrganization.equals(user._id) || 
                                user.organizationId.equals(form.studentOrganization));
      
      if (!isOrganizationUser && !isAdmin) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ 
          message: 'Only the organization can update a declined form' 
        });
      }

      const declinedStep = tracker.steps.find(step => step.status === 'declined');
      if (declinedStep) {
        tracker.currentStep = declinedStep.stepName;
        tracker.currentAuthority = declinedStep.reviewerRole;
        tracker.currentStatus = 'pending';
        
        const declinedStepIndex = tracker.steps.findIndex(step => step.stepName === declinedStep.stepName);
        for (let i = declinedStepIndex; i < tracker.steps.length; i++) {
          tracker.steps[i].status = 'pending';
          tracker.steps[i].remarks = '';
          tracker.steps[i].timestamp = null;
        }
        
        await tracker.save({ session });
      }
    }

    // Perform the form update
    const updateOptions = {
      new: true,
      runValidators: true,
      session
    };
    
    let updatedForm;
    if (form instanceof LocalOffCampus) {
      updatedForm = await LocalOffCampus.findByIdAndUpdate(
        formId,
        { 
          ...updates,
          lastEdited: new Date(),
          status: hasDeclinedStep ? 'pending' : form.status // Use 'pending' instead of 'resubmitted'
        },
        updateOptions
      );
    } else {
      updatedForm = await Form.findByIdAndUpdate(
        formId,
        { 
          ...updates,
          lastEdited: new Date(),
          finalStatus: hasDeclinedStep ? 'pending' : form.finalStatus // Use 'pending' instead of 'resubmitted'
        },
        updateOptions
      );
    }
    
    // Update calendar event if needed
    if (['Activity', 'Project'].includes(form.formType)) {
      if (updates.eventStartDate || updates.eventEndDate || updates.venue || updates.eventTitle) {
        await updateCalendarEventFromForm(updatedForm);
      }
    }
    
    // Notification handling
    if (hasDeclinedStep) {
      const currentStep = tracker.steps.find(step => step.stepName === tracker.currentStep);
      if (currentStep) {
        const reviewers = await User.find({ 
          role: currentStep.reviewerRole,
          status: 'Active'
        }).session(session);
    
        await Promise.all(reviewers.map(async reviewer => {
          try {
            await notificationController.createNotification(
              reviewer.email,
              `A ${form.formType} form you previously declined has been updated and requires your review.`,
              'tracker',
              { 
                formId: form._id, 
                formType: form.formType,
                organizationName: form.studentOrganization?.organizationName || form.organizationName 
              },
              session
            );
          } catch (error) {
            console.error('Notification error:', error);
          }
        }));
      }
    }
    
    // Send confirmation
    if (form.emailAddress) {
      await Notification.create([{
        userEmail: form.emailAddress,
        message: `Your ${form.formType} form has been ${hasDeclinedStep ? 'updated and requires review' : 'updated'} successfully!`,
        type: 'tracker',
        formId: form._id,
        formType: form.formType,
        read: false,
        createdAt: new Date()
      }], { session });
    }
    
    await session.commitTransaction();
    await session.endSession();
    
    res.status(200).json({
      message: hasDeclinedStep ? 'Form updated and review process restarted' : 'Form updated successfully',
      form: updatedForm,
      tracker: tracker ? await EventTracker.findOne({ formId }) : null
    });

  } catch (error) {
    session.endSession();
    
    console.error("Form Update Error:", {
      message: error.message,
      stack: error.stack,
      formId: req.params.formId,
      userId: req.user?._id,
      updates: req.body
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation Error",
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};