import React, { useState, useEffect, useCallback, useMemo } from "react";
import './LocalOff.css';
import { FaCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Localoffcampus = () => {
  const [formData, setFormData] = useState({
    formPhase: 'BEFORE',
    nameOfHei: "National University MOA",
    region: "NCR",
    address: "Coral Way, Pasay, Metro Manila",
    basicInformation: [{
      programName: "", 
      course: "", 
      destinationAndVenue: "", 
      inclusiveDates: "", 
      numberOfStudents: "", 
      listOfPersonnelIncharge: ""
    }],
    activitiesOffCampus: [{
      curriculumRequirement: { compliance: "", remarks: "" },
      destination: { compliance: "", remarks: "" },
      handbook: { compliance: "", remarks: "" },
      guardianConsent: { compliance: "", remarks: "" },
      personnelInCharge: { compliance: "", remarks: "" },
      firstAidKit: { compliance: "", remarks: "" },
      feesFunds: { compliance: "", remarks: "" },
      insurance: { compliance: "", remarks: "" },
      studentVehicles: { compliance: "", remarks: "" },
      lgusNgos: { compliance: "", remarks: "" },
      consultationAnnouncements: { compliance: "", remarks: "" },
    }],
    afterActivity: [{
      programs: "",
      destination: "",
      noOfStudents: "",
      noofHeiPersonnel: ""
    }],
    problemsEncountered: "",
    recommendation: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [formSent, setFormSent] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [isEditingAfter, setIsEditingAfter] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [shouldValidate, setShouldValidate] = useState(false);
  const [formPhase, setFormPhase] = useState('BEFORE');
  const [beforeSubmitted, setBeforeSubmitted] = useState(false);
  const [isBeforeApproved, setIsBeforeApproved] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [approvalCheckError, setApprovalCheckError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // can be 'error', 'warning', 'info', 'success'
  });

  // Field errors state
  const [fieldErrors, setFieldErrors] = useState({
    nameOfHei: false,
    region: false,
    address: false,
    basicInformation: [],
    activitiesOffCampus: [],
    afterActivity: [],
    problemsEncountered: false,
    recommendation: false
  });

  // Notification component
  const Notification = ({ message, type = 'error' }) => (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        {type === 'error' ? (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )}
        <span>{message}</span>
      </div>
    </div>
  );

  // Check if BEFORE form is complete
  const isBeforeComplete = useMemo(() => {
    return (
      formData.nameOfHei.trim() &&
      formData.region.trim() &&
      formData.address.trim() &&
      formData.basicInformation.every(info => (
        info.programName.trim() && 
        info.course.trim() && 
        info.destinationAndVenue.trim() && 
        info.inclusiveDates && 
        info.numberOfStudents && 
        info.listOfPersonnelIncharge.trim()
      )) &&
      Object.values(formData.activitiesOffCampus[0]).every(
        field => field.compliance
      )
    );
  }, [formData]);

  // Validation results
  const validationResults = useMemo(() => {
    const results = {
      nameOfHei: !!formData.nameOfHei.trim(),
      region: !!formData.region.trim(),
      address: !!formData.address.trim(),
      basicInformation: formData.basicInformation.map(info => ({
        programName: !!info.programName.trim(),
        course: !!info.course.trim(),
        destinationAndVenue: !!info.destinationAndVenue.trim(),
        inclusiveDates: !!info.inclusiveDates,
        numberOfStudents: !!info.numberOfStudents,
        listOfPersonnelIncharge: !!info.listOfPersonnelIncharge.trim()
      })),
      activitiesOffCampus: formData.activitiesOffCampus.map(activity => ({
        curriculumRequirement: !!activity.curriculumRequirement.compliance,
        destination: !!activity.destination.compliance,
        handbook: !!activity.handbook?.compliance,
        guardianConsent: !!activity.guardianConsent.compliance,
        personnelInCharge: !!activity.personnelInCharge.compliance,
        firstAidKit: !!activity.firstAidKit.compliance,
        feesFunds: !!activity.feesFunds.compliance,
        insurance: !!activity.insurance.compliance,
        studentVehicles: !!activity.studentVehicles.compliance,
        lgusNgos: !!activity.lgusNgos.compliance,
        consultationAnnouncements: !!activity.consultationAnnouncements.compliance
      })),
      afterActivity: formData.afterActivity.map(activity => ({
        programs: !!activity.programs.trim(),
        destination: !!activity.destination.trim(),
        noOfStudents: !!activity.noOfStudents,
        noofHeiPersonnel: !!activity.noofHeiPersonnel
      })),
      problemsEncountered: !!formData.problemsEncountered.trim(),
      recommendation: !!formData.recommendation.trim()
    };
    return results;
  }, [formData, validationTrigger]);

  // Set user data on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
    
    // Check if there's a submitted BEFORE form for this user
    checkForSubmittedBeforeForm();
  }, []);

  // Check if user has a submitted BEFORE form
  const checkForSubmittedBeforeForm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      const response = await fetch(
        'https://studevent-server.vercel.app/api/local-off-campus/check-before', 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setBeforeSubmitted(true);
          setEventId(data.eventId);
          setIsBeforeApproved(data.status === 'approved');
          // Don't automatically set formPhase to 'AFTER' here
        }
      }
    } catch (error) {
      console.error('Error checking for BEFORE form:', error);
    }
  };

  useEffect(() => {
    if (!beforeSubmitted || isBeforeApproved) return;
  
    const checkApprovalStatus = async () => {
      try {
        setIsCheckingApproval(true);
        const token = localStorage.getItem('token');
        const response = await fetch(
          `https://studevent-server.vercel.app/api/local-off-campus/${eventId}/status`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'approved') {
            setIsBeforeApproved(true);
            // Don't automatically switch to AFTER phase - let user do it via OrgSubmittedForms
          }
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
        setApprovalCheckError('Failed to check approval status');
      } finally {
        setIsCheckingApproval(false);
      }
    };
  
    // Initial check
    checkApprovalStatus();
    
    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkApprovalStatus, 30000);
    return () => clearInterval(interval);
  }, [beforeSubmitted, eventId, isBeforeApproved]);
  
  const startAfterForm = () => {
    if (isBeforeApproved) {
      setFormPhase('AFTER');
      setCurrentStep(3);
      // Preserve the existing BEFORE data when transitioning
      setFormData(prev => ({
        ...prev,
        formPhase: 'AFTER'
      }));
    }
};

  // Handle form field changes
  const handleChange = (e, index, fieldType) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {...prev};
      
      if (fieldType === 'basicInformation') {
        const updatedBasicInfo = [...newData.basicInformation];
        updatedBasicInfo[index][name] = type === "checkbox" ? checked : value;
        newData.basicInformation = updatedBasicInfo;
      } 
      else if (fieldType === 'activitiesOffCampus') {
        const updatedActivities = [...newData.activitiesOffCampus];
        updatedActivities[index][name] = type === "checkbox" ? checked : value;
        newData.activitiesOffCampus = updatedActivities;
      }
      else if (fieldType === 'afterActivity') {
        const updatedAfterActivity = [...newData.afterActivity];
        updatedAfterActivity[index][name] = type === "checkbox" ? checked : value;
        newData.afterActivity = updatedAfterActivity;
      }
      else {
        newData[name] = type === "checkbox" ? checked : value;
      }
      
      return newData;
    });
  };

  const COURSE_OPTIONS = [
    "Bachelor of Science in Dental Medicine",
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Business Administration",
    "Bachelor of Science in Accountancy",
    "Bachelor of Science in Tourism Management",
    "Bachelor of Science in Psychology",
    "Bachelor of Science in Nursing",
    "Bachelor of Science in Medical Technology",
    "Doctor Of Optometry",
    "Doctor Of Dental Medicine",
    "Doctor Hygiene Level IV",
    "Dental Technology NCIV"
  ];

  // Handle activity compliance changes
  const handleActivityChange = React.useCallback((section, field, value, remarks = "", index = 0) => {
    setFormData(prev => {
      const newData = {...prev};
      const updatedActivities = [...newData.activitiesOffCampus];
      
      if (section && field) {
        updatedActivities[index][section] = { 
          ...updatedActivities[index][section],
          [field]: field === 'compliance' ? value : remarks
        };
      } else {
        updatedActivities[index][field] = { 
          compliance: value, 
          remarks: remarks 
        };
      }
      
      return {
        ...newData,
        activitiesOffCampus: updatedActivities
      };
    });
  }, []);

  // Compliance row component
  const ComplianceRow = ({ 
    label, 
    value, 
    remarks, 
    onChange, 
    nested = false,
    indent = false,
    hasError = false
  }) => {
    // Create a local state for the remarks to prevent losing focus
    const [localRemarks, setLocalRemarks] = React.useState(remarks || "");
    
    // Update the parent state when localRemarks changes
    React.useEffect(() => {
      if (remarks !== localRemarks) {
        onChange(value, localRemarks);
      }
    }, [localRemarks]);
  
    // Update localRemarks when the parent remarks prop changes
    React.useEffect(() => {
      setLocalRemarks(remarks || "");
    }, [remarks]);
  
    return (
      <tr className={`compliance-row ${nested ? 'nested-row' : ''} ${indent ? 'indent-row' : ''} ${hasError ? 'compliance-error' : ''}`}>
        <td className="activity-label">
          {label}
          {hasError && <span className="required-asterisk">*</span>}
        </td>
        <td className="compliance-cell">
          <div className="compliance-options">
            <label>
              <input
                type="radio"
                name={`${label}-compliance`}
                checked={value === "yes"}
                onChange={() => onChange("yes", localRemarks)}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name={`${label}-compliance`}
                checked={value === "no"}
                onChange={() => onChange("no", localRemarks)}
              /> No
            </label>
          </div>
        </td>
        <td className="remarks-cell">
          <input
            type="text"
            value={localRemarks}
            onChange={(e) => setLocalRemarks(e.target.value)}
            placeholder="Enter remarks..."
          />
        </td>
      </tr>
    );
  };

  // Validate current section
  const validateSection = useCallback((step) => {
    let isValid = true;
    const newErrors = {
      nameOfHei: false,
      region: false,
      address: false,
      basicInformation: [],
      activitiesOffCampus: [],
      afterActivity: [],
      problemsEncountered: false,
      recommendation: false
    };
  
    if (formPhase === 'BEFORE') {
      if (step === 0) {
        // These fields are now always valid since they're pre-filled and read-only
        newErrors.nameOfHei = false;
        newErrors.region = false;
        newErrors.address = false;
        isValid = true; // This section is always valid now
      }
      else if (step === 1) {
        formData.basicInformation.forEach((info, index) => {
          newErrors.basicInformation[index] = {
            programName: !info.programName.trim(),
            course: !info.course.trim(),
            destinationAndVenue: !info.destinationAndVenue.trim(),
            inclusiveDates: !info.inclusiveDates,
            numberOfStudents: !info.numberOfStudents,
            listOfPersonnelIncharge: !info.listOfPersonnelIncharge.trim()
          };
    
          if (Object.values(newErrors.basicInformation[index]).some(error => error)) {
            isValid = false;
          }
        });
      }
      else if (step === 2) {
        const activity = formData.activitiesOffCampus[0];
        newErrors.activitiesOffCampus = [{
          curriculumRequirement: !activity.curriculumRequirement.compliance,
          destination: !activity.destination.compliance,
          handbook: !activity.handbook?.compliance,
          guardianConsent: !activity.guardianConsent.compliance,
          personnelInCharge: !activity.personnelInCharge.compliance,
          firstAidKit: !activity.firstAidKit.compliance,
          feesFunds: !activity.feesFunds.compliance,
          insurance: !activity.insurance.compliance,
          studentVehicles: !activity.studentVehicles.compliance,
          lgusNgos: !activity.lgusNgos.compliance,
          consultationAnnouncements: !activity.consultationAnnouncements.compliance
        }];
        isValid = !Object.values(newErrors.activitiesOffCampus[0]).some(error => error);
      }
    } else { // AFTER form validation
      if (step === 3) {
        formData.afterActivity.forEach((activity, index) => {
          newErrors.afterActivity[index] = {
            programs: !activity.programs.trim(),
            destination: !activity.destination.trim(),
            noOfStudents: !activity.noOfStudents,
            noofHeiPersonnel: !activity.noofHeiPersonnel
          };
          if (Object.values(newErrors.afterActivity[index]).some(error => error)) {
            isValid = false;
          }
        });
      }
      else if (step === 4) {
        newErrors.problemsEncountered = !formData.problemsEncountered.trim();
        isValid = !newErrors.problemsEncountered;
      }
      else if (step === 5) {
        newErrors.recommendation = !formData.recommendation.trim();
        isValid = !newErrors.recommendation;
      }
    }
  
    setFieldErrors(newErrors);
    return isValid;
  }, [formData, formPhase]);

  // Navigation handlers
  const handleNext = () => {
    setShouldValidate(true);
    setValidationTrigger(prev => prev + 1);
    
    const isValid = validateSection(currentStep);
    
    if (isValid) {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      Notification({
        visible: true,
        message: `Please complete all required fields in this section`,
        type: 'error'
      });
      setTimeout(() => Notification(prev => ({...prev, visible: false})), 3000);
    }
  };


  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Field error checker
  const getFieldError = (field, index = 0) => {
    if (!shouldValidate) return false;
    
    if (formPhase === 'BEFORE') {
      if (currentStep === 0) {
        return !validationResults[field];
      } else if (currentStep === 1) {
        return !validationResults.basicInformation[index][field];
      } else if (currentStep === 2) {
        return !validationResults.activitiesOffCampus[index][field];
      }
    } else { // AFTER form
      if (currentStep === 3) {
        return !validationResults.afterActivity[index][field];
      } else if (currentStep === 4) {
        return !validationResults.problemsEncountered;
      } else if (currentStep === 5) {
        return !validationResults.recommendation;
      }
    }
    return false;
  };

  // Add/remove basic info rows
  const addBasicInfoRow = () => {
    setFormData(prev => ({
      ...prev,
      basicInformation: [
        ...prev.basicInformation,
        {
          programName: "",
          course: "",
          destinationAndVenue: "",
          inclusiveDates: "",
          numberOfStudents: "",
          listOfPersonnelIncharge: ""
        }
      ]
    }));
  };
  
  const removeBasicInfoRow = (index) => {
    if (formData.basicInformation.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      basicInformation: prev.basicInformation.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) setUser(userData);

    // Check if coming from OrgSubmittedForms
    if (location.state) {
        if (location.state.startAfterForm) {
            // Starting new AFTER form for approved BEFORE form
            setEventId(location.state.beforeFormId);
            setIsBeforeApproved(true);
            setFormPhase('AFTER');
            setCurrentStep(3);
            setIsEditingAfter(false);
        } 
        else if (location.state.editAfterForm) {
            // Editing existing AFTER form
            const { formData, beforeFormId } = location.state;
            setEventId(beforeFormId);
            setIsBeforeApproved(true);
            setFormPhase('AFTER');
            setCurrentStep(3);
            setIsEditingAfter(true);
            
            // Only set AFTER phase data
            setFormData(prev => ({
                ...prev,
                afterActivity: formData.afterActivity || prev.afterActivity,
                problemsEncountered: formData.problemsEncountered || prev.problemsEncountered,
                recommendation: formData.recommendation || prev.recommendation,
                formPhase: 'AFTER'
            }));
        }
        else if (location.state.editBeforeForm) {
            // Editing BEFORE form
            const { formData } = location.state;
            setFormData(formData);
            setEventId(formData._id);
            setBeforeSubmitted(true);
            setIsBeforeApproved(formData.status === 'approved');
        }
    } else {
        checkForSubmittedBeforeForm();
    }
}, [location.state]);

  // Submit BEFORE form
  const handleSubmitBefore = async () => {
    const isValid = validateSection(2); // Validate Activities Off Campus
    
    if (isValid) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication token not found. Please log in again.');
          return;
        }
  
        const userData = JSON.parse(localStorage.getItem('user'));
    
        // Prepare the data in the correct format
        const submissionData = {
          localOffCampus: {
            ...formData,  // This should contain all the form fields
            formPhase: 'BEFORE',
            submittedBy: userData?._id
          }
        };
  
        const response = await fetch('https://studevent-server.vercel.app/api/local-off-campus/before', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),  // Send the properly formatted data
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || 'Submission failed'}`);
          return;
        }
  
        const result = await response.json();
        setEventId(result.eventId || result._id);  // Use eventId if available, fallback to _id
        setBeforeSubmitted(true);
        setFormPhase('AFTER');
        setCurrentStep(3);
        
        // Show success snackbar
        setSnackbar({
          open: true,
          message: 'BEFORE form submitted successfully!',
          severity: 'success'
        });
  
      } catch (error) {
        console.error('Error:', error);
        setSnackbar({
          open: true,
          message: `An error occurred while submitting the form: ${error.message}`,
          severity: 'error'
        });
      }
    } else {
      setNotificationVisible(true);
      setTimeout(() => setNotificationVisible(false), 3000);
    }
  };
  
  // Submit AFTER form
  const handleSubmitAfter = async () => {
    const isValid = validateSection(5);
    
    if (isValid) {
      try {
        const token = localStorage.getItem('token');
        const endpoint = isEditingAfter 
          ? `https://studevent-server.vercel.app/api/local-off-campus/${eventId}/update-after`
          : `https://studevent-server.vercel.app/api/local-off-campus/${eventId}/update-to-after`;

        const response = await fetch(endpoint, {
          method: isEditingAfter ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            afterActivity: formData.afterActivity,
            problemsEncountered: formData.problemsEncountered,
            recommendation: formData.recommendation,
            formPhase: 'AFTER' // Ensure phase is explicitly set
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Submission failed');
        }

        setFormSent(true);
        setSnackbar({
          open: true,
          message: 'AFTER report submitted successfully!',
          severity: 'success'
        });
        
        // Redirect to submitted forms after a brief delay
        setTimeout(() => {
          navigate('/org-submitted-forms');
        }, 1500);

      } catch (error) {
        console.error('Error:', error);
        setSnackbar({
          open: true,
          message: `Error submitting AFTER report: ${error.message}`,
          severity: 'error'
        });
      }
    }
};

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // School Information (BEFORE)
  return (
    <div>
      <h2>School Information</h2>
      <div>
        <label className={fieldErrors.nameOfHei ? 'required-field' : ''}>Name of HEI:</label>
        <input
          type="text"
          name="nameOfHei"
          value={formData.nameOfHei}
          onChange={(e) => handleChange(e)}
          className={fieldErrors.nameOfHei ? 'input-error' : ''}
          readOnly
        />
        {fieldErrors.nameOfHei && <div className="error-message">This field is required</div>}
      </div>
      <div>
        <label className={fieldErrors.region ? 'required-field' : ''}>Region:</label>
        <input
          type="text"
          name="region"
          value={formData.region}
          onChange={(e) => handleChange(e)}
          className={fieldErrors.region ? 'input-error' : ''}
          readOnly
        />
        {fieldErrors.region && <div className="error-message">This field is required</div>}
      </div>
      <div>
        <label className={fieldErrors.address ? 'required-field' : ''}>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={(e) => handleChange(e)}
          className={fieldErrors.address ? 'input-error' : ''}
          readOnly
        />
        {fieldErrors.address && <div className="error-message">This field is required</div>}
      </div>
    </div>
  );
  
  case 1: // Basic Information (BEFORE)
  return (
    <div>
      <h2>Basic Information</h2>
      <div className="table-container">
        <table className="basic-info-table">
          <thead>
            <tr>
              <th>Program Name</th>
              <th>Course</th>
              <th>Destination & Venue</th>
              <th>Inclusive Dates</th>
              <th>No. of Students</th>
              <th>Personnel In-Charge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="tbody-fields">
            {formData.basicInformation.map((info, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name="programName"
                    value={info.programName}
                    onChange={(e) => handleChange(e, index, 'basicInformation')}
                    className={fieldErrors.basicInformation[index]?.programName ? 'input-error' : ''}
                  />
                  {fieldErrors.basicInformation[index]?.programName && (
                    <div className="error-message">This field is required</div>
                  )}
                </td>
                <td>
                  <select
                    name="course"
                    value={info.course}
                    onChange={(e) => handleChange(e, index, 'basicInformation')}
                    className={fieldErrors.basicInformation[index]?.course ? 'input-error' : ''}
                  >
                    <option value="">Select a course</option>
                    {COURSE_OPTIONS.map((course, i) => (
                      <option key={i} value={course}>{course}</option>
                    ))}
                  </select>
                  {fieldErrors.basicInformation[index]?.course && (
                    <div className="error-message">This field is required</div>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    name="destinationAndVenue"
                    value={info.destinationAndVenue}
                    onChange={(e) => handleChange(e, index, 'basicInformation')}
                    className={fieldErrors.basicInformation[index]?.destinationAndVenue ? 'input-error' : ''}
                  />
                  {fieldErrors.basicInformation[index]?.destinationAndVenue && (
                    <div className="error-message">This field is required</div>
                  )}
                </td>
                <td>
                  <DatePicker
                    selected={info.inclusiveDates ? new Date(info.inclusiveDates) : null}
                    onChange={(date) => {
                      const updatedBasicInfo = [...formData.basicInformation];
                      updatedBasicInfo[index].inclusiveDates = date.toISOString();
                      setFormData({
                        ...formData,
                        basicInformation: updatedBasicInfo
                      });
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                    className={fieldErrors.basicInformation[index]?.inclusiveDates ? 'input-error' : ''}
                  />
                  {fieldErrors.basicInformation[index]?.inclusiveDates && (
                    <div className="error-message">This field is required</div>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    name="numberOfStudents"
                    value={info.numberOfStudents}
                    onChange={(e) => handleChange(e, index, 'basicInformation')}
                    className={fieldErrors.basicInformation[index]?.numberOfStudents ? 'input-error' : ''}
                  />
                  {fieldErrors.basicInformation[index]?.numberOfStudents && (
                    <div className="error-message">This field is required</div>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    name="listOfPersonnelIncharge"
                    value={info.listOfPersonnelIncharge}
                    onChange={(e) => handleChange(e, index, 'basicInformation')}
                    className={fieldErrors.basicInformation[index]?.listOfPersonnelIncharge ? 'input-error' : ''}
                  />
                  {fieldErrors.basicInformation[index]?.listOfPersonnelIncharge && (
                    <div className="error-message">This field is required</div>
                  )}
                </td>
                <td>
                  {formData.basicInformation.length > 1 && (
                    <button 
                      type="button"
                      className="remove-row-btn"
                      onClick={() => removeBasicInfoRow(index)}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="add-row-btn"
          onClick={addBasicInfoRow}
        >
          Add Row
        </button>
      </div>
    </div>
  );
  
      case 2: // Activities Off Campus (BEFORE)
        return (
          <div >
            <h2>Activities Off Campus Compliance</h2>
            <div className="compliance-table-container">
              <table className="compliance-table">
                <thead>
                  <tr>
                    <th>ACTIVITIES</th>
                    <th>COMPLIANCE</th>
                    <th>REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  <ComplianceRow
                    label="1. Curriculum Requirement"
                    value={formData.activitiesOffCampus[0].curriculumRequirement.compliance}
                    remarks={formData.activitiesOffCampus[0].curriculumRequirement.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'curriculumRequirement', compliance, remarks)
                    }
                    hasError={getFieldError('curriculumRequirement')}
                  />
      
                  <ComplianceRow
                    label="2. Destination"
                    value={formData.activitiesOffCampus[0].destination.compliance}
                    remarks={formData.activitiesOffCampus[0].destination.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'destination', compliance, remarks)
                    }
                    hasError={getFieldError('destination')}
                  />
      
                  <ComplianceRow
                    label="3. Handbook Or Manual"
                    value={formData.activitiesOffCampus[0].handbook.compliance}
                    remarks={formData.activitiesOffCampus[0].handbook.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'handbook', compliance, remarks)
                    }
                    hasError={getFieldError('handbook')}
                  />

                  <ComplianceRow
                    label="4. Consent of Parents/Guardians"
                    value={formData.activitiesOffCampus[0].guardianConsent.compliance}
                    remarks={formData.activitiesOffCampus[0].guardianConsent.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'guardianConsent', compliance, remarks)
                    }
                    hasError={getFieldError('guardianConsent')}
                  />
                  
                  <ComplianceRow
                    label="5. Personnel-In-Charge"
                    value={formData.activitiesOffCampus[0].personnelInCharge.compliance}
                    remarks={formData.activitiesOffCampus[0].personnelInCharge.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'personnelInCharge', compliance, remarks)
                    }
                    hasError={getFieldError('personnelInCharge')}
                  />
      
                  <ComplianceRow
                    label="6. First Aid Kit"
                    value={formData.activitiesOffCampus[0].firstAidKit.compliance}
                    remarks={formData.activitiesOffCampus[0].firstAidKit.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'firstAidKit', compliance, remarks)
                    }
                    hasError={getFieldError('firstAidKit')}
                  />
      
                  <ComplianceRow
                    label="7. Fees/Funds"
                    value={formData.activitiesOffCampus[0].feesFunds.compliance}
                    remarks={formData.activitiesOffCampus[0].feesFunds.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'feesFunds', compliance, remarks)
                    }
                    hasError={getFieldError('feesFunds')}
                  />
      
                  <ComplianceRow
                    label="8. Insurance"
                    value={formData.activitiesOffCampus[0].insurance.compliance}
                    remarks={formData.activitiesOffCampus[0].insurance.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'insurance', compliance, remarks)
                    }
                    hasError={getFieldError('insurance')}
                  />
      
                  <ComplianceRow
                    label="9. Student Vehicles"
                    value={formData.activitiesOffCampus[0].studentVehicles.compliance}
                    remarks={formData.activitiesOffCampus[0].studentVehicles.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'studentVehicles', compliance, remarks)
                    }
                    hasError={getFieldError('studentVehicles')}
                  />
      
                  <ComplianceRow
                    label="10. LGUs/NGOs"
                    value={formData.activitiesOffCampus[0].lgusNgos.compliance}
                    remarks={formData.activitiesOffCampus[0].lgusNgos.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'lgusNgos', compliance, remarks)
                    }
                    hasError={getFieldError('lgusNgos')}
                  />
      
                  <ComplianceRow
                    label="11. Consulations and Announcements"
                    value={formData.activitiesOffCampus[0].consultationAnnouncements.compliance}
                    remarks={formData.activitiesOffCampus[0].consultationAnnouncements.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'consultationAnnouncements', compliance, remarks)
                    }
                    hasError={getFieldError('consultationAnnouncements')}
                  />
                </tbody>
              </table>
            </div>
          </div>
        );

        case 3: // After Activity (AFTER)
        return (
          <div className={`after-phase-container ${formPhase === 'AFTER' ? 'active-phase' : 'disabled-phase'}`}>
            <div className="phase-header">
              <h2>After Activity Report</h2>
              {formPhase !== 'AFTER' && (
                <div className="phase-notice">
                  Complete and submit the BEFORE form to unlock this section
                </div>
              )}
            </div>
            
            {formPhase === 'AFTER' && (
              <div className="after-activity-content">
                {formData.afterActivity.map((activity, index) => (
                  <div key={index} className="after-activity-group">
                    <div className="form-group">
                      <label className={fieldErrors.afterActivity[index]?.programs ? 'required-field' : ''}>
                        Programs:
                      </label>
                      <input
                        type="text"
                        name="programs"
                        value={activity.programs}
                        onChange={(e) => handleChange(e, index, 'afterActivity')}
                        className={`form-input ${fieldErrors.afterActivity[index]?.programs ? 'input-error' : ''}`}
                        disabled={formPhase !== 'AFTER'}
                      />
                      {fieldErrors.afterActivity[index]?.programs && (
                        <div className="error-message">This field is required</div>
                      )}
                    </div>
        
                    <div className="form-group">
                      <label className={fieldErrors.afterActivity[index]?.destination ? 'required-field' : ''}>
                        Destination:
                      </label>
                      <input
                        type="text"
                        name="destination"
                        value={activity.destination}
                        onChange={(e) => handleChange(e, index, 'afterActivity')}
                        className={`form-input ${fieldErrors.afterActivity[index]?.destination ? 'input-error' : ''}`}
                        disabled={formPhase !== 'AFTER'}
                      />
                      {fieldErrors.afterActivity[index]?.destination && (
                        <div className="error-message">This field is required</div>
                      )}
                    </div>
        
                    <div className="form-group">
                      <label className={fieldErrors.afterActivity[index]?.noOfStudents ? 'required-field' : ''}>
                        Number of Students:
                      </label>
                      <input
                        type="number"
                        name="noOfStudents"
                        value={activity.noOfStudents}
                        onChange={(e) => handleChange(e, index, 'afterActivity')}
                        className={`form-input ${fieldErrors.afterActivity[index]?.noOfStudents ? 'input-error' : ''}`}
                        disabled={formPhase !== 'AFTER'}
                        min="0"
                      />
                      {fieldErrors.afterActivity[index]?.noOfStudents && (
                        <div className="error-message">This field is required</div>
                      )}
                    </div>
        
                    <div className="form-group">
                      <label className={fieldErrors.afterActivity[index]?.noofHeiPersonnel ? 'required-field' : ''}>
                        Number of HEI Personnel:
                      </label>
                      <input
                        type="number"
                        name="noofHeiPersonnel"
                        value={activity.noofHeiPersonnel}
                        onChange={(e) => handleChange(e, index, 'afterActivity')}
                        className={`form-input ${fieldErrors.afterActivity[index]?.noofHeiPersonnel ? 'input-error' : ''}`}
                        disabled={formPhase !== 'AFTER'}
                        min="0"
                      />
                      {fieldErrors.afterActivity[index]?.noofHeiPersonnel && (
                        <div className="error-message">This field is required</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
        case 4: // Problems Encountered (AFTER)
        return (
          <div className={`after-phase-container ${formPhase === 'AFTER' ? 'active-phase' : 'disabled-phase'}`}>
            <h2>Problems Encountered</h2>
            {formPhase === 'AFTER' ? (
              <div className="form-group">
                <label className={fieldErrors.problemsEncountered ? 'required-field' : ''}>
                  Describe any problems encountered:
                </label>
                <textarea
                  name="problemsEncountered"
                  value={formData.problemsEncountered}
                  onChange={(e) => handleChange(e)}
                  rows={5}
                  className={`form-textarea ${fieldErrors.problemsEncountered ? 'input-error' : ''}`}
                />
                {fieldErrors.problemsEncountered && (
                  <div className="error-message">This field is required</div>
                )}
              </div>
            ) : (
              <div className="phase-notice">
                Complete and submit the BEFORE form to unlock this section
              </div>
            )}
          </div>
        );
        
        case 5: // Recommendations (AFTER)
        return (
          <div className={`after-phase-container ${formPhase === 'AFTER' ? 'active-phase' : 'disabled-phase'}`}>
            <h2>Recommendations</h2>
            {formPhase === 'AFTER' ? (
              <div className="form-group">
                <label className={fieldErrors.recommendation ? 'required-field' : ''}>
                  Provide your recommendations:
                </label>
                <textarea
                  name="recommendation"
                  value={formData.recommendation}
                  onChange={(e) => handleChange(e)}
                  rows={5}
                  className={`form-textarea ${fieldErrors.recommendation ? 'input-error' : ''}`}
                />
                {fieldErrors.recommendation && (
                  <div className="error-message">This field is required</div>
                )}
              </div>
            ) : (
              <div className="phase-notice">
                Complete and submit the BEFORE form to unlock this section
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="form-ubox-4">
      {notificationVisible && !validateSection(currentStep) && (
        <Notification type="error" message="Please complete all required fields before proceeding" />
      )}
      
      <div className="sidebar">
        <ul>
          {/* BEFORE Sections - only show if in BEFORE phase */}
          {formPhase === 'BEFORE' && (
            <>
              <li className={`${currentStep === 0 ? 'active' : ''} ${beforeSubmitted ? 'completed-phase' : ''}`}>
                {validationResults.nameOfHei && validationResults.region && validationResults.address ? (
                  <FaCheck className="check-icon green" />
                ) : (
                  <span className="error-icon">!</span>
                )}
                School Information
              </li>
              
              <li className={`${currentStep === 1 ? 'active' : ''} ${beforeSubmitted ? 'completed-phase' : ''}`}>
                {validationResults.basicInformation.every(field => 
                  field.programName &&
                  field.course &&
                  field.destinationAndVenue &&
                  field.inclusiveDates &&
                  field.numberOfStudents &&
                  field.listOfPersonnelIncharge
                ) ? (
                  <FaCheck className="check-icon green" />
                ) : (
                  <span className="error-icon">!</span>
                )}
                Basic Information
              </li>
              
              <li className={`${currentStep === 2 ? 'active' : ''} ${beforeSubmitted ? 'completed-phase' : ''}`}>
                {Object.values(validationResults.activitiesOffCampus[0]).every(Boolean) ? (
                  <FaCheck className="check-icon green" />
                ) : (
                  <span className="error-icon">!</span>
                )}
                Activities Off Campus
              </li>
            </>
          )}
  
          {/* AFTER Sections - always show when in AFTER phase */}
          <li 
            className={`${currentStep === 3 ? 'active' : ''} ${formPhase === 'AFTER' ? 'active-phase' : ''}`}
            onClick={() => formPhase === 'AFTER' && setCurrentStep(3)}
          >
            {formPhase === 'AFTER' && validationResults.afterActivity[0]?.programs && 
              validationResults.afterActivity[0]?.destination && 
              validationResults.afterActivity[0]?.noOfStudents && 
              validationResults.afterActivity[0]?.noofHeiPersonnel ? (
              <FaCheck className="check-icon green" />
            ) : (
              formPhase === 'AFTER' && <span className="error-icon">!</span>
            )}
            After Activity Report
          </li>
          
          <li 
            className={`${currentStep === 4 ? 'active' : ''} ${formPhase === 'AFTER' ? 'active-phase' : ''}`}
            onClick={() => formPhase === 'AFTER' && setCurrentStep(4)}
          >
            {formPhase === 'AFTER' && validationResults.problemsEncountered ? (
              <FaCheck className="check-icon green" />
            ) : (
              formPhase === 'AFTER' && <span className="error-icon">!</span>
            )}
            Problems Encountered
          </li>
          
          <li 
            className={`${currentStep === 5 ? 'active' : ''} ${formPhase === 'AFTER' ? 'active-phase' : ''}`}
            onClick={() => formPhase === 'AFTER' && setCurrentStep(5)}
          >
            {formPhase === 'AFTER' && validationResults.recommendation ? (
              <FaCheck className="check-icon green" />
            ) : (
              formPhase === 'AFTER' && <span className="error-icon">!</span>
            )}
            Recommendations
          </li>
        </ul>
  
        {/* Approval Status Indicator */}
        {beforeSubmitted && (
          <div className="approval-status">
            {isCheckingApproval ? (
              <div className="loading-approval">Checking approval status...</div>
            ) : isBeforeApproved ? (
              <div className="approved-status">
                <FaCheck className="check-icon green" />
                <span>BEFORE Form Approved</span>
                {formPhase === 'BEFORE' && (
                  <button 
                    onClick={startAfterForm}
                    className="start-after-mini-btn"
                  >
                    Continue to AFTER
                  </button>
                )}
              </div>
            ) : (
              <div className="pending-approval">
                <span className="pending-icon">!</span>
                <span>Pending Approval</span>
              </div>
            )}
            {approvalCheckError && (
              <div className="approval-error">{approvalCheckError}</div>
            )}
          </div>
        )}
      </div>
      
      <div className="inner-forms-4">
        <h1>{formPhase === 'BEFORE' ? 'Local Off-Campus Proposal' : 'After Activity Report'}</h1>
        
        {/* AFTER Form Activation Prompt */}
        {!formSent && beforeSubmitted && isBeforeApproved && formPhase === 'BEFORE' && (
          <div className="after-form-prompt">
            <h2>Your BEFORE form has been approved!</h2>
            <p>You can now complete the AFTER activity report.</p>
            <button 
              onClick={startAfterForm}
              className="start-after-form-btn"
            >
              Continue to AFTER Report
            </button>
          </div>
        )}
        
        {renderStepContent()}
        
        <div className="form-navigation">
          {formPhase === 'BEFORE' ? (
            <>
              {currentStep > 0 && (
                <button onClick={handleBack}>Back</button>
              )}
              {currentStep < 2 && (
                <button onClick={handleNext}>Next</button>
              )}
              {currentStep === 2 && (
                <button onClick={handleSubmitBefore}>
                  {beforeSubmitted ? 'Update BEFORE Form' : 'Submit BEFORE Form'}
                </button>
              )}
            </>
          ) : (
            <>
              {currentStep > 3 && (
                <button onClick={handleBack}>Back</button>
              )}
              {currentStep < 5 && (
                <button onClick={handleNext}>Next</button>
              )}
              {currentStep === 5 && (
                <button 
                  onClick={handleSubmitAfter}
                  disabled={!isBeforeApproved}
                >
                  {isEditingAfter ? 'Update AFTER Report' : 'Submit AFTER Report'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Localoffcampus;