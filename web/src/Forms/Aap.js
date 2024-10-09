import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import NU_logo from '../Images/NU_logo.png';
 
const Aap = () => {
  const [formData, setFormData] = useState({
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
    eventManagementHead: "",
  });
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
 
  const checkPageEnd = (doc, y) => {
    if (y > 270) { // Check if content is close to the bottom of the page
      doc.addPage();
      return 10; // Reset y-position for new page
    }
    return y;
  };
 
  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 10; // Y-position tracker
 
    // Add the logo at the top
    doc.addImage(NU_logo, 'PNG', 10, 10, 30, 30);
    y += 40; // Adjust y-position after adding logo
 
    // Add title and header
    doc.setFontSize(16);
    doc.text("NU MOA Student Development and Activities Office", 60, y);
    y += 10;
 
    doc.setFontSize(14);
    doc.text("STUDENT ORGANIZATION ACTIVITY APPLICATION FORM", 60, y);
    y += 10;
 
    // Add header line
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.line(10, y, 200, y);
    y += 10;
 
    // Event Information Section
    doc.setFillColor(200, 200, 255); // Light blue background
    doc.rect(10, y, 190, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("1. EVENT INFORMATION", 12, y + 7);
    y += 15;
 
    doc.setFont("helvetica", "normal");
    doc.text(`Event Location: ${formData.eventLocation}`, 12, y);
    doc.text(`On Campus: ${formData.isOnCampus === "on-campus" ? "Yes" : "No"}`, 140, y);
    y += 10;
 
    doc.text(`Date of Application: ${formData.applicationDate}`, 12, y);
    y += 10;
 
    // Contact Information Section
    y = checkPageEnd(doc, y);
    doc.setFillColor(200, 200, 255);
    doc.rect(10, y, 190, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("2. CONTACT INFORMATION", 12, y + 7);
    y += 15;
 
    doc.setFont("helvetica", "normal");
    doc.text(`Student Organization: ${formData.studentOrganization}`, 12, y);
    doc.text(`Contact Person: ${formData.contactPerson}`, 140, y);
    y += 10;
 
    doc.text(`Contact No: ${formData.contactNo}`, 12, y);
    doc.text(`Email Address: ${formData.emailAddress}`, 140, y);
    y += 15;
 
    // Event Details Section
    y = checkPageEnd(doc, y);
    doc.setFillColor(200, 200, 255);
    doc.rect(10, y, 190, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("3. EVENT DETAILS", 12, y + 7);
    y += 15;
 
    doc.setFont("helvetica", "normal");
    doc.text(`Event Title: ${formData.eventTitle}`, 12, y);
    doc.text(`Event Type: ${formData.eventType}`, 140, y);
    y += 10;
 
    doc.text(`Venue Address: ${formData.venueAddress}`, 12, y);
    doc.text(`Event Date: ${formData.eventDate}`, 140, y);
    y += 10;
 
    doc.text(`Event Time: ${formData.eventTime}`, 12, y);
    y += 15;
 
    // Organizer and Budget
    y = checkPageEnd(doc, y);
    doc.text(`Organizer: ${formData.organizer}`, 12, y);
    doc.text(`Budget Amount: ${formData.budgetAmount}`, 140, y);
    y += 15;
 
    // Core Values Integration Section
    y = checkPageEnd(doc, y);
    doc.setFillColor(200, 200, 255);
    doc.rect(10, y, 190, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("4. CORE VALUES INTEGRATION", 12, y + 7);
    y += 15;
 
    doc.setFont("helvetica", "normal");
    doc.text(`Core Values Integration: ${formData.coreValuesIntegration}`, 12, y);
    y += 15;
 
    // Objectives Section
    y = checkPageEnd(doc, y);
    doc.setFillColor(200, 200, 255);
    doc.rect(10, y, 190, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("5. OBJECTIVES", 12, y + 7);
    y += 15;
 
    doc.setFont("helvetica", "normal");
    doc.text(`Objectives: ${formData.objectives}`, 12, y);
    y += 15;
 
    // Event Management Head
    y = checkPageEnd(doc, y);
    doc.setFillColor(200, 200, 255);
    doc.rect(10, y, 190, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("6. EVENT MANAGEMENT HEAD", 12, y + 7);
    y += 15;
 
    doc.setFont("helvetica", "normal");
    doc.text(`Event Management Head: ${formData.eventManagementHead}`, 12, y);
    y += 15;
 
    // Save the PDF
    doc.save("Activity_Application_Form.pdf");
  };
 
  return (
    <div>
      <h1>Activity Application Form</h1>
      <form>
        {/* Event Location */}
        <label>Event Location:</label>
        <input
          type="text"
          name="eventLocation"
          value={formData.eventLocation}
          onChange={handleChange}
        />
        <br />
 
        {/* On Campus / Off Campus */}
        <label>Is the event on campus?</label>
        <input
          type="radio"
          name="isOnCampus"
          value="on-campus"
          checked={formData.isOnCampus === "on-campus"}
          onChange={handleChange}
        />{" "}
        Yes
        <input
          type="radio"
          name="isOnCampus"
          value="off-campus"
          checked={formData.isOnCampus === "off-campus"}
          onChange={handleChange}
        />{" "}
        No
        <br />
 
        {/* Date of Application */}
        <label>Date of Application:</label>
        <input
          type="date"
          name="applicationDate"
          value={formData.applicationDate}
          onChange={handleChange}
        />
        <br />
 
        {/* Student Organization */}
        <label>Student Organization:</label>
        <input
          type="text"
          name="studentOrganization"
          value={formData.studentOrganization}
          onChange={handleChange}
        />
        <br />
 
        {/* Contact Information */}
        <label>Contact Person:</label>
        <input
          type="text"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
        />
        <br />
 
        <label>Contact No:</label>
        <input
          type="text"
          name="contactNo"
          value={formData.contactNo}
          onChange={handleChange}
        />
        <br />
 
        <label>Email Address:</label>
        <input
          type="email"
          name="emailAddress"
          value={formData.emailAddress}
          onChange={handleChange}
        />
        <br />
 
        {/* Event Details */}
        <label>Event Title:</label>
        <input
          type="text"
          name="eventTitle"
          value={formData.eventTitle}
          onChange={handleChange}
        />
        <br />
 
        <label>Event Type:</label>
        <input
          type="text"
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
        />
        <br />
 
        <label>Venue Address:</label>
        <input
          type="text"
          name="venueAddress"
          value={formData.venueAddress}
          onChange={handleChange}
        />
        <br />
 
        <label>Event Date:</label>
        <input
          type="date"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
        />
        <br />
 
        <label>Event Time:</label>
        <input
          type="time"
          name="eventTime"
          value={formData.eventTime}
          onChange={handleChange}
        />
        <br />
 
        <label>Organizer:</label>
        <input
          type="text"
          name="organizer"
          value={formData.organizer}
          onChange={handleChange}
        />
        <br />
 
        <label>Budget Amount:</label>
        <input
          type="number"
          name="budgetAmount"
          value={formData.budgetAmount}
          onChange={handleChange}
        />
        <br />
 
        {/* Core Values Integration */}
        <label>Core Values Integration:</label>
        <textarea
          name="coreValuesIntegration"
          value={formData.coreValuesIntegration}
          onChange={handleChange}
        />
        <br />
 
        {/* Objectives */}
        <label>Objectives:</label>
        <textarea
          name="objectives"
          value={formData.objectives}
          onChange={handleChange}
        />
        <br />
 
        {/* Event Management Head */}
        <label>Event Management Head:</label>
        <input
          type="text"
          name="eventManagementHead"
          value={formData.eventManagementHead}
          onChange={handleChange}
        />
        <br />
 
        {/* Generate PDF Button */}
        <button type="button" onClick={generatePDF}>
          Generate PDF
        </button>
      </form>
    </div>
  );
};
 
export default Aap;
 