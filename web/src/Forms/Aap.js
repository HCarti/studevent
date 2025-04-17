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
    weather: "",
    attachedBudget: null, // ID of attached budget proposal
    budgetProposals: [], // List of available budgets for dropdown
    showBudgetModal: false // Control budget modal visibility
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
  const [validationErrorVisible, setValidationErrorVisible] = useState(false);
  const [submitSuccessVisible, setSubmitSuccessVisible] = useState(false);
  const [budgetLoadError, setBudgetLoadError] = useState(null);

  // Notification component
  const Notification = ({ message, type = "success" }) => {
    const bgColor = type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3";
    
    return (
      <div className="notification" style={{ backgroundColor: bgColor }}>
        <div className="notification-content">
          {type === "success" && <FaCheck style={{ marginRight: '8px' }} />}
          {message}
        </div>
      </div>
    );
  };

  const validateField = (name, value) => {
    let isValid = true;
    
    // Basic required validation
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      isValid = false;
    }
    
    // Special validations
    if (name === 'emailAddress' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(value);
    }
    
    if (name === 'contactNo' && value) {
      const phoneRegex = /^[0-9]{10,15}$/;
      isValid = phoneRegex.test(value);
    }
    
    if (name === 'budgetAmount' && value) {
      isValid = !isNaN(value) && Number(value) >= 0;
    }
    
    // Always show error state after validation
    setFieldErrors(prev => ({ ...prev, [name]: !isValid }));
    return isValid;
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


  // Add this custom save function in your component
