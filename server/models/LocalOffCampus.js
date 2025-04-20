const mongoose = require('mongoose');

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

// Review Stage Schema (same as in formSchema)
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
          return this.formPhase === 'AFTER';
        },
        validate: {
          validator: function(v) {
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
    },
    // Review related fields
    currentStep: { 
        type: Number, 
        default: 0 
    },
    reviewStages: [reviewStageSchema],
    finalStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'declined'], 
        default: 'pending' 
    }
}, { _id: true });

const LocalOffCampus = mongoose.model('LocalOffCampus', localOffCampusSchema);
module.exports = LocalOffCampus;