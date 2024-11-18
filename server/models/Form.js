const mongoose = require('mongoose');

const reviewStageSchema = new mongoose.Schema({
    role: { type: String, enum: ['Adviser', 'Dean', 'AcademicServices', 'AcademicDirector'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    remarks: { type: String },
    timestamp: { type: Date }
});

const formSchema = new mongoose.Schema({
     // Event Details
  eventLocation: { type: String, required: true },
  applicationDate: { type: Date, default: Date.now, required: true },
  studentOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'studentOrganization', required: true }, // Assuming a reference to a collection

  // Contact Information
  contactPerson: { type: String, required: true },
  contactNo: { type: Number, required: true }, // Number type for consistency in validation
  emailAddress: { type: String, required: true },

  // Event Information
  eventTitle: { type: String, required: true },
  eventType: { type: String, required: true },
  venueAddress: { type: String, required: true },
  eventStartDate: { type: Date, required: true },
  eventEndDate: { type: Date, required: true },
  organizer: { type: String, required: true },
  budgetAmount: { type: Number, required: true }, // Numeric value for easier calculations
  budgetFrom: { type: String, required: true },
  coreValuesIntegration: { type: String, required: true },
  objectives: { type: String, required: true },
  marketingCollaterals: { type: String },
  pressRelease: { type: String },
  others: { type: String },

  // Event Facilities
  eventFacilities: { type: String },
  holdingArea: { type: String },
  toilets: { type: String },
  transportationandParking: { type: String },
  more: { type: String },

  // Licenses and Compliance
  licensesRequired: { type: String },
  houseKeeping: { type: String },
  wasteManagement: { type: String },

  // Event Management Team
  eventManagementHead: { type: String, required: true },
  eventCommitteesandMembers: { type: String, required: true },

  // Risk Assessments
  health: { type: String },
  safetyAttendees: { type: String },
  emergencyFirstAid: { type: String },
  fireSafety: { type: String },
  weather: { type: String },

    currentStep: { type: Number, default: 0 }, // Tracks the current stage index
    reviewStages: [reviewStageSchema], // Holds details of each reviewer's status
    finalStatus: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' } // Overall status of the form
});

const Form = mongoose.model('Form', formSchema);
module.exports = Form;
