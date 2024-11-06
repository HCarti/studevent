import React, {useState} from "react";
import axios from 'axios';
import './Liquidation.css';
import moment from 'moment';
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from "@react-pdf/renderer";
import NU_logo from "../Images/NU_logo.png";
import { useNavigate } from 'react-router-dom';

const AapPDF = ({ formData }) => (
  <Document>
    <Page style={styles.body}>
      {/* Logo and Header */}
      <View style={styles.header}>
        <Image src={NU_logo} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.title}>NU MOA</Text>
          <Text>Student Development and Activities Office</Text>
        </View>
      </View>

      <Text style={styles.formTitle}>STUDENT ORGANIZATION ACTIVITY APPLICATION FORM</Text>
      <Text></Text>

      {/* Event Location and Date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EVENT LOCATION</Text>
        <View style={styles.formRow}>
          <Text>Location: {formData.eventLocation}</Text>
          <Text>Date of Application: {formData.applicationDate}</Text>
        </View>
        <View style={styles.formRow}>
          <Text>On Campus: {formData.isOnCampus === "on-campus" ? "Yes" : "No"}</Text>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. CONTACT INFORMATION</Text>
        <View style={styles.formRow}>
          <Text>Student Organization: {formData.studentOrganization}</Text>
          <Text>Contact Person: {formData.contactPerson}</Text>
        </View>
        <View style={styles.formRow}>
          <Text>Contact No: {formData.contactNo}</Text>
          <Text>Email Address: {formData.emailAddress}</Text>
        </View>
      </View>

      {/* Event Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. EVENT DETAILS</Text>
        <View style={styles.formRow}>
          <Text>Event Title: {formData.eventTitle}</Text>
          <Text>Event Type: {formData.eventType}</Text>
        </View>
        <View style={styles.formRow}>
          <Text>Venue Address: {formData.venueAddress}</Text>
          <Text>Event Start Date: {formData.eventStartDate}</Text>
          <Text>Event End Date: {formData.eventEndDate}</Text>
        </View>
        <View style={styles.formRow}>
          <Text>Event Time: {formData.eventTime}</Text>
        </View>
        <View style={styles.formRow}>
          <Text>Organizer: {formData.organizer}</Text>
          <Text>Budget Amount: {formData.budgetAmount}</Text>
        </View>
      </View>

      {/* Core Values Integration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CORE VALUES INTEGRATION</Text>
        <Text>{formData.coreValuesIntegration}</Text>
      </View>

      {/* Objectives */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OBJECTIVES</Text>
        <Text>{formData.objectives}</Text>
      </View>

      {/* Communications and Promotions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COMMUNICATIONS AND PROMOTIONS REQUIRED</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text>Marketing Collaterals</Text>
            <Text>{formData.marketing ? "Yes" : "No"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Press Release</Text>
            <Text>{formData.pressRelease ? "Yes" : "No"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Others</Text>
            <Text>{formData.others ? formData.others : "N/A"}</Text>
          </View>
        </View>
      </View>

      {/* Facilities Considerations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FACILITIES CONSIDERATIONS</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text>Event Facilities</Text>
            <Text>{formData.eventFacilities ? "Yes" : "No"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Holding Area</Text>
            <Text>{formData.holdingArea ? "Yes" : "No"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Toilets</Text>
            <Text>{formData.toilets ? "Yes" : "No"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Transportation & Parking</Text>
            <Text>{formData.transportation ? "Yes" : "No"}</Text>
          </View>
        </View>
      </View>

      {/* Event Management Team */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. EVENT MANAGEMENT TEAM</Text>
        <Text>Event Management Head: {formData.eventManagementHead}</Text>
        <Text>Event Committees and Members: {formData.eventCommitteesandMembers}</Text>
      </View>
      

      {/* Risk Assessments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. RISK ASSESSMENTS</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text>Health</Text>
            <Text>{formData.health ? formData.health : "N/A"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Safety of Attendees</Text>
            <Text>{formData.safetyAttendees ? formData.safetyAttendees : "N/A"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Emergency/First Aid</Text>
            <Text>{formData.emergencyFirstAid ? formData.emergencyFirstAid : "N/A"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Fire Safety</Text>
            <Text>{formData.fireSafety ? formData.fireSafety : "N/A"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Weather</Text>
            <Text>{formData.weather ? formData.weather : "N/A"}</Text>
          </View>
        </View>
      </View>

      {/* Signatures/Endorsements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. SIGNATURES / ENDORSEMENTS</Text>
        <View style={styles.signatureRow}>
          <Text>Applicant Organization: {formData.applicantSignature}</Text>
          <Text>Faculty Adviser/College Dean: {formData.facultySignature}</Text>
        </View>
        <View style={styles.signatureRow}>
          <Text>Date: {formData.applicantDate}</Text>
          <Text>Date: {formData.facultyDate}</Text>
        </View>
      </View>

      {/* Approvals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. APPROVALS</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text>Student Development Office: {formData.studentDevApproval}</Text>
            <Text>Approved / Disapproved: {formData.studentDevApproved}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Academic Services Director: {formData.academicServicesApproval}</Text>
            <Text>Approved / Disapproved: {formData.academicServicesApproved}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Academic Director: {formData.academicDirectorApproval}</Text>
            <Text>Approved / Disapproved: {formData.academicDirectorApproved}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Executive Director: {formData.executiveDirectorApproval}</Text>
            <Text>Approved / Disapproved: {formData.executiveDirectorApproved}</Text>
          </View>
        </View>
      </View>

    </Page>
  </Document>
);

const Liquidation = () => {
  const [formData, setFormData] = useState({
    eventLocation: "",
    applicationDate: "",
    studentOrganization: "",
    contactPerson: "",
    contactNo: "",
    emailAddress: "",
    eventTitle: "",
    eventType: "",
    venueAddress: "",
    eventStartDate: "",
    eventEndDate: "",
    organizer: "",
    budgetAmount: "",
    budgetFrom: "",
    coreValuesIntegration: "",
    objectives: "",
    marketing: false,
    collaterals: false,
    pressRelease: false,
    others: "",
    eventFacilities: false,
    holdingArea: false,
    toilets: false,
    transportation: false,
    more: "",
    licensesRequired: "",
    houseKeeping: "",
    wasteManagement: "",
    eventManagementHead: "",
    eventCommitteesandMembers: "",
    health: "",
    safetyAttendees: "",
    emergencyFirstAid: "",
    fireSafety: "",
    weather: ""
  });

  const [formSent, setFormSent] = useState(false); 
  const [eventId, setEventId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = [
      'eventLocation', 'applicationDate', 'studentOrganization', 
      'contactPerson', 'contactNo', 'emailAddress', 'eventTitle', 
      'eventType', 'venueAddress', 'eventStartDate', 'eventEndDate', 
      'organizer', 'budgetAmount', 'budgetFrom', 
      'coreValuesIntegration', 'objectives', 'marketingCollaterals', 
      'pressRelease', 'others', 'eventFacilities', 
      'holdingArea', 'toilets', 'transportationandParking', 'more', 
      'licensesRequired', 'houseKeeping', 'wasteManagement',
      'eventManagementHead', 'eventCommitteesandMembers', 'health', 
      'safetyAttendees', 'emergencyFirstAid', 'fireSafety', 'weather'
  ];

    for (const field of requiredFields) {
        if (!formData[field]) {
            alert(`${field} is required.`);
            return; // Stop submission if any field is empty
        }
    }

    // Ensure valid dates and calculate event length
    const eventStart = moment(formData.eventStartDate);
    const eventEnd = moment(formData.eventEndDate);
    if (!eventStart.isValid() || !eventEnd.isValid()) {
        alert("Invalid event start or end date.");
        return;
    }

    if (eventEnd.isBefore(eventStart)) {
        alert("End date must be after the start date.");
        return;
    }

    // Include all formData fields in the request payload
    const eventData = {
        ...formData,
        length: eventEnd.diff(eventStart, 'hours') // Add calculated event length
    };

    try {
        // Send form data to the correct API endpoint
        const response = await fetch('https://studevent-server.vercel.app/api/forms', { // Updated endpoint to match the forms backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error submitting form:', errorData);
            alert(`Error: ${errorData.error || 'Submission failed'}`);
            return;
        }

        const result = await response.json();
        console.log('Form submitted successfully:', result);
        
        // Get the form Object ID
        const formId = result._id; // Assuming the response contains an ID
        setEventId(formId); // Set the form ID
        console.log('Form Object ID:', formId);
        alert('Form submitted successfully!');
        setFormSent(true); // Update form submission state

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the form.');
    }
};


  
  
  return (
    <div className="form-ubox-5">
      <div className="inner-forms-5">
        <h1>Liquidationa</h1>

          {/* Event Location and Date */}
            <div className="top-event">
          <div>
            <label>Event Location:</label>
              <select
               name="eventLocation"
               value={formData.eventLocation}
               onChange={handleChange}>
              <option value="selectoption">Select An Option...</option>
              <option value="On Campus">On Campus</option>
              <option value="Off Campus">Off Campus</option>
              
                </select>
              </div>
          <div>
            <label>Date of Application:</label>
            <input
              type="date"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleChange}
              />
          </div>
            </div>

          {/* Contact Information */}
        <div className="form-group-activity">Contact Information</div>
          <div>
            <label>Student Organization:</label>
            <input
              type="text"
              name="studentOrganization"
              value={formData.studentOrganization}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Contact Person:</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Contact No:</label>
            <input
              type="text"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email Address:</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
            />
          </div>

          {/* Event Details */}
          <div className="form-group-activity">Event Details</div>
          <div>
            <label>Event Title:</label>
            <input
              type="text"
              name="eventTitle"
              value={formData.eventTitle}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Event Type:</label>
              <select
               name="eventType"
               value={formData.eventType}
               onChange={handleChange}>
              <option value="Selectoption">Select An Option...</option>
              <option value="Student Organization Activity">Student Organization Activity</option>
              <option value="Special Event">Special Event</option>
              <option value="University/School Activity">University/School Activity</option>
              <option value="Other">Other</option>
                </select>
              </div>

          <div>
            <label>Venue Address:</label>
            <input
              type="text"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleChange}
            />
          </div>
          <div className="event-dates">
              <div>
                <label>Event Start Date:</label>
                <input
                  type="datetime-local"  // Changed to datetime-local to capture both date and time
                  name="eventStartDate"
                  value={formData.eventStartDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Event End Date:</label>
                <input
                  type="datetime-local"  // Changed to datetime-local for end date as well
                  name="eventEndDate"
                  value={formData.eventEndDate}
                  onChange={handleChange}
                />
              </div>
            </div>


          <div>
            <label>Organizer:</label>
            <input
              type="text"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Budget Amount:</label>
            <input
              type="text"
              name="budgetAmount"
              value={formData.budgetAmount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Budget From:</label>
              <select
               name="budgetFrom"
               value={formData.budgetFrom}
               onChange={handleChange}>
              <option value="Selectoption">Select An Option...</option>
              <option value="College/Department">College/Department</option>
              <option value="Org">Org</option>
              <option value="SDAO">SDAO</option>
                </select>
              </div>

          {/* Core Values Integration */}
          <div>
            <label>Core Values Integration:</label>
            <textarea
            style={{resize:'none',
              overflow:'hidden'
            }}
              name="coreValuesIntegration"
              value={formData.coreValuesIntegration}
              onChange={handleChange}
            />
          </div>

          {/* Objectives */}
          <div>
            <label>Objectives:</label>
            <textarea
              style={{resize:'none'
                ,overflow:'hidden'
              }} 
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
            />
          </div>

          {/* Communications and Promotions */}
          <div>
            <label>Marketing Collaterals:</label>
            <input
              type="text"
              name="marketingCollaterals"
              checked={formData.marketingCollaterals}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Press Release:</label>
            <input
              type="text"
              name="pressRelease"
              checked={formData.pressRelease}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Others:</label>
            <input
              type="text"
              name="others"
              value={formData.others}
              onChange={handleChange}
            />
          </div>

          {/* Facilities Considerations */}
          <div>
            <label>Event Facilities:</label>
            <input
              type="text"
              name="eventFacilities"
              checked={formData.eventFacilities}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Holding Area:</label>
            <input
              type="text"
              name="holdingArea"
              checked={formData.holdingArea}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Toilets:</label>
            <input
              type="text"
              name="toilets"
              checked={formData.toilets}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Transportation & Parking:</label>
            <input
              type="text"
              name="transportationandParking"
              checked={formData.transportationandParking}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Others:</label>
            <input
              type="text"
              name="more" 
              value={formData.more}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Licenses Required:</label>
            <input
              type="text"
              name="licensesRequired"
              checked={formData.licensesRequired}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>HouseKeeping:</label>
            <input
              type="text"
              name="houseKeeping"
              checked={formData.houseKeeping}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Waste Management:</label>
            <input
              type="text"
              name="wasteManagement"
              checked={formData.wasteManagement}
              onChange={handleChange}
            />
          </div>

          {/* Event Management Team */}
          <div className="form-group-activity">Event Management Team</div>
          <div>
            <label>Event Management Head:</label>
            <input
              type="text"
              name="eventManagementHead"
              value={formData.eventManagementHead}
              onChange={handleChange}
            />
          </div>

          <div>
  <label>Event Committees & Members:</label>
  <input
    type="text"
    name="eventCommitteesandMembers"  // Use uppercase 'M' to match the PDF
    value={formData.eventCommitteesandMembers}
    onChange={handleChange}
  />
</div>

          {/* Risk Assessments */}
          <div>
            <label>Health:</label>
            <textarea
              style={{resize:'none',
                overflow:'hidden'
              }}
              name="health"
              value={formData.health}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Safety of Attendees:</label>
            <textarea
              style={{resize:'none',
                overflow:'hidden'
              }}
              name="safetyAttendees"
              value={formData.safetyAttendees}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Emergency/First Aid:</label>
            <textarea
              style={{resize:'none',
                overflow:'hidden'
              }}
              name="emergencyFirstAid"
              value={formData.emergencyFirstAid}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Fire Safety:</label>
            <textarea
              style={{resize:'none'
                ,overflow:'hidden'
              }}
              name="fireSafety"
              value={formData.fireSafety}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Weather:</label>
            <textarea
              style={{resize:'none'
                ,overflow:'hidden'
              }}
              name="weather"
              value={formData.weather}
              onChange={handleChange}
            />
          </div>


          {/* Send to SDAO button */}
          <div className="pdf-container">
            <button
            onClick={handleSubmit}
            style={{
              padding: '10px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Send to SDAO
          </button>
        </div>
        {/* Show a notification when the form is sent */}
        {formSent && <p>Form successfully sent to the SDAO!</p>}  {/* <-- Add this */}
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  body: {
    padding: 20,
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
  },
  logo: {
    width: 60, 
    height: 60,
  },
  headerText: {
    marginLeft: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formTitle: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  sectionTitle: {
    fontWeight: "bold",
    backgroundColor: "#D9E8FC",
    padding: 5,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
});

export default Liquidation; 