// Simplified saveFormDraft function
const saveFormDraft = () => {
  try {
    const draftToSave = {
      ...formData,
      eventStartDate: formData.eventStartDate ? new Date(formData.eventStartDate).toISOString() : null,
      eventEndDate: formData.eventEndDate ? new Date(formData.eventEndDate).toISOString() : null,
      attachedBudget: formData.attachedBudget || null,
      budgetProposals: formData.budgetProposals.map(b => ({
        _id: b._id,
        eventTitle: b.eventTitle,
        grandTotal: b.grandTotal,
        nameOfRso: b.nameOfRso
      }))
    };
    
    localStorage.setItem('activityFormDraft', JSON.stringify(draftToSave));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

useEffect(() => {
  return () => {
    if (!formSent && !isEditMode && formData.eventTitle) {
      saveFormDraft();
    }
  };
}, [formData, formSent, isEditMode]);

useEffect(() => {
  if (location.state?.selectedBudget) {
    console.log("🏁 Returning from budget form with:", location.state);
    
    // 1. Retrieve from localStorage
    const savedData = localStorage.getItem('activityFormDraft');
    console.log("📦 Retrieved from localStorage:", savedData ? "Exists" : "Null");

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log("🔍 Parsed data:", parsedData);

        // 2. Update form state FIRST
        setFormData(prev => ({
          ...parsedData,
          attachedBudget: location.state.selectedBudget._id,
          budgetAmount: location.state.selectedBudget.grandTotal,
          budgetFrom: location.state.selectedBudget.nameOfRso,
          budgetProposals: [...prev.budgetProposals, location.state.selectedBudget],
          eventStartDate: parsedData.eventStartDate ? new Date(parsedData.eventStartDate) : null,
          eventEndDate: parsedData.eventEndDate ? new Date(parsedData.eventEndDate) : null
        }));

        // 3. Verify update before cleanup (optional)
        setTimeout(() => {
          console.log("✅ Form state updated, now cleaning localStorage");
          localStorage.removeItem('activityFormDraft');
        }, 100); // Small delay to ensure state update

      } catch (e) {
        console.error("❌ Parse error:", e);
      }
    }

    // 4. Always clear navigation state
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state]);

  const fetchBudgetProposals = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        throw new Error('User not authenticated');
      }
  
      // Build the URL based on user role
      let url = 'https://studevent-server.vercel.app/api/budgets';
      let queryParams = [];
      
      // Organization users see their own budgets
      if (user.role === 'Organization') {
        queryParams.push(`organization=${user._id}`);
      } 
      // Regular users see budgets they created
      else if (user.role !== 'Admin') {
        queryParams.push(`createdBy=${user._id}`);
      }
      
      // Only show active budgets by default
      queryParams.push('isActive=true');
      
      // Add status filter if needed (optional)
      // queryParams.push('status=submitted');
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
  
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        budgetProposals: data
      }));
  
      // If in edit mode and we have an attached budget, ensure it's in the list
      if (isEditMode && formData.attachedBudget) {
        const hasAttachedBudget = data.some(b => b._id === formData.attachedBudget);
        if (!hasAttachedBudget) {
          // Fetch the specific budget if it's not in the list
          fetchSingleBudget(formData.attachedBudget);
        }
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setBudgetLoadError(error.message || 'Failed to load budget proposals. Please try again later.');
    }
  };
  
  // Updated helper function to fetch a single budget
  const fetchSingleBudget = async (budgetId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://studevent-server.vercel.app/api/budgets/${budgetId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const budget = await response.json();
        setFormData(prev => ({
          ...prev,
          budgetProposals: [...prev.budgetProposals, budget]
        }));
      } else {
        throw new Error(`Failed to fetch budget: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching single budget:', error);
      // Optionally set an error state here if needed
    }
  };
  
  // Call this in useEffect when component mounts
  useEffect(() => {
    fetchBudgetProposals();
  }, []);


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

  const CustomAlert = ({ message, type = 'error', onClose }) => (
    <div className={`custom-alert ${type}`}>
      {type === 'success' ? <FaCheck /> : '⚠️'}
      <span>{message}</span>
      <button onClick={onClose} className="alert-close-btn">
        ×
      </button>
    </div>
  );

  // Form navigation
  const handleNext = () => {
    const requiredFields = getFieldsForStep(currentStep);
    let allValid = true;
    
    // Validate all fields in current step
    requiredFields.forEach(field => {
      const isValid = validateField(field, formData[field]);
      if (!isValid) allValid = false;
    });
  
    if (allValid) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show inline errors for all invalid fields
      requiredFields.forEach(field => {
        validateField(field, formData[field]);
      });
      // Scroll to the first invalid field
      const firstInvalidField = document.querySelector('.invalid-field');
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
      setValidationErrorVisible(true);
      setTimeout(() => setValidationErrorVisible(false), 3000);
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
      attachedBudget: formData.attachedBudget || undefined, // Send undefined instead of null
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
      
      setSubmitSuccessVisible(true);
      setTimeout(() => {
        setSubmitSuccessVisible(false);
        navigate('/');
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

const renderNavigationButtons = () => (
  <div className="form-navigation">
    {currentStep > 0 && (
      <button className="prev-btn" onClick={() => setCurrentStep(currentStep - 1)}>
        Back
      </button>
    )}
    {currentStep < 4 ? (
      <button className="next-btn" onClick={handleNext}>
        Next
      </button>
    ) : (
      renderSubmitButton()
    )}
  </div>
);

const renderSidebar = () => (
  <div className="sidebar">
    <ul>
      {['Event Specifics', 'Organization Info', 'Event Details', 'Event Management Team', 'Risk Assessments'].map((label, index) => (
        <li 
          key={index}
          className={currentStep === index ? 'active' : ''}
          onClick={() => isSectionComplete(index) && setCurrentStep(index)}
        >
          {isSectionComplete(index) && <FaCheck className="check-icon green" />}
          {label}
        </li>
      ))}
    </ul>
  </div>
);

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
            {fieldErrors.eventLocation && (
              <div className="validation-error">Please Pick A Event Location</div>
            )}

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

            <label className="required-field">Contact Person:</label>
            <input 
              type="text" 
              name="contactPerson" 
              value={formData.contactPerson} 
              onChange={handleChange}
              className={fieldErrors.contactPerson ? 'invalid-field' : ''}
            />
            {fieldErrors.contactPerson && (
              <div className="validation-error">Please enter a contact person</div>
            )}

            <label className="required-field">Contact No:</label>
            <input 
              type="text" 
              name="contactNo" 
              value={formData.contactNo} 
              onChange={handleChange}
              className={fieldErrors.contactNo ? 'invalid-field' : ''}
            />
            {fieldErrors.contactNo && (
              <div className="validation-error">Please enter a contact number</div>
            )}

            <label className="required-field">Email Address:</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              readOnly
              className={fieldErrors.emailAddress ? 'invalid-field' : ''}
            />
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
            {fieldErrors.eventTitle && (
              <div className="validation-error">Please enter a event title</div>
            )}

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
            {fieldErrors.eventType && (
              <div className="validation-error">Please Pick A Event Type</div>
            )}

            <label className="required-field">Venue Address:</label>
            <input 
              type="text" 
              name="venueAddress" 
              value={formData.venueAddress} 
              onChange={handleChange}
              className={fieldErrors.venueAddress ? 'invalid-field' : ''}
            />
            {fieldErrors.venueAddress && (
              <div className="validation-error">Please Enter A Venue Address</div>
            )}
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
            {fieldErrors.organizer && (
              <div className="validation-error">Please Enter A Organizer</div>
            )}

          <div className="budget-selection">
          <label className="required-field">Attached Budget Proposal:</label>
          <select
            name="attachedBudget"
            value={formData.attachedBudget || ''}
            onChange={(e) => {
              const budgetId = e.target.value;
              const selectedBudget = formData.budgetProposals.find(b => b._id === budgetId);
              
              setFormData(prev => ({
                ...prev,
                attachedBudget: budgetId,
                budgetAmount: selectedBudget?.grandTotal || '',
                budgetFrom: selectedBudget?.nameOfRso || 'Org',
                eventTitle: selectedBudget?.eventTitle || prev.eventTitle
              }));
            }}
            className={fieldErrors.attachedBudget ? 'invalid-field' : ''}
          >
            <option value="">Select a budget proposal...</option>
            {formData.budgetProposals.map(budget => (
              <option key={budget._id} value={budget._id}>
                {budget.eventTitle} - ₱{budget.grandTotal?.toLocaleString()}
                {budget.status ? ` (${budget.status})` : ''}
              </option>
            ))}
          </select>
          
          <button 
            type="button" 
            className="create-budget-btn"
            onClick={() => {
              // First, prepare the data for storage
              const dataToSave = {
                ...formData,
                // Ensure dates are properly serialized
                eventStartDate: formData.eventStartDate 
                  ? new Date(formData.eventStartDate).toISOString() 
                  : null,
                eventEndDate: formData.eventEndDate 
                  ? new Date(formData.eventEndDate).toISOString() 
                  : null,
                // Clean up complex objects
                budgetProposals: formData.budgetProposals.map(b => ({
                  _id: b._id,
                  eventTitle: b.eventTitle,
                  grandTotal: b.grandTotal,
                  nameOfRso: b.nameOfRso
                }))
              };

              // Save to localStorage immediately
              try {
                localStorage.setItem('activityFormDraft', JSON.stringify(dataToSave));
                console.log('Form data saved to localStorage:', dataToSave); // Debug log
              } catch (error) {
                console.error('Error saving to localStorage:', error);
              }

              // Then navigate to budget form
              navigate('/budget', { 
                state: { 
                  returnPath: location.pathname,
                  activityFormData: formData,
                  targetFormType: 'Activity',
                  targetFormId: formId || null
                } 
              });
            }}
          >
            + Create New Budget
          </button>
        </div>

        {budgetLoadError && (
          <div className="error-message">{budgetLoadError}</div>
        )}
            
            <label className="required-field">Budget Amount:</label>
            <input 
              type="number" 
              name="budgetAmount" 
              value={formData.budgetAmount} 
              onChange={handleChange}
              readOnly={!!formData.attachedBudget}
              className={fieldErrors.budgetAmount ? 'invalid-field' : ''}
              min="0"
            />
            
            <label className="required-field">Budget From:</label>
            <select 
              name="budgetFrom" 
              value={formData.budgetFrom} 
              onChange={handleChange}
              readOnly={!!formData.attachedBudget}
              className={fieldErrors.budgetFrom ? 'invalid-field' : ''}
            >
              <option value="">Select An Option...</option>
              <option value="College/Department">College/Department</option>
              <option value="Org">Organization</option>
              <option value="SDAO">SDAO</option>
            </select>
            
            <p className="venue-note">
              Note: Budget amount is not automatically approved by this system. Please confirm
              budget availability separately with the budget management before submission.
            </p>

            <label className="required-field">Core Values Integration:</label>
            <textarea 
              name="coreValuesIntegration" 
              value={formData.coreValuesIntegration} 
              onChange={handleChange}
              className={fieldErrors.coreValuesIntegration ? 'invalid-field' : ''}
            />
            {fieldErrors.coreValuesIntegration && (
              <div className="validation-error">Please fill out the field</div>
            )}

            <label className="required-field">Objectives:</label>
            <textarea 
              name="objectives" 
              value={formData.objectives} 
              onChange={handleChange}
              className={fieldErrors.objectives ? 'invalid-field' : ''}
            />
            {fieldErrors.objectives && (
              <div className="validation-error">Please fill out the field</div>
            )}

            <h3 className="communications">COMMUNICATIONS AND PROMOTIONS REQUIRED</h3>
            <label>Marketing Collaterals:</label>
            <input type="text" name="marketingCollaterals" value={formData.marketingCollaterals} onChange={handleChange} /> 
            {fieldErrors.marketingCollaterals && (
              <div className="validation-error">Please fill out the field</div>
            )}
            
            <label>Press Release:</label>
            <input type="text" name="pressRelease" value={formData.pressRelease} onChange={handleChange} />
            {fieldErrors.pressRelease && (
              <div className="validation-error">Please fill out the field</div>
            )}
            
            <label>Others:</label>
            <input type="text" name="others" value={formData.others} onChange={handleChange} />
            {fieldErrors.others && (
              <div className="validation-error">Please fill out the field</div>
            )}

            <h3>Facilities Considerations</h3>
            <label>Event Facilities:</label>
            <input type="text" name="eventFacilities" value={formData.eventFacilities} onChange={handleChange} />
            {fieldErrors.eventFacilities && (
              <div className="validation-error">Please fill out the field</div>
            )}
            
            <label>Holding Area:</label>
            <input type="text" name="holdingArea" value={formData.holdingArea} onChange={handleChange} />
            {fieldErrors.holdingArea && (
              <div className="validation-error">Please fill out the field</div>
            )}
            
            <label>Toilets:</label>
            <input type="text" name="toilets" value={formData.toilets} onChange={handleChange} />
            {fieldErrors.toilets && (
              <div className="validation-error">Please fill out the field</div>
            )}
            
            <label>Transportation & Parking:</label>
            <input type="text" name="transportationandParking" value={formData.transportationandParking} onChange={handleChange} />
            {fieldErrors.transportationandParking && (
              <div className="validation-error">Please fill out the field</div>
            )}
            
            <label>Other Facilities:</label>
            <input type="text" name="more" value={formData.more} onChange={handleChange} />
            {fieldErrors.more && (
              <div className="validation-error">Please fill out the field</div>
            )}
            
            <label>Housekeeping:</label>
            <input type="text" name="houseKeeping" value={formData.houseKeeping} onChange={handleChange} />
            {fieldErrors.houseKeeping && (
              <div className="validation-error">Please fill out the field</div>
            )}
            
            <label>Waste Management:</label>
            <input type="text" name="wasteManagement" value={formData.wasteManagement} onChange={handleChange} />
            {fieldErrors.wasteManagement && (
              <div className="validation-error">Please fill out the field</div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <label className="required-field">Event Management Head:</label>
            <input type="text" name="eventManagementHead" value={formData.eventManagementHead} onChange={handleChange} className={fieldErrors.eventManagementHead ? 'invalid-field' : ''}/>
            {fieldErrors.eventManagementHead && (
              <div className="validation-error">Please fill out the Event Management Head</div>
            )}

            <label className="required-field">Event Committees & Members:</label>
            <input type="text" name="eventCommitteesandMembers" value={formData.eventCommitteesandMembers} onChange={handleChange}className={fieldErrors.eventCommitteesandMembers ? 'invalid-field' : ''}/>
            {fieldErrors.eventCommitteesandMembers && (
              <div className="validation-error">Please Fill out the Event Committees & Members</div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <label className="required-field">Health:</label>
            <textarea name="health" value={formData.health} onChange={handleChange}className={fieldErrors.health ? 'invalid-field' : ''}/>
            {fieldErrors.health && (
              <div className="validation-error">Please fill out the field</div>
            )}

            <label className="required-field">Safety of Attendees:</label>
            <textarea name="safetyAttendees" value={formData.safetyAttendees} onChange={handleChange} className={fieldErrors.safetyAttendees ? 'invalid-field' : ''}/>
            {fieldErrors.safetyAttendees && (
              <div className="validation-error">Please fill out the field</div>
            )}

            <label className="required-field">Emergency/First Aid:</label>
            <textarea name="emergencyFirstAid" value={formData.emergencyFirstAid} onChange={handleChange} className={fieldErrors.emergencyFirstAid ? 'invalid-field' : ''}/>
            {fieldErrors.emergencyFirstAid && (
              <div className="validation-error">Please fill out the field</div>
            )}

            <label className="required-field">Fire Safety:</label>
            <textarea name="fireSafety" 
              value={formData.fireSafety} 
              onChange={handleChange}
              className={fieldErrors.fireSafety ? 'invalid-field' : ''}
            />
            {fieldErrors.fireSafety && (
              <div className="validation-error">Please fill out the field</div>
            )}

            <label className="required-field">Weather:</label>
            <textarea 
              name="weather" 
              value={formData.weather} 
              onChange={handleChange}
              className={fieldErrors.weather ? 'invalid-field' : ''}
            />
            {fieldErrors.weather && (
              <div className="validation-error">Please fill out the field</div>
            )}
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="form-ubox-1">
      {validationErrorVisible && (
        <CustomAlert 
          message="Please complete all required fields before proceeding." 
          onClose={() => setValidationErrorVisible(false)} 
        />
      )}
      {submitSuccessVisible && (
        <CustomAlert 
          message={`Form ${isEditMode ? 'updated' : 'submitted'} successfully!`}
          type="success"
          onClose={() => setSubmitSuccessVisible(false)} 
        />
      )}
      
      {renderSidebar()}
      
      <div className="inner-forms-1">
        {renderFormHeader()}
        {renderStepContent()}
        {renderNavigationButtons()}
      </div>
    </div>
  );
};

export default Aap; 
