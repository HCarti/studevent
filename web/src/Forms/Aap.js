import React, {useState, useEffect} from "react";
import axios from 'axios';
import './Aap.css';
import moment from 'moment';
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from "@react-pdf/renderer";
import NU_logo from "../Images/NU_logo.png";
import { useNavigate } from 'react-router-dom';
import { MdOutlineContactPage } from "react-icons/md";

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

const Aap = () => {
  const [formData, setFormData] = useState({
    eventLocation: "",
    applicationDate: "",
    studentOrganization: "", // Ensure this is an ObjectId or can be handled as one
    contactPerson: "",
    contactNo: "", // Contact number as string to prevent issues with leading zeros
    emailAddress: "",
    eventTitle: "",
    eventType: "",
    venueAddress: "",
    eventStartDate: "",
    eventEndDate: "",
    organizer: "",
    budgetAmount: "", // Use a number input, but store as string and convert when submitting
    budgetFrom: "",
    coreValuesIntegration: "",
    objectives: "",
    marketingCollaterals: "",
    pressRelease: "",
    others: "",
    eventFacilities: "",
    holdingArea: "",
    toilets: "",
    transportationandParking: "",
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

  const [currentStep, setCurrentStep] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [eventId, setEventId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleNext = () => {
    if (isSectionComplete()) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Please complete all required fields in this section before proceeding.");
    }
  };

  const isSectionComplete = () => {
    const requiredFields = getFieldsForStep(currentStep);
    for (const field of requiredFields) {
      if (!formData[field]) return false;
    }
    return true;
  };

  const getFieldsForStep = (step) => {
    const sections = [
      ['eventLocation', 'applicationDate'],
      ['studentOrganization', 'contactPerson', 'contactNo', 'emailAddress'],
      [
        'eventTitle', 'eventType', 'venueAddress', 'eventStartDate', 'eventEndDate', 'organizer',
        'budgetAmount', 'budgetFrom', 'coreValuesIntegration', 'objectives', 'marketingCollaterals',
        'pressRelease', 'others', 'eventFacilities', 'holdingArea', 'toilets', 'transportationandParking',
        'more', 'licensesRequired', 'houseKeeping', 'wasteManagement'
      ],
      ['eventManagementHead', 'eventCommitteesandMembers'],
      ['health', 'safetyAttendees', 'emergencyFirstAid', 'fireSafety', 'weather']
    ];
    return sections[step] || [];
  };

   // Fetch the logged-in user's organization name on component mount
    // Pre-fill `studentOrganization` with `organizationName` if logged in user is an organization
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.role === 'Organization') {
      setFormData(prevData => ({
        ...prevData,
        studentOrganization: userData.organizationName || ""
      }));
    }
  }, []);

  const handleSubmit = async () => {
    const requiredFields = [
      'eventLocation', 'applicationDate', 'studentOrganization', 'contactPerson', 'contactNo', 'emailAddress', 
      'eventTitle', 'eventType', 'venueAddress', 'eventStartDate', 'eventEndDate', 'organizer', 'budgetAmount', 
      'budgetFrom', 'coreValuesIntegration', 'objectives', 'marketingCollaterals', 'pressRelease', 'others', 'eventFacilities', 
      'holdingArea', 'toilets', 'transportationandParking', 'more', 'licensesRequired', 'houseKeeping', 'wasteManagement', 
      'eventManagementHead', 'eventCommitteesandMembers', 'health', 'safetyAttendees', 'emergencyFirstAid', 
      'fireSafety', 'weather'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`${field} is required.`);
        return;
      }
    }

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

    // Convert fields to expected data types for the backend schema
    const eventData = {
      ...formData,
      contactNo: Number(formData.contactNo),
      budgetAmount: Number(formData.budgetAmount),
      eventStartDate: new Date(formData.eventStartDate),
      eventEndDate: new Date(formData.eventEndDate),
      applicationDate: new Date(formData.applicationDate),
      length: eventEnd.diff(eventStart, 'hours')
    };

    try {
      const response = await fetch('https://studevent-server.vercel.app/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // Uncomment if needed
        },
        body: JSON.stringify(eventData),
      });
    
      if (!response.ok) {
        // Check if the response is JSON before trying to parse it
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || 'Submission failed'}`);
        } else {
          const text = await response.text();
          alert(`Error: ${text}`);
        }
        return;
      }
    
      const result = await response.json();
      console.log('Form submitted successfully:', result);
    
      if (result._id) {
        setEventId(result._id);
      }
      alert('Form submitted successfully!');
      setFormSent(true);
    
      // Reset form data
      setFormData({
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
        marketingCollaterals: "",
        pressRelease: "",
        others: "",
        eventFacilities: "",
        holdingArea: "",
        toilets: "",
        transportationandParking: "",
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
    
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    }
  };    

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <label>Event Location:</label>
            <select name="eventLocation" value={formData.eventLocation} onChange={handleChange}>
              <option value="">Select An Option...</option>
              <option value="On Campus">On Campus</option>
              <option value="Off Campus">Off Campus</option>
            </select>

            <label>Date of Application:</label>
            <input type="date" name="applicationDate" value={formData.applicationDate} onChange={handleChange} />
          </div>
        );

      case 1:
        return (
          <div>
            <label>Student Organization:</label>
            <input
              type="text"
              name="studentOrganization"
              value={formData.studentOrganization}
              onChange={handleChange}
              readOnly
            />
            <label>Contact Person:</label>
            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
            <label>Contact No:</label>
            <input type="text" name="contactNo" value={formData.contactNo} onChange={handleChange} />
            <label>Email Address:</label>
            <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} />
          </div>
        );

      case 2:
        return (
          <div>
            <label>Event Title:</label>
            <input type="text" name="eventTitle" value={formData.eventTitle} onChange={handleChange} />
            <label>Event Type:</label>
            <select name="eventType" value={formData.eventType} onChange={handleChange}>
              <option value="">Select An Option...</option>
              <option value="Student Organization Activity">Student Organization Activity</option>
              <option value="Special Event">Special Event</option>
              <option value="University/School Activity">University/School Activity</option>
              <option value="Other">Other</option>
            </select>

            <label>Venue Address:</label>
            <input type="text" name="venueAddress" value={formData.venueAddress} onChange={handleChange} />
            <label>Event Start Date:</label>
            <input type="datetime-local" name="eventStartDate" value={formData.eventStartDate} onChange={handleChange} />
            <label>Event End Date:</label>
            <input type="datetime-local" name="eventEndDate" value={formData.eventEndDate} onChange={handleChange} />
            <label>Organizer:</label>
            <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} />
            <label>Budget Amount:</label>
            <input type="text" name="budgetAmount" value={formData.budgetAmount} onChange={handleChange} />
            <label>Budget From:</label>
            <select name="budgetFrom" value={formData.budgetFrom} onChange={handleChange}>
              <option value="">Select An Option...</option>
              <option value="College/Department">College/Department</option>
              <option value="Org">Organization</option>
              <option value="SDAO">SDAO</option>
            </select>

            <label>Core Values Integration:</label>
            <textarea name="coreValuesIntegration" value={formData.coreValuesIntegration} onChange={handleChange} />
            <label>Objectives:</label>
            <textarea name="objectives" value={formData.objectives} onChange={handleChange} />

            <h3 className="communications">COMMUNICATIONS AND PROMOTIONS REQUIRED</h3>
            <label>Marketing Collaterals:</label>
            <input type="text" name="marketingCollaterals" value={formData.marketingCollaterals} onChange={handleChange} />
            <label>Press Release:</label>
            <input type="text" name="pressRelease" value={formData.pressRelease} onChange={handleChange} />
            <label>Others:</label>
            <input type="text" name="others" value={formData.others} onChange={handleChange} />

            <h3>Facilities Considerations</h3>
            <label>Event Facilities:</label>
            <input type="text" name="eventFacilities" value={formData.eventFacilities} onChange={handleChange} />
            <label>Holding Area:</label>
            <input type="text" name="holdingArea" value={formData.holdingArea} onChange={handleChange} />
            <label>Toilets:</label>
            <input type="text" name="toilets" value={formData.toilets} onChange={handleChange} />
            <label>Transportation & Parking:</label>
            <input type="text" name="transportationandParking" value={formData.transportationandParking} onChange={handleChange} />
            <label>Other Facilities:</label>
            <input type="text" name="more" value={formData.more} onChange={handleChange} />
            <label>Licenses Required:</label>
            <input type="text" name="licensesRequired" value={formData.licensesRequired} onChange={handleChange} />
            <label>Housekeeping:</label>
            <input type="text" name="houseKeeping" value={formData.houseKeeping} onChange={handleChange} />
            <label>Waste Management:</label>
            <input type="text" name="wasteManagement" value={formData.wasteManagement} onChange={handleChange} />
          </div>
        );

      case 3:
        return (
          <div>
            <label>Event Management Head:</label>
            <input type="text" name="eventManagementHead" value={formData.eventManagementHead} onChange={handleChange} />
            <label>Event Committees & Members:</label>
            <input type="text" name="eventCommitteesandMembers" value={formData.eventCommitteesandMembers} onChange={handleChange} />
          </div>
        );

      case 4:
        return (
          <div>
            <label>Health:</label>
            <textarea name="health" value={formData.health} onChange={handleChange} />
            <label>Safety of Attendees:</label>
            <textarea name="safetyAttendees" value={formData.safetyAttendees} onChange={handleChange} />
            <label>Emergency/First Aid:</label>
            <textarea name="emergencyFirstAid" value={formData.emergencyFirstAid} onChange={handleChange} />
            <label>Fire Safety:</label>
            <textarea name="fireSafety" value={formData.fireSafety} onChange={handleChange} />
            <label>Weather:</label>
            <textarea name="weather" value={formData.weather} onChange={handleChange} />
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="form-ubox-1">
      <div className="sidebar">
        <ul>
          <li className={currentStep === 0 ? 'active' : ''}>Event Specifics </li>
          <li className={currentStep === 1 ? 'active' : ''}>Contact Information</li>
          <li className={currentStep === 2 ? 'active' : ''}>Event Details</li>
          <li className={currentStep === 3 ? 'active' : ''}>Event Management Team</li>
          <li className={currentStep === 4 ? 'active' : ''}>Risk Assessments</li>
        </ul>
      </div>
      <div className="inner-forms-1">
        <h1>Activity Application Form</h1>
        <p>This Event Proposal/Plan should be submitted at least 1 to 3 months before the event to allow time for preparation and purchasing process.</p>
        {renderStepContent()}
        <div className="form-navigation">
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
          )}
          {currentStep < 4 ? (
            <button onClick={handleNext}>Next</button>
          ) : (
            <button onClick={handleSubmit}>Submit</button>
          )}
        </div>
        {formSent && <p>Form successfully sent!</p>}
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

export default Aap; 
