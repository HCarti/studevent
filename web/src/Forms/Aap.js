import React, {useState, useEffect} from "react";
import './Aap.css';
import moment from 'moment';
import { FaCheck } from 'react-icons/fa'; // Import check icon from react-icons
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import en from 'date-fns/locale/en-US';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
registerLocale('en', en);


const Aap = () => {
  // Get route parameters and navigation
  const { formId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = !!formId; // Determine if we're in edit mode

  // Initialize form state
  const [formData, setFormData] = useState({
    presidentSignature: "",
    presidentName: "",
    organizationId: "", // Add this new field
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

  const [fieldErrors, setFieldErrors] = useState({
    eventLocation: false,
    studentOrganization: false,
    contactPerson: false,
    contactNo: false,
    emailAddress: false,
    eventTitle: false,
    eventType: false,
    venueAddress: false,
    eventStartDate: false,
    eventEndDate: false,
    organizer: false,
    budgetAmount: false,
    budgetFrom: false,
    coreValuesIntegration: false,
    objectives: false,
    marketingCollaterals: false,
    pressRelease: false,
    others: false,
    eventFacilities: false,
    holdingArea: false,
    toilets: false,
    transportationandParking: false,
    more: false,
    houseKeeping: false,
    wasteManagement: false,
    eventManagementHead: false,
    eventCommitteesandMembers: false,
    health: false,
    safetyAttendees: false,
    emergencyFirstAid: false,
    fireSafety: false,
    weather: false
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [eventsPerDate, setEventsPerDate] = useState({});

  // Notification component
  const Notification = ({ message }) => (
    <div className="notification">
      {message}
    </div>
  );

  const validateField = (name, value) => {
    if (!value || value.trim() === '') {
      setFieldErrors(prev => ({ ...prev, [name]: true }));
      return false;
    }
    setFieldErrors(prev => ({ ...prev, [name]: false }));
    return true;
  };

  const validateAllFields = () => {
    const requiredFields = [
      'eventLocation', 'studentOrganization', 'contactPerson', 'contactNo', 'emailAddress',
      'eventTitle', 'eventType', 'venueAddress', 'eventStartDate', 'eventEndDate', 'organizer', 'budgetAmount', 'budgetFrom',
      'coreValuesIntegration', 'objectives', 'marketingCollaterals', 'pressRelease', 'others', 'eventFacilities', 'holdingArea', 'toilets',
       'transportationandParking', 'more', 'houseKeeping', 'wasteManagement','eventManagementHead', 'eventCommitteesandMembers', 'health', 'safetyAttendees', 
       'emergencyFirstAid', 'fireSafety', 'weather'
    ];
  
    let isValid = true;
  
    // Validate regular fields
    requiredFields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        setFieldErrors(prev => ({ ...prev, [field]: true }));
        isValid = false;
      }
    });
  
    // Special validation for organization forms
    if (formData.studentOrganization) {
      if (!formData.presidentName || !formData.presidentSignature) {
        alert("Organization information is incomplete - missing president details");
        isValid = false;
      }
    }
  
    return isValid;
  };

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
      organizationId: formData.studentOrganization?._id || formData.studentOrganization || "",
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
    const newData = {
      ...formData,
      organizationId: userData.role === 'Organization' ? userData._id || "" : "",
      studentOrganization: userData.role === 'Organization' ? userData.organizationName || "" : "",
      emailAddress: userData.email || "",
      applicationDate: new Date().toISOString().split('T')[0]
    };

    if (userData.role === 'Organization') {
      newData.presidentName = userData.presidentName || "";
      newData.presidentSignature = userData.presidentSignature || "";
    }

    setFormData(newData);
  }

  fetchFormData();
}, [formId, isEditMode, navigate]);

// Modify the fetchOccupiedDates function
const fetchOccupiedDates = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://studevent-server.vercel.app/api/calendar/event-counts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) throw new Error('Failed to fetch event counts');
    
    const data = await response.json();
    setEventsPerDate(data.eventCounts); // This should be { "YYYY-MM-DD": count }
  } catch (error) {
    console.error('Error fetching event counts:', error);
  }
};
useEffect(() => {
  fetchOccupiedDates();
}, []);

// Update the dayClassName function for visual feedback
const dayClassName = (date) => {
  const dateStr = moment(date).format('YYYY-MM-DD');
  const count = eventsPerDate[dateStr] || 0;

  if (count >= 3) return 'fully-booked-day';
  if (count >= 2) return 'approaching-limit-day';
  return '';
};


