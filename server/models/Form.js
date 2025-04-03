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

// Schema for individual budget items
const budgetItemSchema = new mongoose.Schema({
    quantity: { 
        type: Number, 
        required: function() { return this.parent().formType === 'Budget'; },
        min: 0
    },
    unit: { 
        type: String, 
        required: function() { return this.parent().formType === 'Budget'; }
    },
    description: { 
        type: String, 
        required: function() { return this.parent().formType === 'Budget'; }
    },
    unitCost: { 
        type: Number, 
        required: function() { return this.parent().formType === 'Budget'; },
        min: 0
    },
    totalCost: { 
        type: Number, 
        required: function() { return this.parent().formType === 'Budget'; },
        min: 0
    }
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

const projectBudgetSchema = new mongoose.Schema({
    budgetItems:{
        type: String, 
        required: function() { return this.formType === 'Project'; }
    },
    budgetEstimatedQuantity:{
        type: Number, 
        required: function() { return this.formType === 'Project'; }
    },
    budgetPerUnit:{
        type: Number, 
        required: function() { return this.formType === 'Project'; }
    },
    budgetEstimatedAmount:{
        type: Number, 
        required: function() { return this.formType === 'Project'; }
    },
});

const formSchema = new mongoose.Schema({
    // --- Form Type Discriminator ---
    formType: { 
        type: String, 
        required: true, 
        enum: ['Activity', 'Budget', 'Project'],
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
    licensesRequired: { type: String, required: function() { return this.formType === 'Activity'; } },
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

     // ===== BUDGET FIELDS =====
    nameOfRso: { 
        type: String, 
        required: function() { return this.formType === 'Budget'; } 
    },
    eventTitle: { 
        type: String, 
        required: function() { return this.formType === 'Budget'; } 
    },
    items: { 
        type: [budgetItemSchema],
        required: function() { return this.formType === 'Budget'; }
    },
    grandTotal: { 
        type: Number, 
        required: function() { return this.formType === 'Budget'; },
        min: 0
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

    // === Budget Proposal ===
    budgetProposal: { 
        type: [projectBudgetSchema],
        required: function() { return this.formType === 'Project'; }
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