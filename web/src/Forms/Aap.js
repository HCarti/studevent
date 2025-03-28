import React, {useState, useEffect} from "react";
import axios from 'axios';
import './Aap.css';
import moment from 'moment';
import { FaCheck } from 'react-icons/fa'; // Import check icon from react-icons
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from "@react-pdf/renderer";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NU_logo from "../Images/NU_logo.png";
import { useNavigate } from 'react-router-dom';
import { MdOutlineContactPage } from "react-icons/md";

const Aap = () => {
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
    if (isSectionComplete(currentStep)) { // Pass currentStep to check completion
      setCurrentStep(currentStep + 1);
    } else {
      alert("Please complete all required fields in this section before proceeding.");
    }
  };
  
  
    const isSectionComplete = (step) => {
      const requiredFields = getFieldsForStep(step);
      for (const field of requiredFields) {
        if (!formData[field].trim()) { // Ensure non-empty values
          return false;
        }
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
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setFormData(prevData => ({
          ...prevData,
          studentOrganization: userData.role === 'Organization' ? userData.organizationName || "" : "",
          emailAddress: userData.email || "",
          applicationDate: new Date().toISOString().split('T')[0] // Always sets today's date
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

    const token = localStorage.getItem('token'); // Ensure you have previously set this during login

    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    console.log('Token:', token); // Check if token is defined


    // Convert fields to expected data types for the backend schema
    const eventData = {
      formType: 'Activity', // ⭐️ Critical addition
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
            <input
            type="date"
            name="applicationDate"
            value={formData.applicationDate}
            readOnly
          />
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
              readOnly
            />

            <label>Contact Person:</label>
            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
            <label>Contact No:</label>
            <input type="text" name="contactNo" value={formData.contactNo} onChange={handleChange} />
            <label>Email Address:</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              readOnly
            />
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
            <DatePicker
              selected={formData.eventStartDate ? new Date(formData.eventStartDate) : null}
              onChange={(date) => handleDateChange(date, 'eventStartDate')}
              minDate={new Date()}
              highlightDates={getHighlightedDates()}
              dayClassName={date => isOccupied(date) ? 'occupied' : 'available'}
              dateFormat="yyyy-MM-dd HH:mm"
              showTimeSelect
            />
            <label>Event End Date:</label>
            <DatePicker
              selected={formData.eventEndDate ? new Date(formData.eventEndDate) : null}
              onChange={(date) => handleDateChange(date, 'eventEndDate')}
              minDate={new Date()}
              highlightDates={getHighlightedDates()}
              dayClassName={date => isOccupied(date) ? 'occupied' : 'available'}
              dateFormat="yyyy-MM-dd HH:mm"
              showTimeSelect
            />
            <label>Organizer:</label>
            <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} />
            <label>Budget Amount:</label>
            <input 
            type="number" 
            name="budgetAmount" 
            value={formData.budgetAmount} 
            onChange={handleChange} 
            required
          />
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
         {notificationVisible && <Notification message="Form submitted successfully!" />}
        <div className="sidebar">
          <ul>
            <li className={currentStep === 0 ? 'active' : ''}>
              {isSectionComplete(0) ? <FaCheck className="check-icon green" /> : null}
              Event Specifics
            </li>
            <li className={currentStep === 1 ? 'active' : ''}>
              {isSectionComplete(1) ? <FaCheck className="check-icon green" /> : null}
              Organization Info
            </li>
            <li className={currentStep === 2 ? 'active' : ''}>
              {isSectionComplete(2) ? <FaCheck className="check-icon green" /> : null}
              Event Details
            </li>
            <li className={currentStep === 3 ? 'active' : ''}>
              {isSectionComplete(3) ? <FaCheck className="check-icon green" /> : null}
              Event Management Team
            </li>
            <li className={currentStep === 4 ? 'active' : ''}>
              {isSectionComplete(4) ? <FaCheck className="check-icon green" /> : null}
              Risk Assessments
            </li>
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
        </div>
      </div>
    );
};

export default Aap; 