// Update the isOccupied function to check event counts
// 2. Simplify the isOccupied function to only check event counts
const isOccupied = (date) => {
  const dateStr = moment(date).format('YYYY-MM-DD');
  return (eventsPerDate[dateStr] || 0) >= 3; // Disable if 3 or more events
};

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
    // Validate the field when it changes
    if (type !== "checkbox") {
      validateField(name, value);
    }
  };
  
  const handleDateChange = (date, field) => {
    const isoDate = date.toISOString();
    console.log(`Date changed - ${field}:`, isoDate);
    setFormData(prev => ({
      ...prev,
      [field]: isoDate,
    }));
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
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return false;
      }
      
      // Handle empty strings or whitespace-only strings
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      
      // Handle numbers (including 0)
      if (typeof value === 'number') {
        return true; // Or you could add: return !isNaN(value);
      }
      
      // Handle Date objects and ISO date strings
      if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        return true;
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      // Handle objects (excluding Date)
      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        return Object.keys(value).length > 0;
      }
      
      // Fallback for other types (booleans, etc.)
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
        'more', 'houseKeeping', 'wasteManagement'
      ],
      ['eventManagementHead', 'eventCommitteesandMembers'],
      ['health', 'safetyAttendees', 'emergencyFirstAid', 'fireSafety', 'weather']
    ];
    return sections[step] || [];
  };

  console.log("Current form data:", formData);
  console.log("Validation errors:", fieldErrors);

  // Form submission
  const handleSubmit = async () => {
    

    if (!validateAllFields()) {
      alert("Please fill out all required fields");
      return;
    }

      // For organization forms, verify we have president info
  if (formData.studentOrganization && (!formData.presidentName || !formData.presidentSignature)) {
    alert("Organization information is incomplete - please refresh the page");
    return;
  }

    // Validate required fields
    const requiredFields = [
      'eventLocation', 'applicationDate', 'studentOrganization', 'contactPerson', 'contactNo', 'emailAddress', 
      'eventTitle', 'eventType', 'venueAddress', 'eventStartDate', 'eventEndDate', 'organizer', 'budgetAmount', 
      'budgetFrom', 'coreValuesIntegration', 'objectives', 'marketingCollaterals', 'pressRelease', 'others', 'eventFacilities', 
      'holdingArea', 'toilets', 'transportationandParking', 'more', 'houseKeeping', 'wasteManagement', 
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
      studentOrganization: formData.organizationId, // Send the ID instead of name
      eventStartDate: new Date(formData.eventStartDate),
      eventEndDate: new Date(formData.eventEndDate),
      applicationDate: new Date(formData.applicationDate),
      contactNo: Number(formData.contactNo),
      budgetAmount: Number(formData.budgetAmount),
      length: moment(formData.eventEndDate).diff(moment(formData.eventStartDate), 'hours'),
      presidentName: formData.presidentName,
      presidentSignature: formData.presidentSignature
    };

  // For organization forms, include president info
  if (formData.studentOrganization) {
    submissionData.presidentName = formData.presidentName;
    submissionData.presidentSignature = formData.presidentSignature;
    
    // Verify we have president info
    if (!submissionData.presidentName || !submissionData.presidentSignature) {
      alert("Organization information is incomplete - missing president details");
      return;
    }
  }


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
        navigate('/'); // Redirect to homepage
      }, 3000);

      // Reset form if new submission (preserve organization info)
    if (!isEditMode) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setFormData({
        // Reset all fields except organization info
        presidentName: userData?.presidentName || "",
        presidentSignature: userData?.presidentSignature || "",
        studentOrganization: userData?.organizationName || "",
        emailAddress: userData?.email || "",
        // Reset all other fields
        eventLocation: "",
        applicationDate: new Date().toISOString().split('T')[0],
        contactPerson: "",
        contactNo: "",
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
    console.error('Submission error:', error);
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
            <label className="required-field">Event Location:</label>
            <select 
              name="eventLocation" 
              value={formData.eventLocation} 
              onChange={handleChange}
              className={fieldErrors.eventLocation ? 'invalid-field' : ''}
            >
              <option value="">Select An Option...</option>
              <option value="On Campus">On Campus</option>
              <option value="Off Campus">Off Campus</option>
            </select>
            <div className="validation-error">
              Please select an event location
            </div>

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
            <label className="required-field">Student Organization:</label>
            <input
              type="text"
              name="studentOrganization"
              value={formData.studentOrganization}
              readOnly
              className={fieldErrors.studentOrganization ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Student organization is required
            </div>

            <label className="required-field">Contact Person:</label>
            <input 
              type="text" 
              name="contactPerson" 
              value={formData.contactPerson} 
              onChange={handleChange}
              className={fieldErrors.contactPerson ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please enter a contact person
            </div>

            <label className="required-field">Contact No:</label>
            <input 
              type="text" 
              name="contactNo" 
              value={formData.contactNo} 
              onChange={handleChange}
              className={fieldErrors.contactNo ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please enter a contact number
            </div>

            <label className="required-field">Email Address:</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              readOnly
              className={fieldErrors.emailAddress ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Email address is required
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <label className="required-field">Event Title:</label>
            <input 
              type="text" 
              name="eventTitle" 
              value={formData.eventTitle} 
              onChange={handleChange}
              className={fieldErrors.eventTitle ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please enter an event title
            </div>

            <label className="required-field">Event Type:</label>
            <select 
              name="eventType" 
              value={formData.eventType} 
              onChange={handleChange}
              className={fieldErrors.eventType ? 'invalid-field' : ''}
            >
              <option value="">Select An Option...</option>
              <option value="Student Organization Activity">Student Organization Activity</option>
              <option value="Special Event">Special Event</option>
              <option value="University/School Activity">University/School Activity</option>
              <option value="Other">Other</option>
            </select>
            <div className="validation-error">
              Please select an event type
            </div>

            <label className="required-field">Venue Address:</label>
            <input 
              type="text" 
              name="venueAddress" 
              value={formData.venueAddress} 
              onChange={handleChange}
              className={fieldErrors.venueAddress ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please enter a venue address
            </div>
            <p className="venue-note">
              Note: Venue availability is not automatically checked by this system. Please confirm 
              availability separately with the venue management before submission.
            </p>

            <label className="required-field">Event Start Date:</label>
            <DatePicker
              selected={formData.eventStartDate ? new Date(formData.eventStartDate) : null}
              onChange={(date) => handleDateChange(date, 'eventStartDate')}
              minDate={new Date()}
              filterDate={(date) => {
                const dateStr = moment(date).format('YYYY-MM-DD');
                return (eventsPerDate[dateStr] || 0) < 3;
              }}
              dayClassName={(date) => {
                const dateStr = moment(date).format('YYYY-MM-DD');
                const count = eventsPerDate[dateStr] || 0;
                
                if (count >= 3) return 'fully-booked-day';
                if (count >= 2) return 'approaching-limit-day';
                return '';
              }}
              dateFormat="MMMM d, yyyy h:mm aa"
              showTimeSelect
              timeFormat="h:mm aa"
              timeIntervals={15}
              timeCaption="Time"
              locale="en"
              placeholderText="Select start date and time"
              className={`date-picker-input ${fieldErrors.eventStartDate ? 'invalid-field' : ''}`}
              popperPlacement="bottom-start"
              disabledKeyboardNavigation
            />
            {fieldErrors.eventStartDate && (
              <div className="validation-error">
                {formData.eventStartDate && eventsPerDate[moment(formData.eventStartDate).format('YYYY-MM-DD')] >= 3 
                  ? 'This date has reached the maximum number of events (3)'
                  : 'Please select a valid start date'}
              </div>
            )}

            <label className="required-field">Event End Date:</label>
            <DatePicker
              selected={formData.eventEndDate ? new Date(formData.eventEndDate) : null}
              onChange={(date) => handleDateChange(date, 'eventEndDate')}
              minDate={formData.eventStartDate ? new Date(formData.eventStartDate) : new Date()}
              filterDate={(date) => {
                const dateStr = moment(date).format('YYYY-MM-DD');
                return (eventsPerDate[dateStr] || 0) < 3;
              }}
              dayClassName={(date) => {
                const dateStr = moment(date).format('YYYY-MM-DD');
                const count = eventsPerDate[dateStr] || 0;
                
                if (count >= 3) return 'fully-booked-day';
                if (count >= 2) return 'approaching-limit-day';
                return '';
              }}
              dateFormat="MMMM d, yyyy h:mm aa"
              showTimeSelect
              timeFormat="h:mm aa"
              timeIntervals={15}
              timeCaption="Time"
              locale="en"
              placeholderText="Select end date and time"
              className={`date-picker-input ${fieldErrors.eventEndDate ? 'invalid-field' : ''}`}
              popperPlacement="bottom-start"
              disabledKeyboardNavigation
            />
            {fieldErrors.eventEndDate && (
              <div className="validation-error">
                {formData.eventEndDate && eventsPerDate[moment(formData.eventEndDate).format('YYYY-MM-DD')] >= 3 
                  ? 'This date has reached the maximum number of events (3)'
                  : 'End date must be after start date'}
              </div>
            )}
            <label className="required-field">Organizer:</label>
            <input 
              type="text" 
              name="organizer" 
              value={formData.organizer} 
              onChange={handleChange}
              className={fieldErrors.organizer ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please enter an organizer
            </div>

            <label className="required-field">Budget Amount:</label>
            <input 
              type="number" 
              name="budgetAmount" 
              value={formData.budgetAmount} 
              onChange={handleChange}
              className={fieldErrors.budgetAmount ? 'invalid-field' : ''}
              min="0"
            />
            <div className="validation-error">
              Please enter a valid budget amount
            </div>

            <label className="required-field">Budget From:</label>
            <select 
              name="budgetFrom" 
              value={formData.budgetFrom} 
              onChange={handleChange}
              className={fieldErrors.budgetFrom ? 'invalid-field' : ''}
            >
              <option value="">Select An Option...</option>
              <option value="College/Department">College/Department</option>
              <option value="Org">Organization</option>
              <option value="SDAO">SDAO</option>
            </select>
            <div className="validation-error">
              Please select a budget source
            </div>
            <p className="venue-note">
              Note: Budget amount is not automatically approved by this system. Please confirm
              budget availability separately with the budget management before submission. It will be checked by the SDAO.
            </p>

            <label className="required-field">Core Values Integration:</label>
            <textarea 
              name="coreValuesIntegration" 
              value={formData.coreValuesIntegration} 
              onChange={handleChange}
              className={fieldErrors.coreValuesIntegration ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please describe the core values integration
            </div>

            <label className="required-field">Objectives:</label>
            <textarea 
              name="objectives" 
              value={formData.objectives} 
              onChange={handleChange}
              className={fieldErrors.objectives ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please enter the event objectives
            </div>

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
            
            <label>Housekeeping:</label>
            <input type="text" name="houseKeeping" value={formData.houseKeeping} onChange={handleChange} />
            
            <label>Waste Management:</label>
            <input type="text" name="wasteManagement" value={formData.wasteManagement} onChange={handleChange} />
          </div>
        );

      case 3:
        return (
          <div>
            <label className="required-field">Event Management Head:</label>
            <input type="text" name="eventManagementHead" value={formData.eventManagementHead} onChange={handleChange} className={fieldErrors.eventManagementHead ? 'invalid-field' : ''}/>
            <div className="validation-error">
              Please enter the event management head
            </div>

            <label className="required-field">Event Committees & Members:</label>
            <input type="text" name="eventCommitteesandMembers" value={formData.eventCommitteesandMembers} onChange={handleChange}className={fieldErrors.eventCommitteesandMembers ? 'invalid-field' : ''}/>
            <div className="validation-error">
              Please enter the event committees and members
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <label className="required-field">Health:</label>
            <textarea name="health" value={formData.health} onChange={handleChange}className={fieldErrors.health ? 'invalid-field' : ''}/>
            <div className="validation-error">
              Please describe health considerations
            </div>

            <label className="required-field">Safety of Attendees:</label>
            <textarea name="safetyAttendees" value={formData.safetyAttendees} onChange={handleChange} className={fieldErrors.safetyAttendees ? 'invalid-field' : ''}/>
            <div className="validation-error">
              Please describe safety measures
            </div>

            <label className="required-field">Emergency/First Aid:</label>
            <textarea name="emergencyFirstAid" value={formData.emergencyFirstAid} onChange={handleChange} className={fieldErrors.emergencyFirstAid ? 'invalid-field' : ''}/>
            <div className="validation-error">
              Please describe emergency procedures
            </div>

            <label className="required-field">Fire Safety:</label>
            <textarea name="fireSafety" 
              value={formData.fireSafety} 
              onChange={handleChange}
              className={fieldErrors.fireSafety ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please describe fire safety measures
            </div>

            <label className="required-field">Weather:</label>
            <textarea 
              name="weather" 
              value={formData.weather} 
              onChange={handleChange}
              className={fieldErrors.weather ? 'invalid-field' : ''}
            />
            <div className="validation-error">
              Please describe weather considerations
            </div>
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
