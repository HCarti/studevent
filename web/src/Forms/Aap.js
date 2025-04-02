import React, {useState, useEffect} from "react";
import axios from 'axios';
import './Aap.css';
import moment from 'moment';
import { FaCheck } from 'react-icons/fa'; // Import check icon from react-icons
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from "@react-pdf/renderer";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NU_logo from "../Images/NU_logo.png";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MdOutlineContactPage } from "react-icons/md";

const Aap = () => {
  // Get route parameters and navigation
  const { formId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = !!formId; // Determine if we're in edit mode

  // Initialize form state
  const [formData, setFormData] = useState({
    eventLocation: "",
    applicationDate: new Date().toISOString().split('T')[0],
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

  const [currentStep, setCurrentStep] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [occupiedDates, setOccupiedDates] = useState([]);

  // Notification component
  const Notification = ({ message }) => (
    <div className="notification">
      {message}
    </div>
  );

  // Fetch form data if in edit mode
  useEffect(() => {
    // Update the fetchFormData function in your useEffect
const fetchFormData = async () => {
  if (!isEditMode) return;
  
  try {
    const token = localStorage.getItem('token');
    // 1. First fetch the form data
    const formResponse = await fetch(`https://studevent-server.vercel.app/api/forms/${formId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!formResponse.ok) throw new Error('Failed to fetch form');
    
    const formData = await formResponse.json();
    
    // 2. If studentOrganization is an ObjectId, fetch the organization details
    let organizationName = formData.studentOrganization;
    
    // Check if studentOrganization is an ObjectId (24 character hex string)
    if (typeof formData.studentOrganization === 'string' && /^[0-9a-fA-F]{24}$/.test(formData.studentOrganization)) {
      const orgResponse = await fetch(`https://studevent-server.vercel.app/api/organizations/${formData.studentOrganization}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        organizationName = orgData.organizationName || formData.studentOrganization;
      }
    }
    
    // 3. Format all data for the form
    const formattedData = {
      ...formData,
      studentOrganization: organizationName, // Use the resolved name
      eventStartDate: formData.eventStartDate ? new Date(formData.eventStartDate).toISOString() : '',
      eventEndDate: formData.eventEndDate ? new Date(formData.eventEndDate).toISOString() : '',
      applicationDate: formData.applicationDate ? new Date(formData.applicationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };
    
    setFormData(formattedData);
  } catch (error) {
    console.error('Error fetching form:', error);
    alert('Failed to load form data');
    navigate('/submitted-forms');
  } finally {
    setLoading(false);
  }
};

    // Pre-fill user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setFormData(prev => ({
        ...prev,
        studentOrganization: userData.role === 'Organization' ? userData.organizationName || "" : "",
        emailAddress: userData.email || "",
        applicationDate: new Date().toISOString().split('T')[0]
      }));
    }

    fetchFormData();
    fetchOccupiedDates();
  }, [formId, isEditMode, navigate]);

  // Fetch occupied dates
  const fetchOccupiedDates = async () => {
    try {
      const response = await fetch('https://studevent-server.vercel.app/api/occupied-dates');
      const data = await response.json();
      if (data?.occupiedDates) {
        setOccupiedDates(data.occupiedDates);
      }
    } catch (error) {
      console.error('Error fetching occupied dates:', error);
    }
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date.toISOString(),
    }));
  };

  const isOccupied = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return occupiedDates.includes(formattedDate);
  };

  // Form navigation
  const handleNext = () => {
    if (isSectionComplete(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Please complete all required fields in this section before proceeding.");
    }
  };

  const isSectionComplete = (step) => {
    const requiredFields = getFieldsForStep(step);
    return requiredFields.every(field => {
      const value = formData[field];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return false;
      }
      
      // For strings
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      
      // For numbers
      if (typeof value === 'number') {
        return true; // Or add specific number validation if needed
      }
      
      // For dates
      if (value instanceof Date) {
        return true;
      }
      
      // For other types (booleans, etc.)
      return !!value;
    });
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

  // Form submission
  const handleSubmit = async () => {
    // Validate required fields
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

    // Date validation
    const eventStart = moment(formData.eventStartDate);
    const eventEnd = moment(formData.eventEndDate);
    if (!eventStart.isValid() || !eventEnd.isValid() || eventEnd.isBefore(eventStart)) {
      alert("Invalid event dates");
      return;
    }

    // Prepare submission data
    const submissionData = {
      formType: 'Activity',
      ...formData,
      eventStartDate: new Date(formData.eventStartDate),
      eventEndDate: new Date(formData.eventEndDate),
      applicationDate: new Date(formData.applicationDate),
      contactNo: Number(formData.contactNo),
      budgetAmount: Number(formData.budgetAmount),
      length: moment(formData.eventEndDate).diff(moment(formData.eventStartDate), 'hours')
    };

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in again');
      return;
    }

    try {
      // Determine if we're creating or updating
      const url = isEditMode 
        ? `https://studevent-server.vercel.app/api/forms/${formId}`
        : 'https://studevent-server.vercel.app/api/forms';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Submission failed');
        } else {
          const text = await response.text();
          throw new Error(text || `HTTP error! Status: ${response.status}`);
        }
      }

      // Show success and redirect
      setFormSent(true);
      setNotificationVisible(true);
      
      setTimeout(() => {
        setNotificationVisible(false);
      }, 3000);

      // Reset form if creating new
      if (!isEditMode) {
        setFormData({
          eventLocation: "",
          applicationDate: new Date().toISOString().split('T')[0],
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
      }

    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred');
    }
  };


  const renderFormHeader = () => (
    <div className="form-header">
      {isEditMode}
      <h1>
        {isEditMode ? 'Edit Activity Application' : 'Activity Application Form'}
      </h1>
      <p>This Event Proposal/Plan should be submitted at least 1 to 3 months before the event.</p>
    </div>
  );

  const renderSubmitButton = () => (
    <button onClick={handleSubmit}>
      {isEditMode ? 'Update Form' : 'Submit Form'}
    </button>
  );

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

            {/* <label>Contact Person:</label>
            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} /> */}
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
              // highlightDates={getHighlightedDates()}
              dayClassName={date => isOccupied(date) ? 'occupied' : 'available'}
              dateFormat="yyyy-MM-dd HH:mm"
              showTimeSelect
            />
            <label>Event End Date:</label>
            <DatePicker
              selected={formData.eventEndDate ? new Date(formData.eventEndDate) : null}
              onChange={(date) => handleDateChange(date, 'eventEndDate')}
              minDate={new Date()}
              // highlightDates={getHighlightedDates()}
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
         {notificationVisible && (
        <Notification message={`Form ${isEditMode ? 'updated' : 'submitted'} successfully!`} />
      )}
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
          {renderFormHeader()}
          {renderStepContent()}
          <div className="form-navigation">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
            )}
            {currentStep < 4 ? (
              <button onClick={handleNext}>Next</button>
            ) : (
              renderSubmitButton()
            )}
          </div>
        </div>
      </div>
    );
};

export default Aap; 
