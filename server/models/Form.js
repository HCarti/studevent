const mongoose = require('mongoose');

const reviewStageSchema = new mongoose.Schema({
    role: { type: String, enum: ['Adviser', 'Dean', 'AcademicServices', 'AcademicDirector'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    remarks: { type: String },
    timestamp: { type: Date }
});

const formSchema = new mongoose.Schema({
    eventLocation: { type: String,  required: true },
    applicationDate: { type: Date, required: true },
    studentOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactPerson: { type: String, required: true },
    contactNo: { type: Number, required: true },
    emailAddress: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventType: { type: String, required: true },
    venueAddress: { type: String, required: true },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    organizer: { type: String, required: true },
    budgetAmount: { type: Number, required: true },
    budgetFrom: { type: String, required: true },
    coreValuesIntegration: { type: String, required: true },
    objectives: { type: String, required: true },
    marketingCollaterals: { type: String, required: true },
    pressRelease: { type: String, required: true },
    others: { type: String, required: true },
    eventFacilities: { type: String, required: true },
    holdingArea: { type: String, required: true },
    toilets: { type: String, required: true },
    transportationandParking: { type: String, required: true },
    more: { type: String, required: true },
    licensesRequired: { type: String, required: true },
    houseKeeping: { type: String, required: true },
    wasteManagement: { type: String, required: true },
    eventManagementHead: { type: String, required: true },
    eventCommitteesandMembers: { type: String, required: true },
    health: { type: String, required: true },
    safetyAttendees: { type: String, required: true },
    emergencyFirstAid: { type: String, required: true },
    fireSafety: { type: String, required: true },
    weather: { type: String, required: true },
    currentStep: { type: Number, default: 0 }, // Tracks the current stage index
    reviewStages: [reviewStageSchema], // Holds details of each reviewer's status
    finalStatus: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' } // Overall status of the form
});

const Form = mongoose.model('Form', formSchema);
module.exports = Form;
