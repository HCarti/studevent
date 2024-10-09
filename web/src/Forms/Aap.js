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

      {/* Event Management Head */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. EVENT MANAGEMENT TEAM</Text>
        <Text>Event Management Head: {formData.eventManagementHead}</Text>
      </View>
    </Page>
  </Document>
);

const Aap = () => {
  const [formData, setFormData] = React.useState({
    eventLocation: "",
    isOnCampus: "on-campus",
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
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div>
      <h1>Activity Application Form</h1>
      <form>
        <label>Event Location:</label>
        <input
          type="text"
          name="eventLocation"
          value={formData.eventLocation}
          onChange={handleChange}
        />
        <br />
        <label>Is the event on campus?</label>
        <input
          type="radio"
          name="isOnCampus"
          value="on-campus"
          checked={formData.isOnCampus === "on-campus"}
          onChange={handleChange}
        />
        Yes
        <input
          type="radio"
          name="isOnCampus"
          value="off-campus"
          checked={formData.isOnCampus === "off-campus"}
          onChange={handleChange}
        />
        No
        <br />
        <label>Date of Application:</label>
        <input
          type="date"
          name="applicationDate"
          value={formData.applicationDate}
          onChange={handleChange}
        />
        <br />
        {/* Add other form fields here */}
        <PDFDownloadLink
          document={<AapPDF formData={formData} />}
          fileName="Activity_Application_Form.pdf"
        >
          {({ loading }) =>
            loading ? "Loading document..." : "Download Activity Application Form"
          }
        </PDFDownloadLink>
      </form>
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
    borderBottom: "1 solid black",
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
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
