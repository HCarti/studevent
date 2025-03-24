import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import NU_logo from "../Images/NU_logo.png";

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

const ActivityPdf = ({ formData = {} }) => {
  // Fallback for missing or undefined fields
  const {
    eventLocation = "N/A",
    applicationDate = "N/A",
    isOnCampus = "N/A",
    studentOrganization = "N/A",
    contactPerson = "N/A",
    contactNo = "N/A",
    emailAddress = "N/A",
    eventTitle = "N/A",
    eventType = "N/A",
    venueAddress = "N/A",
    eventStartDate = "N/A",
    eventEndDate = "N/A",
    eventTime = "N/A",
    organizer = "N/A",
    budgetAmount = "N/A",
    coreValuesIntegration = "N/A",
    objectives = "N/A",
    marketing = false,
    pressRelease = false,
    others = "N/A",
    eventFacilities = false,
    holdingArea = false,
    toilets = false,
    transportation = false,
    eventManagementHead = "N/A",
    eventCommitteesandMembers = "N/A",
    health = "N/A",
    safetyAttendees = "N/A",
    emergencyFirstAid = "N/A",
    fireSafety = "N/A",
    weather = "N/A",
    applicantSignature = "N/A",
    facultySignature = "N/A",
    applicantDate = "N/A",
    facultyDate = "N/A",
    studentDevApproval = "N/A",
    studentDevApproved = "N/A",
    academicServicesApproval = "N/A",
    academicServicesApproved = "N/A",
    academicDirectorApproval = "N/A",
    academicDirectorApproved = "N/A",
    executiveDirectorApproval = "N/A",
    executiveDirectorApproved = "N/A",
  } = formData;

  return (
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
            <Text>Location: {eventLocation}</Text>
            <Text>Date of Application: {applicationDate}</Text>
          </View>
          <View style={styles.formRow}>
            <Text>On Campus: {isOnCampus === "on-campus" ? "Yes" : "No"}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. CONTACT INFORMATION</Text>
          <View style={styles.formRow}>
            <Text>Student Organization: {studentOrganization}</Text>
            <Text>Contact Person: {contactPerson}</Text>
          </View>
          <View style={styles.formRow}>
            <Text>Contact No: {contactNo}</Text>
            <Text>Email Address: {emailAddress}</Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. EVENT DETAILS</Text>
          <View style={styles.formRow}>
            <Text>Event Title: {eventTitle}</Text>
            <Text>Event Type: {eventType}</Text>
          </View>
          <View style={styles.formRow}>
            <Text>Venue Address: {venueAddress}</Text>
            <Text>Event Start Date: {eventStartDate}</Text>
            <Text>Event End Date: {eventEndDate}</Text>
          </View>
          <View style={styles.formRow}>
            <Text>Event Time: {eventTime}</Text>
          </View>
          <View style={styles.formRow}>
            <Text>Organizer: {organizer}</Text>
            <Text>Budget Amount: {budgetAmount}</Text>
          </View>
        </View>

        {/* Core Values Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CORE VALUES INTEGRATION</Text>
          <Text>{coreValuesIntegration}</Text>
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBJECTIVES</Text>
          <Text>{objectives}</Text>
        </View>

        {/* Communications and Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMMUNICATIONS AND PROMOTIONS REQUIRED</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text>Marketing Collaterals</Text>
              <Text>{marketing ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Press Release</Text>
              <Text>{pressRelease ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Others</Text>
              <Text>{others || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Facilities Considerations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FACILITIES CONSIDERATIONS</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text>Event Facilities</Text>
              <Text>{eventFacilities ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Holding Area</Text>
              <Text>{holdingArea ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Toilets</Text>
              <Text>{toilets ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Transportation & Parking</Text>
              <Text>{transportation ? "Yes" : "No"}</Text>
            </View>
          </View>
        </View>

        {/* Event Management Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. EVENT MANAGEMENT TEAM</Text>
          <Text>Event Management Head: {eventManagementHead}</Text>
          <Text>Event Committees and Members: {eventCommitteesandMembers}</Text>
        </View>

        {/* Risk Assessments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. RISK ASSESSMENTS</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text>Health</Text>
              <Text>{health || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Safety of Attendees</Text>
              <Text>{safetyAttendees || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Emergency/First Aid</Text>
              <Text>{emergencyFirstAid || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Fire Safety</Text>
              <Text>{fireSafety || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Weather</Text>
              <Text>{weather || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Signatures/Endorsements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. SIGNATURES / ENDORSEMENTS</Text>
          <View style={styles.signatureRow}>
            <Text>Applicant Organization: {applicantSignature}</Text>
            <Text>Faculty Adviser/College Dean: {facultySignature}</Text>
          </View>
          <View style={styles.signatureRow}>
            <Text>Date: {applicantDate}</Text>
            <Text>Date: {facultyDate}</Text>
          </View>
        </View>

        {/* Approvals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. APPROVALS</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text>Student Development Office: {studentDevApproval}</Text>
              <Text>Approved / Disapproved: {studentDevApproved}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Academic Services Director: {academicServicesApproval}</Text>
              <Text>Approved / Disapproved: {academicServicesApproved}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Academic Director: {academicDirectorApproval}</Text>
              <Text>Approved / Disapproved: {academicDirectorApproved}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>Executive Director: {executiveDirectorApproval}</Text>
              <Text>Approved / Disapproved: {executiveDirectorApproved}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ActivityPdf;