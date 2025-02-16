import React, {useState, useEffect} from "react";
import axios from 'axios';
import './Project.css';
import moment from 'moment';
import { FaCheck } from 'react-icons/fa'; // Import check icon from react-icons
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from "@react-pdf/renderer";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NU_logo from "../Images/NU_logo.png";
import { useNavigate } from 'react-router-dom';
import { MdOutlineContactPage } from "react-icons/md";

const ProjectPDF = ({ formData }) => (
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

const Project = () => {
  const [formData, setFormData] = useState({
    eventLocation: "",
    applicationDate: new Date().toISOString().split('T')[0], // Sets today's date in YYYY-MM-DD format
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
  const [notificationVisible, setNotificationVisible] = useState(false); // State to control notification visibility

  const Notification = ({ message }) => (
    <div className="notification">
      {message}
    </div>
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const [occupiedDates, setOccupiedDates] = useState([]);

  const handleDateChange = (date, field) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: date.toISOString(), // Store as ISO string for backend compatibility
    }));
  };

  useEffect(() => {
    // Fetch occupied dates from backend
    const fetchOccupiedDates = async () => {
      try {
        const response = await fetch('https://studevent-server.vercel.app/api/occupied-dates');
        const data = await response.json();
        if (data && data.occupiedDates) {
          setOccupiedDates(data.occupiedDates); // Ensure `occupiedDates` exists
        } else {
          console.error("Occupied dates data is undefined or malformed:", data);
        }
      } catch (error) {
        console.error('Error fetching occupied dates:', error);
      }
    };
    
  
    fetchOccupiedDates();
  }, []);
  

  const isOccupied = (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    return occupiedDates.includes(formattedDate); // Directly check if the formatted date is in the array
  };
  

  // Adjust highlighting logic
  const getHighlightedDates = () => {
    return occupiedDates.map(d => new Date(d));
  };
  

  const handleNext = () => {
    if (isSectionComplete()) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Please complete all required fields in this section before proceeding.");
    }
  };

  
  const isSectionComplete = (step) => {
    const requiredFields = getFieldsForStep(step);
    for (const field of requiredFields) {
      if (!formData[field]) return false;
    }
    return true;
  };
  
  const getFieldsForStep = (step) => {
    const sections = [
      ['projectTitle', 'projectDescription','objectives', 'date', 'time', 'venue', 'targetParticipants'],
      [
        'eventTitle', 'eventType', 'venueAddress', 'eventStartDate', 'eventEndDate', 'organizer',
        'budgetAmount', 'budgetFrom', 'coreValuesIntegration', 'objectives', 'marketingCollaterals',
        'pressRelease', 'others', 'eventFacilities', 'holdingArea', 'toilets', 'transportationandParking',
        'more', 'licensesRequired', 'houseKeeping', 'wasteManagement'
      ],
      ['nameOfEvent', 'time2', 'segment'],
      ['nameTL', 'desingatedOfficeTL', 'nameWC', 'designatedOfficeWC'],
      ['taskList', 'designatedOfficeTD', 'deadline'],
      ['pubicationMaterials', 'schedule'],
      ['equipments', 'estimatedQuantity' ],
      ['items', 'estimatedQuantity2', 'estimatedPerUnit', 'estimatedAmount'],
    ];
    return sections[step] || [];
  };

   // Fetch the logged-in user's organization name on component mount

    // Pre-fill `studentOrganization` with `organizationName` if logged in user is an organization
    // useEffect(() => {
    //   const userData = JSON.parse(localStorage.getItem('user'));
    //   if (userData) {
    //     setFormData(prevData => ({
    //       ...prevData,
    //       studentOrganization: userData.role === 'Organization' ? userData.organizationName || "" : "",
    //       emailAddress: userData.email || "",
    //       applicationDate: new Date().toISOString().split('T')[0] // Always sets today's date
    //     }));
    //   }
    // }, []);
    
    

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

    const token = localStorage.getItem('token'); // Ensure you have previously set this during login

    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    console.log('Token:', token); // Check if token is defined


    // Convert fields to expected data types for the backend schema
    const eventData = {
      ...formData,
      eventLocation: formData.eventLocation,
      applicationDate: new Date(formData.applicationDate),
      studentOrganization: formData.studentOrganization, // Ensure this field is properly formatted as an ObjectId or handled by the backend
      contactPerson: formData.contactPerson,
      contactNo: Number(formData.contactNo), // Ensure it's converted to a number if necessary
      emailAddress: formData.emailAddress,
      eventTitle: formData.eventTitle,
      eventType: formData.eventType,
      venueAddress: formData.venueAddress,
      eventStartDate: new Date(formData.eventStartDate), // Convert to Date object
      eventEndDate: new Date(formData.eventEndDate), // Convert to Date object
      organizer: formData.organizer,
      budgetAmount: Number(formData.budgetAmount), // Convert to number
      budgetFrom: formData.budgetFrom,
      coreValuesIntegration: formData.coreValuesIntegration,
      objectives: formData.objectives,
      marketingCollaterals: formData.marketingCollaterals,
      pressRelease: formData.pressRelease,
      others: formData.others,
      eventFacilities: formData.eventFacilities,
      holdingArea: formData.holdingArea,
      toilets: formData.toilets,
      transportationandParking: formData.transportationandParking,
      more: formData.more,
      licensesRequired: formData.licensesRequired,
      houseKeeping: formData.houseKeeping,
      wasteManagement: formData.wasteManagement,
      eventManagementHead: formData.eventManagementHead,
      eventCommitteesandMembers: formData.eventCommitteesandMembers,
      health: formData.health,
      safetyAttendees: formData.safetyAttendees,
      emergencyFirstAid: formData.emergencyFirstAid,
      fireSafety: formData.fireSafety,
      weather: formData.weather,
      length: moment(formData.eventEndDate).diff(moment(formData.eventStartDate), 'hours') // Calculate event length in hours
    };
    

    try {
      const response = await fetch('https://studevent-server.vercel.app/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Uncomment if needed
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
    
      if (result._id) {
        setEventId(result._id);
      }
      setFormSent(true);

      setFormSent(true); // Mark form as submitted
      setNotificationVisible(true); // Show notification
      setTimeout(() => {
        setNotificationVisible(false); // Hide notification after 3 seconds
      }, 3000);
    
      // Reset form data
      setFormData({
        projectTitle: "",
        projectDescription: "",
        objectives: "",
        date: "",
        time: "",
        venue: "",
        targetParticipants: "",
        projectGuidelines: "",
        nameofEvent: "",
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


  //case 2-7 handling
  const [rows, setRows] = useState([{ id: 1, name: "", email: "" }]);

    // Handle input change
    const handleInputChange = (id, event) => {
      const { name, value } = event.target;
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === id ? { ...row, [name]: value } : row))
      );
    };
  
    // Add new row
    const addRow = () => {
      setRows([...rows, { id: Date.now(), name: "", email: "" }]);
    };
  
    // Remove Name field
    const removeName = (id) => {
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === id) {
            const { name, ...rest } = row; // Remove 'name' field
            return rest;
          }
          return row;
        })
      );
    };
  
    // Remove Email field
    const removeEmail = (id) => {
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === id) {
            const { email, ...rest } = row; // Remove 'email' field
            return rest;
          }
          return row;
        })
      );
    };
  
    // Remove entire row
    const removeRow = (id) => {
      setRows(rows.filter((row) => row.id !== id));
    };


  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <label>Project Title:</label>
            <input
            type="text"
            name="projectTitle"
            value={formData.projectTitle}/>

            <label>Project Description:</label>
            <input
            type="text"
            name="projectDescription"
            value={formData.projectDescription}
          />
          <label>Objectives:</label>
            <input
            type="text"
            name="objectives"
            value={formData.objectives}
          />
          <label>Date:</label>
            <input
            type="date"
            name="date"
            value={formData.date}
          />
          <label>Time:</label>
            <input
            type="time"
            name="time"
            value={formData.time}
          />
          <label>Venue:</label>
            <input
            type="text"
            name="venue"
            value={formData.venue}
          />
          <label>Target Participants:</label>
            <input
            type="text"
            name="targetParticipants"
            value={formData.targetParticipants}
          />
          </div>
        );

      case 1:
        return (
          <div>
            <label>Project Guidelines:</label>
            <input
              type="text"
              name="projectGuidelines"
              value={formData.projectGuidelines}
            />
          </div>
        );

      case 2:
        return (
          <div>
             <label>Name of Event:</label>
                  <input 
                    type="text" 
                    name="nameofEvent" 
                    value={formData.nameofEvent} 
                    onChange={handleChange} 
                  />

                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Segment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          <td>
                            {row.name !== undefined && (
                              <div className="input-container">
                                <input
                                  type="text"
                                  name="name"
                                  value={row.name}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            {row.email !== undefined && (
                              <div className="input-container">
                                <input
                                  type="email"
                                  name="email"
                                  value={row.email}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="icon-btn delete-btn" onClick={() => removeRow(row.id)}>
                                ❌
                              </button>
                              {index === rows.length - 1 && (
                                <button className="icon-btn add-btn" onClick={addRow}>
                                  ➕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
          </div>
        );

      case 3:
        return (
          <div>
            <table>
              <thead>
                <tr>
                <th>Name</th>
                <th>Designated Office</th>
                </tr>
              </thead>
              <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          <td>
                            {row.name !== undefined && (
                              <div className="input-container">
                                <input
                                  type="text"
                                  name="name"
                                  value={row.name}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            {row.email !== undefined && (
                              <div className="input-container">
                                <input
                                  type="email"
                                  name="email"
                                  value={row.email}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="icon-btn delete-btn" onClick={() => removeRow(row.id)}>
                                ❌
                              </button>
                              {index === rows.length - 1 && (
                                <button className="icon-btn add-btn" onClick={addRow}>
                                  ➕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
            </table>
            <table>
              Working Committees
              <thead>
                <tr>
                <th>Name</th>
                <th>Designated Office</th>
                </tr>
              </thead>
              <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          <td>
                            {row.name !== undefined && (
                              <div className="input-container">
                                <input
                                  type="text"
                                  name="name"
                                  value={row.name}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            {row.email !== undefined && (
                              <div className="input-container">
                                <input
                                  type="email"
                                  name="email"
                                  value={row.email}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="icon-btn delete-btn" onClick={() => removeRow(row.id)}>
                                ❌
                              </button>
                              {index === rows.length - 1 && (
                                <button className="icon-btn add-btn" onClick={addRow}>
                                  ➕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
            </table>
          </div>
        );

      case 4:
        return (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Task List</th>
                  <th>Designated Office</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          <td>
                            {row.name !== undefined && (
                              <div className="input-container">
                                <input
                                  type="text"
                                  name="name"
                                  value={row.name}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            {row.email !== undefined && (
                              <div className="input-container">
                                <input
                                  type="email"
                                  name="email"
                                  value={row.email}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="icon-btn delete-btn" onClick={() => removeRow(row.id)}>
                                ❌
                              </button>
                              {index === rows.length - 1 && (
                                <button className="icon-btn add-btn" onClick={addRow}>
                                  ➕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
            </table>
          </div>

        );
        case 5:
          return (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Publication Materials</th>
                    <th>Schedule </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          <td>
                            {row.name !== undefined && (
                              <div className="input-container">
                                <input
                                  type="text"
                                  name="name"
                                  value={row.name}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            {row.email !== undefined && (
                              <div className="input-container">
                                <input
                                  type="email"
                                  name="email"
                                  value={row.email}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="icon-btn delete-btn" onClick={() => removeRow(row.id)}>
                                ❌
                              </button>
                              {index === rows.length - 1 && (
                                <button className="icon-btn add-btn" onClick={addRow}>
                                  ➕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
              </table>
            </div>
          );
          case 6:
        return (
          <div>
            <table>
              <thead>
                <tr>
                    <th>Equipments</th>
                    <th>Estimated Quantity </th>
                    <th>Action</th>
                </tr>
              </thead>
              <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          <td>
                            {row.name !== undefined && (
                              <div className="input-container">
                                <input
                                  type="text"
                                  name="name"
                                  value={row.name}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            {row.email !== undefined && (
                              <div className="input-container">
                                <input
                                  type="email"
                                  name="email"
                                  value={row.email}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="icon-btn delete-btn" onClick={() => removeRow(row.id)}>
                                ❌
                              </button>
                              {index === rows.length - 1 && (
                                <button className="icon-btn add-btn" onClick={addRow}>
                                  ➕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
            </table>
          </div>
        );
       case 7:
        return (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Items</th>
                  <th>Estimated Quantity</th>
                  <th>Estimated Per Unit</th>
                  <th>Estimated Total/Amount</th>
                </tr>
              </thead>
              <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          <td>
                            {row.name !== undefined && (
                              <div className="input-container">
                                <input
                                  type="text"
                                  name="name"
                                  value={row.name}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            {row.email !== undefined && (
                              <div className="input-container">
                                <input
                                  type="email"
                                  name="email"
                                  value={row.email}
                                  onChange={(e) => handleInputChange(row.id, e)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="icon-btn delete-btn" onClick={() => removeRow(row.id)}>
                                ❌
                              </button>
                              {index === rows.length - 1 && (
                                <button className="icon-btn add-btn" onClick={addRow}>
                                  ➕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
            </table>
          </div>
        );
      

      default:
        return <div>Unknown step</div>;
    }
  };

    return (
      <div className="form-ubox-1">
         {notificationVisible && <Notification message="Form submitted successfully!" />}
        <div className="sidebar">
          <ul>
            <li className={currentStep === 0 ? 'active' : ''}>
              {isSectionComplete(0) ? <FaCheck className="check-icon green" /> : null}
              Project Overview
            </li>
            <li className={currentStep === 1 ? 'active' : ''}>
              {isSectionComplete(1) ? <FaCheck className="check-icon green" /> : null}
              Project Guidelines
            </li>
            <li className={currentStep === 2 ? 'active' : ''}>
              {isSectionComplete(2) ? <FaCheck className="check-icon green" /> : null}
              Program Flow
            </li>
            <li className={currentStep === 3 ? 'active' : ''}>
              {isSectionComplete(3) ? <FaCheck className="check-icon green" /> : null}
              Officers in Charge
            </li>
            <li className={currentStep === 4 ? 'active' : ''}>
              {isSectionComplete(4) ? <FaCheck className="check-icon green" /> : null}
              Task Deligation
            </li>
            <li className={currentStep === 5 ? 'active' : ''}>
              {isSectionComplete(5) ? <FaCheck className="check-icon green" /> : null}
              Timeline/Posting Schedules
            </li>
            <li className={currentStep === 6 ? 'active' : ''}>
              {isSectionComplete(6) ? <FaCheck className="check-icon green" /> : null}
              School Facilities & Equipments
            </li>
            <li className={currentStep === 7 ? 'active' : ''}>
              {isSectionComplete(7) ? <FaCheck className="check-icon green" /> : null}
              Budget Proposal
            </li>
          </ul>
        </div>
        <div className="inner-forms-1">
          <h1>Project Proposal</h1>
          {renderStepContent()}
          <div className="form-navigation">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
            )}
            {currentStep < 7 ? (
              <button onClick={handleNext}>Next</button>
            ) : (
              <button onClick={handleSubmit}>Submit</button>
            )}
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

export default Project; 
