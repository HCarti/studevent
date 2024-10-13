import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from "@react-pdf/renderer";
import NU_logo from "../Images/NU_logo.png";

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
          <Text>Event Date: {formData.eventDate}</Text>
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
            <Text>Marketing</Text>
            <Text>{formData.marketing ? "Yes" : "No"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text>Collaterals</Text>
            <Text>{formData.collaterals ? "Yes" : "No"}</Text>
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
  const [formData, setFormData] = React.useState({
    eventLocation: "",
    applicationDate: "",
    studentOrganization: "",
    contactPerson: "",
    contactNo: "",
    emailAddress: "",
    eventTitle: "",
    eventType: "",
    venueAddress: "",
    eventDate: "",
    eventTime: "",
    organizer: "",
    budgetAmount: "",
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
    eventManagementHead: "",
    health: "",
    safetyAttendees: "",
    emergencyFirstAid: "",
    fireSafety: "",
    weather: "",
    applicantSignature: "",
    facultySignature: "",
    applicantDate: "",
    facultyDate: "",
    studentDevApproval: "",
    studentDevApproved: "",
    academicServicesApproval: "",
    academicServicesApproved: "",
    academicDirectorApproval: "",
    academicDirectorApproved: "",
    executiveDirectorApproval: "",
    executiveDirectorApproved: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  return (
    <div className="form-ubox">
      <div className="inner-forms">
        <h1>Activity Application Form</h1>

          {/* Event Location and Date */}
          <div className="event-location">
            <label>Event Location:</label>
              <select
               name="eventLocation"
               value={formData.eventLocation}
               onChange={handleChange}>
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

          {/* Contact Information */}
        <div className="form-group">Contact Information</div>
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
          <div className="form-group">Event Details</div>
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

          <div>
            <label>Event Date:</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Event Time:</label>
            <input
              type="text"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
            />
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

          {/* Core Values Integration */}
          <div className="form-group">Contact Information</div>
          <div>
            <label>Core Values Integration:</label>
            <textarea
              name="coreValuesIntegration"
              value={formData.coreValuesIntegration}
              onChange={handleChange}
            />
          </div>

          {/* Objectives */}
          <div>
            <label>Objectives:</label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
            />
          </div>

          {/* Communications and Promotions */}
          <div>
            <label>Marketing:</label>
            <input
              type="checkbox"
              name="marketing"
              checked={formData.marketing}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Collaterals:</label>
            <input
              type="checkbox"
              name="collaterals"
              checked={formData.collaterals}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Press Release:</label>
            <input
              type="checkbox"
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
              type="checkbox"
              name="eventFacilities"
              checked={formData.eventFacilities}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Holding Area:</label>
            <input
              type="checkbox"
              name="holdingArea"
              checked={formData.holdingArea}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Toilets:</label>
            <input
              type="checkbox"
              name="toilets"
              checked={formData.toilets}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Transportation & Parking:</label>
            <input
              type="checkbox"
              name="transportation"
              checked={formData.transportation}
              onChange={handleChange}
            />
          </div>

          {/* Event Management Team */}
          <div className="form-group">Event Management Team</div>
          <div>
            <label>Event Management Head:</label>
            <input
              type="text"
              name="eventManagementHead"
              value={formData.eventManagementHead}
              onChange={handleChange}
            />
          </div>

          {/* Risk Assessments */}
          <div>
            <label>Health:</label>
            <textarea
              name="health"
              value={formData.health}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Safety of Attendees:</label>
            <textarea
              name="safetyAttendees"
              value={formData.safetyAttendees}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Emergency/First Aid:</label>
            <textarea
              name="emergencyFirstAid"
              value={formData.emergencyFirstAid}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Fire Safety:</label>
            <textarea
              name="fireSafety"
              value={formData.fireSafety}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Weather:</label>
            <textarea
              name="weather"
              value={formData.weather}
              onChange={handleChange}
            />
          </div>

          {/* Signatures
          <div>
            <label>Applicant Organization:</label>
            <input
              type="text"
              name="applicantSignature"
              value={formData.applicantSignature}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Faculty Signature:</label>
            <input
              type="text"
              name="facultySignature"
              value={formData.facultySignature}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Date:</label>
            <input
              type="date"
              name="applicantDate"
              value={formData.applicantDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Faculty Date:</label>
            <input
              type="date"
              name="facultyDate"
              value={formData.facultyDate}
              onChange={handleChange}
            />
          </div>

          Approvals
          <div>
            <label>Student Development Office Approval:</label>
            <input
              type="text"
              name="studentDevApproval"
              value={formData.studentDevApproval}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Approved:</label>
            <input
              type="text"
              name="studentDevApproved"
              value={formData.studentDevApproved}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Academic Services Office Approval:</label>
            <input
              type="text"
              name="academicServicesApproval"
              value={formData.academicServicesApproval}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Approved:</label>
            <input
              type="text"
              name="academicServicesApproved"
              value={formData.academicServicesApproved}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Academic Director Approval:</label>
            <input
              type="text"
              name="academicDirectorApproval"
              value={formData.academicDirectorApproval}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Approved:</label>
            <input
              type="text"
              name="academicDirectorApproved"
              value={formData.academicDirectorApproved}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Executive Director Approval:</label>
            <input
              type="text"
              name="executiveDirectorApproval"
              value={formData.executiveDirectorApproval}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Approved:</label>
            <input
              type="text"
              name="executiveDirectorApproved"
              value={formData.executiveDirectorApproved}
              onChange={handleChange}
            />
          </div> */}

          {/* PDF Generation */}
          <div className="pdf-container">
            <PDFDownloadLink
              document={<AapPDF formData={formData} />}
              fileName="application-form.pdf"
              className="download-link"
            >
              {({ blob, url, loading, error }) =>
                loading ? "Loading document..." : "Download PDF"
              }
            </PDFDownloadLink>
          </div>
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
    textDecoration: "underline",
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
