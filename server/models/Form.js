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

const formSchema = new mongoose.Schema({
    // --- Form Type Discriminator ---
    formType: { 
        type: String, 
        required: true, 
        enum: ['Activity', 'Budget'],
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
    items: [budgetItemSchema], // Array of budget items
    grandTotal: { 
        type: Number, 
        required: function() { return this.formType === 'Budget'; },
        min: 0
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