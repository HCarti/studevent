const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    eventLocation: { type: String, required: true },
    applicationDate: { type: Date, required: true },
    studentOrganization: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactNo: { type: Number, required: true },
    emailAddress: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventType: { type: String, required: true },
    venueAddress: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventTime: { type: Number, required: true },
    organizer: { type: String, required: true },
    budgetAmount: { type: Number, required: true },
    budgetFrom: { type: String, required: true },
    coreValuesIntegration: { type: String, required: true },
    objectives: { type: String, required: true },
    others: { type: String, required: true },
    eventManagementHead: { type: String, required: true },
    health: { type: String, required: true },
    safetyAttendees: { type: String, required: true },
    emergencyFirstAid: { type: String, required: true },
    fireSafety: { type: String, required: true },
    weather: { type: String, required: true },
});

const Form = mongoose.model('Form', formSchema);
module.exports = Form;
