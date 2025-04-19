const mongoose = require('mongoose');

const reviewStageSchema = new mongoose.Schema({
    role: { 
        type: String, 
        enum: ['Adviser', 'Dean', 'AcademicServices', 'AcademicDirector', 'Executive Director'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'declined'], 
        default: 'pending' 
    },
    remarks: { type: String },
    timestamp: { type: Date }
});


// ===PROJECT PROPOSAL===

const programFlowSchema = new mongoose.Schema({
    timeRange: {  // Combined field
        type: String,
        required: function() { return this.formType === 'Project'; },
        validate: {
            validator: function(v) {
                // Validate format: "HH:MM-HH:MM"
                const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!regex.test(v)) return false;
                
                // Extract times
                const [start, end] = v.split('-');
                return convertToMinutes(start) < convertToMinutes(end);
            },
            message: props => `Invalid time range! Use "HH:MM-HH:MM" format with end > start`
        }
    },
    duration: {  // Can be auto-calculated
        type: Number,
        default: function() {
            if (!this.timeRange) return undefined;
            const [start, end] = this.timeRange.split('-');
            return convertToMinutes(end) - convertToMinutes(start);
        }
    },
    segment: { 
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
});

// Helper function
function convertToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

const projectHeadsSchema = new mongoose.Schema({
    headName:{
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
    designatedOffice:{
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
});

const workingCommitteesSchema = new mongoose.Schema({
    workingName:{
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
    designatedTask:{
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
});

const taskDeligationSchema = new mongoose.Schema({
    taskList:{
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
    deadline: {
        type: Date,  // Changed from String to Date
        required: function() { return this.formType === 'Project'; },
        get: (date) => date?.toISOString().split('T')[0] // Optional: Format as YYYY-MM-DD
    }
}, { toJSON: { getters: true } });

const timelineSchedulesSchema = new mongoose.Schema({
    publicationMaterials:{
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
    schedule: {
        type: Date,  // Changed from String to Date
        required: function() { return this.formType === 'Project'; },
        get: (date) => date?.toISOString().split('T')[0] // Optional: Format as YYYY-MM-DD
    }
});

const equipmentsNeedSchema = new mongoose.Schema({
    equipments:{
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
    estimatedQuantity:{
        type: Number, 
        required: function() { return this.formType === 'Project'; }
    },
});

// const projectBudgetSchema = new mongoose.Schema({
//     budgetItems:{
//         type: String, 
//         required: function() { return this.formType === 'Project'; }
//     },
//     budgetEstimatedQuantity:{
//         type: Number, 
//         required: function() { return this.formType === 'Project'; }
//     },
//     budgetPerUnit:{
//         type: Number, 
//         required: function() { return this.formType === 'Project'; }
//     },
//     budgetEstimatedAmount:{
//         type: Number, 
//         required: function() { return this.formType === 'Project'; }
//     },
// });

// Schema for individual compliance items with remarks
const complianceItemSchema = new mongoose.Schema({
    compliance: {
        type: String,
        enum: ['yes', 'no'],
        required: true
    },
    remarks: {
        type: String,
        default: ""
    }
});

// Schema for basic information (BEFORE phase)
const basicInformationSchema = new mongoose.Schema({
    programName: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    destinationAndVenue: {
        type: String,
        required: true
    },
    inclusiveDates: {
        type: Date,
        required: true
    },
    numberOfStudents: {
        type: Number,
        required: true,
        min: 1
    },
    listOfPersonnelIncharge: {
        type: String,
        required: true
    }
});

// Schema for activities off campus (BEFORE phase)
const activitiesOffCampusSchema = new mongoose.Schema({
    curriculumRequirement: complianceItemSchema,
    destination: complianceItemSchema,
    handbook: complianceItemSchema,
    guardianConsent: complianceItemSchema,
    personnelInCharge: complianceItemSchema,
    firstAidKit: complianceItemSchema,
    feesFunds: complianceItemSchema,
    insurance: complianceItemSchema,
    studentVehicles: complianceItemSchema,
    lgusNgos: complianceItemSchema,
    consultationAnnouncements: complianceItemSchema
});

// Schema for after activity report (AFTER phase)
const afterActivitySchema = new mongoose.Schema({
    programs: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    noOfStudents: {
        type: Number,
        required: true,
        min: 0
    },
    noofHeiPersonnel: {
        type: Number,
        required: true,
        min: 0
    }
});

// Main Local Off Campus schema
const localOffCampusSchema = new mongoose.Schema({
    formPhase: {
        type: String,
        enum: ['BEFORE', 'AFTER'],
        required: true
    },
    // Common fields (partially required in BEFORE, fully in AFTER)
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        required: function() {
            return this.formPhase === 'AFTER';
        }
    },
    // BEFORE phase specific fields
    nameOfHei: {
        type: String,
        required: function() {
            return this.formPhase === 'BEFORE';
        }
    },
    region: {
        type: String,
        required: function() {
            return this.formPhase === 'BEFORE';
        }
    },
    address: {
        type: String,
        required: function() {
            return this.formPhase === 'BEFORE';
        }
    },
    basicInformation: {
        type: [basicInformationSchema],
        required: function() {
            return this.formPhase === 'BEFORE';
        },
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one basic information entry is required'
        }
    },
    activitiesOffCampus: {
        type: [activitiesOffCampusSchema],
        required: function() {
            return this.formPhase === 'BEFORE';
        },
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one activity entry is required'
        }
    },
    // AFTER phase specific fields
    afterActivity: {
        type: [afterActivitySchema],
        required: function() {
          return this.formPhase === 'AFTER'; // Only required for AFTER phase
        },
        validate: {
          validator: function(v) {
            // Only validate array length for AFTER phase
            return this.formPhase !== 'AFTER' || v.length > 0;
          },
          message: 'At least one after activity entry is required for AFTER phase'
        }
      },
    problemsEncountered: {
        type: String,
        required: function() {
            return this.formPhase === 'AFTER';
        }
    },
    recommendation: {
        type: String,
        required: function() {
            return this.formPhase === 'AFTER';
        }
    },
    // Common metadata
    submittedAt: {
        type: Date,
        default: Date.now
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
        default: 'submitted'
    }
}, { _id: true });

const formSchema = new mongoose.Schema({
    // --- Form Type Discriminator ---
    formType: { 
        type: String, 
        required: true, 
        enum: ['Activity', 'Budget', 'Project', 'LocalOffCampus'],
        default: 'Activity'
    },

    // ===== EVENT APPROVAL FIELDS =====
    // Event Details
    eventLocation: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    applicationDate: { 
        type: Date, 
        default: Date.now, 
        required: function() { return this.formType === 'Activity'; } 
    },
    studentOrganization: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: function() { return this.formType === 'Activity'; } 
    },

    // Contact Information
    contactPerson: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    contactNo: { 
        type: Number, 
        required: function() { return this.formType === 'Activity'; } 
    },
    emailAddress: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },

    // Event Information
    eventTitle: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    eventType: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    venueAddress: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    eventStartDate: { 
        type: Date, 
        required: function() { return this.formType === 'Activity'; } 
    },
    eventEndDate: { 
        type: Date, 
        required: function() { return this.formType === 'Activity'; } 
    },
    organizer: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    budgetAmount: { 
        type: Number, 
        required: function() { return this.formType === 'Activity'; } 
    },
    budgetFrom: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    coreValuesIntegration: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    objectives: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    marketingCollaterals: { type: String, required: function() { return this.formType === 'Activity'; } },
    pressRelease: { type: String, required: function() { return this.formType === 'Activity'; } },
    others: { type: String, required: function() { return this.formType === 'Activity'; } },

    // Event Facilities
    eventFacilities: { type: String, required: function() { return this.formType === 'Activity'; } },
    holdingArea: { type: String, required: function() { return this.formType === 'Activity'; } },
    toilets: { type: String, required: function() { return this.formType === 'Activity'; } },
    transportationandParking: { type: String, required: function() { return this.formType === 'Activity'; } },
    more: { type: String, required: function() { return this.formType === 'Activity'; } },

    // Licenses and Compliance
    houseKeeping: { type: String, required: function() { return this.formType === 'Activity'; } },
    wasteManagement: { type: String, required: function() { return this.formType === 'Activity'; } },

    // Event Management Team
    eventManagementHead: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },
    eventCommitteesandMembers: { 
        type: String, 
        required: function() { return this.formType === 'Activity'; } 
    },

    // Risk Assessments
    health: { type: String, required: function() { return this.formType === 'Activity'; } },
    safetyAttendees: { type: String, required: function() { return this.formType === 'Activity'; } },
    emergencyFirstAid: { type: String,  required: function() { return this.formType === 'Activity'; } },
    fireSafety: { type: String, required: function() { return this.formType === 'Activity'; } },
    weather: { type: String, required: function() { return this.formType === 'Activity'; } },
    // ===== PRESIDENT SIGNATURE FIELDS =====
    presidentName: {
        type: String,
        required: function() {
          // Required for all forms submitted by organizations
          return this.studentOrganization || this.formType === 'Activity';
        }
      },
      presidentSignature: {
        type: String, // This will store the URL/path to the signature image
        required: function() {
          // Required for all forms submitted by organizations
          return this.studentOrganization || this.formType === 'Activity';
        }
      },

    //Project Proposal
    // ==== PROJECT OVERVIEW ====
    projectTitle: { 
        type: String, 
        required: function() { return this.formType === 'Project'; } 
    },
    projectDescription: { 
        type: String, 
        required: function() { return this.formType === 'Project'; } 
    },
    projectObjectives: { 
        type: String, 
        required: function() { return this.formType === 'Project'; } 
    },
    startDate:{ 
        type: Date, 
        required: function() { return this.formType === 'Project'; } 
    },
    endDate:{ 
        type: Date, 
        required: function() { return this.formType === 'Project'; } 
    },
    venue:{ 
        type: String, 
        required: function() { return this.formType === 'Project'; } 
    },
    targetParticipants:{ 
        type: String, 
        required: function() { return this.formType === 'Project'; } 
    },

     // ==== PROJECT GUIDELINES ====
     projectGuidelines: { 
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },

    // ==== PROGRAM FLOW ====
    programFlow:{ 
        type: [programFlowSchema],
        required: function() { return this.formType === 'Project'; }
    },

    // ==== OFFICERS IN CHARGE ====
    projectHeads:{ 
        type: [projectHeadsSchema],
        required: function() { return this.formType === 'Project'; }
    },

    workingCommittees:{ 
        type: [workingCommitteesSchema],
        required: function() { return this.formType === 'Project'; }
    },

    // === TASK DELEGATION ===
    taskDeligation:{ 
        type: [taskDeligationSchema],
        required: function() { return this.formType === 'Project'; }
    },

    // === TIMELINE/POSTING SCHEDULES ===
    timelineSchedules: { 
        type: [timelineSchedulesSchema],
        required: function() { return this.formType === 'Project'; }
    },

    // === School Facilities & Equipment ===
    schoolEquipments:{ 
        type: [equipmentsNeedSchema],
        required: function() { return this.formType === 'Project'; }
    },
    //Local Off Campus Form
    // Add this new field for LocalOffCampus forms
    localOffCampus: {
        type: localOffCampusSchema,
        required: function() {
            return this.formType === 'LocalOffCampus';
        }
    },

        // ====BUDGET PROPOSAL====

        // Update the attachedBudget field validation:
        attachedBudget: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BudgetProposal',
            validate: {
              validator: async function(v) {
                if (!v) return true; // Optional attachment
                if (!['Activity', 'Project'].includes(this.formType)) return false;
                
                // Get the organization reference - handle both ObjectId and string cases
                let orgId = this.studentOrganization;
                
                // If orgId is a string that's not an ObjectId, look up the organization
                if (typeof orgId === 'string' && !mongoose.Types.ObjectId.isValid(orgId)) {
                  const org = await mongoose.model('User').findOne({
                    organizationName: orgId,
                    role: "Organization"
                  });
                  if (!org) return false;
                  orgId = org._id;
                }
                
                const budget = await mongoose.model('BudgetProposal').findOne({
                  _id: v,
                  organization: orgId,
                  isActive: true
                });
                return !!budget;
              },
              message: 'Budget must belong to your organization'
            }
          },
          
    // ===== COMMON FIELDS =====
    currentStep: { type: Number, default: 0 },
    reviewStages: [reviewStageSchema],
    finalStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'declined'], 
        default: 'pending' 
    }
});

const Form = mongoose.model('Form', formSchema);
module.exports = Form;