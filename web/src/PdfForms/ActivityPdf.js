import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, PDFViewer } from '@react-pdf/renderer';
import NU_logo from "../Images/NU_logo.png";

// A4 dimensions in points (1mm = 2.83465 points)
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

const styles = StyleSheet.create({
  document: {
    width: '100%',
    minHeight: '100vh',
  },
  page: {
    padding: 40,
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333',
    backgroundColor: '#FFF',
    size: 'A4',
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a365d',
    paddingBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerText: {
    marginLeft: 15,
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#1a365d',
  },
  formTitle: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
    fontWeight: "bold",
    color: '#1a365d',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontWeight: "bold",
    backgroundColor: "#1a365d",
    color: 'white',
    padding: 5,
    margin: -10,
    marginBottom: 5,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    gap: 10,
  },
  formColumn: {
    flex: 1,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 5,
    backgroundColor: 'white',
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableCell: {
    flex: 1,
    padding: 3,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#edf2f7',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  longText: {
    textAlign: 'justify',
    marginBottom: 5,
    lineHeight: 1.4,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 10,
  },
  value: {
    flex: 1,
  },
  borderedField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 3,
    padding: 5,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  borderedFieldLabel: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  borderedFieldValue: {
    fontSize: 10,
    minHeight: 15,
    paddingTop: 3,
  },
  borderedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    gap: 10,
  },
  borderedColumn: {
    flex: 1,
  },
  // compact tables
  compactTable: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  compactTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  compactTableFirstCell: {
    width: '40%',
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  compactTableCell: {
    width: '60%',
    padding: 3,
  },
  compactTableIndentedRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  compactTableIndentedCell: {
    width: '40%',
    padding: 3,
    paddingLeft: 15,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
});

// Create Document Component with Page Numbers
const ActivityPdf = ({ formData = {} }) => {
  const {
    eventLocation = "N/A",
    applicationDate = "N/A",
    studentOrganization = "N/A",
    contactPerson = "N/A",
    contactNo = "N/A",
    emailAddress = "N/A",
    eventTitle = "N/A",
    eventType = "N/A",
    venueAddress = "N/A",
    eventStartDate = "N/A",
    eventEndDate = "N/A",
    organizer = "N/A",
    budgetAmount = "N/A",
    budgetFrom = "N/A",
    coreValuesIntegration = "N/A",
    objectives = "N/A",
    marketingCollaterals = "N/A",
    pressRelease = "N/A",
    others = "N/A",
    eventFacilities = "N/A",
    holdingArea = "N/A",
    toilets = "N/A",
    transportationandParking = "N/A",
    more = "N/A",
    licensesRequired = "N/A",
    houseKeeping = "N/A",
    wasteManagement = "N/A",
    eventManagementHead = "N/A",
    eventCommitteesandMembers = "N/A",
    health = "N/A",
    safetyAttendees = "N/A",
    emergencyFirstAid = "N/A",
    fireSafety = "N/A",
    weather = "N/A"
  } = formData;

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      <Page 
        size="A4" 
        style={styles.page}
        wrap
      >
        {/* Header */}
        <View style={styles.header} fixed>
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
          <View style={styles.compactTable}>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Location</Text>
              <Text style={styles.compactTableCell}>{eventLocation}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Date Of Application</Text>
              <Text style={styles.compactTableCell}>{formatDate(applicationDate)}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. CONTACT INFORMATION</Text>
          <View style={styles.compactTable}>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Student Organization</Text>
              <Text style={styles.compactTableCell}>{studentOrganization}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Contact Person</Text>
              <Text style={styles.compactTableCell}>{contactPerson}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Contact No.</Text>
              <Text style={styles.compactTableCell}>{contactNo}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Email Address</Text>
              <Text style={styles.compactTableCell}>{emailAddress}</Text>
            </View>
          </View>
        </View>

        {/* Event Details */}
      <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. EVENT DETAILS</Text>
          <View style={styles.compactTable}>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Event Title</Text>
              <Text style={styles.compactTableCell}>{eventTitle}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Event Type</Text>
              <Text style={styles.compactTableCell}>{eventType}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Venue Address</Text>
              <Text style={styles.compactTableCell}>{venueAddress}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Start Date</Text>
              <Text style={styles.compactTableCell}>{formatDate(eventStartDate)}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>End Date</Text>
              <Text style={styles.compactTableCell}>{formatDate(eventEndDate)}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Organizer</Text>
              <Text style={styles.compactTableCell}>{organizer}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Budget Amount</Text>
              <Text style={styles.compactTableCell}>₱{budgetAmount}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Budget From</Text>
              <Text style={styles.compactTableCell}>{budgetFrom}</Text>
            </View>
          </View>
        </View>

        {/* Core Values Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CORE VALUES INTEGRATION</Text>
          <Text style={styles.longText}>{coreValuesIntegration}</Text>
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBJECTIVES</Text>
          <Text style={styles.longText}>{objectives}</Text>
        </View>

        {/* Communications and Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMMUNICATIONS AND PROMOTIONS REQUIRED</Text>
          <View style={styles.compactTable}>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Marketing Collaterals</Text>
              <Text style={styles.compactTableCell}>{marketingCollaterals}</Text>
            </View>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Press Release</Text>
              <Text style={styles.compactTableCell}>{pressRelease}</Text>
            </View>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Others</Text>
              <Text style={styles.compactTableCell}>{others}</Text>
            </View>
          </View>
        </View>

       {/* Facilities Considerations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FACILITIES CONSIDERATIONS</Text>
          <View style={styles.compactTable}>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Event Facilities</Text>
              <Text style={styles.compactTableCell}>{eventFacilities}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Holding Area</Text>
              <Text style={styles.compactTableCell}>{holdingArea}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Toilets</Text>
              <Text style={styles.compactTableCell}>{toilets}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Transportation & Parking</Text>
              <Text style={styles.compactTableCell}>{transportationandParking}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Others</Text>
              <Text style={styles.compactTableCell}>{more}</Text>
            </View>
          </View>
        </View>

        {/* Event Management Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. EVENT MANAGEMENT TEAM</Text>
          <View style={styles.compactTable}>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Management Head</Text>
              <Text style={styles.compactTableCell}>{eventManagementHead}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Committees and Members</Text>
              <Text style={styles.compactTableCell}>{eventCommitteesandMembers}</Text>
            </View>
          </View>
        </View>


        {/* Risk Assessments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. RISK ASSESSMENTS</Text>
          <View style={styles.compactTable}>
            <View style={styles.compactTableRow}>
              <Text style={styles.compactTableFirstCell}>Health</Text>
              <Text style={styles.compactTableCell}>{health}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Safety Attendees</Text>
              <Text style={styles.compactTableCell}>{safetyAttendees}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Emergency/First Aid</Text>
              <Text style={styles.compactTableCell}>{emergencyFirstAid}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Fire Safety</Text>
              <Text style={styles.compactTableCell}>{fireSafety}</Text>
            </View>
            <View style={styles.compactTableIndentedRow}>
              <Text style={styles.compactTableFirstCell}>Weather</Text>
              <Text style={styles.compactTableCell}>{weather}</Text>
            </View>
          </View>
        </View>

        {/* Page Number Footer */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>

      {/* Second Page for Additional Content */}
      <Page size="A4" style={styles.page} wrap>

        {/* Page Number Footer */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default ActivityPdf;   