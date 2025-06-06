import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './LocalOff.css';
import { FaCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Localoffcampus = () => {
  const location = useLocation(); // <-- Add this line at the top
  const initialFormData = {
    formPhase: 'BEFORE',
    nameOfHei: 'National University MOA',
    region: 'NCR',
    address: 'Coral Way, Pasay, Metro Manila',
    basicInformation: [
      {
        programName: '',
        course: '',
        destinationAndVenue: '',
        inclusiveDates: '',
        numberOfStudents: '',
        listOfPersonnelIncharge: ''
      }
    ],
    activitiesOffCampus: [
      {
        curriculumRequirement: { compliance: '', remarks: '' },
        destination: { compliance: '', remarks: '' },
        handbook: { compliance: '', remarks: '' },
        guardianConsent: { compliance: '', remarks: '' },
        personnelInCharge: { compliance: '', remarks: '' },
        firstAidKit: { compliance: '', remarks: '' },
        feesFunds: { compliance: '', remarks: '' },
        insurance: { compliance: '', remarks: '' },
        studentVehicles: { compliance: '', remarks: '' },
        lgusNgos: { compliance: '', remarks: '' },
        consultationAnnouncements: { compliance: '', remarks: '' }
      }
    ],
    afterActivity: [
      {
        programs: '',
        destination: '',
        noOfStudents: '',
        noofHeiPersonnel: ''
      }
    ],
    problemsEncountered: '',
    recommendation: ''
  };

  const [formData, setFormData] = useState(() => {
    const locState = location.state; // Check location.state first
    if (locState && (locState.startAfterForm || locState.editAfterForm || locState.editBeforeForm)) {
      return initialFormData; // Will be populated by useEffect based on location.state
    }
    const savedData = localStorage.getItem('localOffCampusFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Basic rehydration, specific date/array handling might be needed if issues arise
        return {
          ...initialFormData,
          ...parsed,
          // Example: ensure basicInformation is an array with at least one item
          basicInformation: (Array.isArray(parsed.basicInformation) && parsed.basicInformation.length > 0) 
                            ? parsed.basicInformation.map(info => ({...initialFormData.basicInformation[0], ...info})) 
                            : initialFormData.basicInformation,
          activitiesOffCampus: (Array.isArray(parsed.activitiesOffCampus) && parsed.activitiesOffCampus.length > 0)
                            ? parsed.activitiesOffCampus.map(act => ({...initialFormData.activitiesOffCampus[0], ...act}))
                            : initialFormData.activitiesOffCampus,
          afterActivity: (Array.isArray(parsed.afterActivity) && parsed.afterActivity.length > 0)
                            ? parsed.afterActivity.map(act => ({...initialFormData.afterActivity[0], ...act}))
                            : initialFormData.afterActivity,
        };
      } catch (e) {
        console.error("Error parsing LocalOffCampus localStorage data", e);
      }
    }
    return initialFormData;
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [formSent, setFormSent] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [isEditingAfter, setIsEditingAfter] = useState(false);
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
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
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
      formData.basicInformation.every(
        info =>
          info.programName.trim() &&
          info.course.trim() &&
          info.destinationAndVenue.trim() &&
          info.inclusiveDates &&
          info.numberOfStudents &&
          info.listOfPersonnelIncharge.trim()
      ) &&
      Object.values(formData.activitiesOffCampus[0]).every(field => field.compliance)
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
      if (!token) {
        console.log('No token found');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?._id) {
        console.log('No user ID found');
        return;
      }

      console.log('Checking for BEFORE form for user:', user._id);

      const response = await fetch(
        'https://studevent-server.vercel.app/api/local-off-campus/check-before',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Error checking BEFORE form:', error);
        return;
      }

      const data = await response.json();
      console.log('BEFORE form check response:', data);

      if (data.approved) {
        setBeforeSubmitted(true);
        setEventId(data.eventId);
        setIsBeforeApproved(true);
        console.log('Found approved BEFORE form:', data.eventId);
      } else {
        console.log('No approved BEFORE form found');
        setBeforeSubmitted(false);
        setIsBeforeApproved(false);
      }
    } catch (error) {
      console.error('Error checking for BEFORE form:', error);
      setSnackbar({
        open: true,
        message: 'Failed to check form status',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (!beforeSubmitted || isBeforeApproved) return;
  
    const checkApprovalStatus = async () => {
      try {
        setIsCheckingApproval(true);
        setApprovalCheckError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
  
        if (!eventId) {
          throw new Error('Event ID not available');
        }
  
        const response = await fetch(
          `https://studevent-server.vercel.app/api/local-off-campus/${eventId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
  
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
  
        const data = await response.json();
        
        // Update approval status
        const isApproved = data.status === 'approved';
        setIsBeforeApproved(isApproved);
        
        // If approved, automatically switch to AFTER phase
        if (isApproved) {
          setFormPhase('AFTER');
          // If currently on BEFORE phase steps, move to first AFTER step
          if (currentStep < 3) {
            setCurrentStep(3);
          }
        }
  
      } catch (error) {
        console.error('Error checking approval status:', error);
        setApprovalCheckError(error.message);
      } finally {
        setIsCheckingApproval(false);
      }
    };
  
    // Initial check
    checkApprovalStatus();
    
    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkApprovalStatus, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [beforeSubmitted, eventId, isBeforeApproved, currentStep]);
  
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
      const newData = { ...prev };

      if (fieldType === 'basicInformation') {
        const updatedBasicInfo = [...newData.basicInformation];
        updatedBasicInfo[index][name] = type === 'checkbox' ? checked : value;
        newData.basicInformation = updatedBasicInfo;
      } else if (fieldType === 'activitiesOffCampus') {
        const updatedActivities = [...newData.activitiesOffCampus];
        updatedActivities[index][name] = type === 'checkbox' ? checked : value;
        newData.activitiesOffCampus = updatedActivities;
      } else if (fieldType === 'afterActivity') {
        const updatedAfterActivity = [...newData.afterActivity];
        updatedAfterActivity[index][name] = type === 'checkbox' ? checked : value;
        newData.afterActivity = updatedAfterActivity;
      } else {
        newData[name] = type === 'checkbox' ? checked : value;
      }

      return newData;
    });
  };

  const COURSE_OPTIONS = [
    'Bachelor of Science in Dental Medicine',
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Accountancy',
    'Bachelor of Science in Tourism Management',
    'Bachelor of Science in Psychology',
    'Bachelor of Science in Nursing',
    'Bachelor of Science in Medical Technology',
    'Doctor Of Optometry',
    'Doctor Of Dental Medicine',
    'Doctor Hygiene Level IV',
    'Dental Technology NCIV'
  ];

  // Handle activity compliance changes
  const handleActivityChange = React.useCallback(
    (section, field, value, remarks = '', index = 0) => {
      setFormData(prev => {
        const newData = { ...prev };
        const updatedActivities = [...newData.activitiesOffCampus];

        if (section && field) {
          updatedActivities[index][section] = {
            ...updatedActivities[index][section],
            [field]: field === 'compliance' ? value : remarks
          };
        } else {
          // This handles the case where section is null (legacy calls)
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
    },
    []
  );

  // Compliance row component
  const StableRemarksInput = React.memo(
    ({ value, onChange, inputRef }) => {
      return (
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={onChange}
          placeholder="Enter remarks..."
        />
      );
    },
    (prevProps, nextProps) => prevProps.value === nextProps.value
  );
  
  const StableRemarksCell = ({ remarks, onChange }) => {
    const inputRef = useRef(null);
    
    // This ensures we maintain focus even during rapid updates
    const [localValue, setLocalValue] = useState(remarks || '');
    const [isFocused, setIsFocused] = useState(false);
  
    // Sync with parent value
    useEffect(() => {
      if (!isFocused) {
        setLocalValue(remarks || '');
      }
    }, [remarks, isFocused]);
  
    const handleChange = (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };
  
    const handleFocus = () => {
      setIsFocused(true);
    };
  
    const handleBlur = () => {
      setIsFocused(false);
      onChange(localValue); // Final update on blur
    };
  
    // Maintain focus on the input
    useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocused, remarks]);
  
    return (
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Enter remarks..."
      />
    );
  };
  
  const ComplianceRow = React.memo(({ label, value, remarks, onChange, hasError }) => {
    const inputRef = useRef(null);
    const [localRemarks, setLocalRemarks] = useState(remarks || '');
  
    // Handle focus preservation
    useEffect(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        const { selectionStart, selectionEnd } = inputRef.current;
        requestAnimationFrame(() => {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(selectionStart, selectionEnd);
        });
      }
    }, [remarks]); // Only run when remarks prop changes
  
    const handleComplianceChange = (newValue) => {
      onChange(newValue, localRemarks);
    };
  
    const handleRemarksChange = (e) => {
      const newRemarks = e.target.value;
      setLocalRemarks(newRemarks);
      onChange(value, newRemarks);
    };
  
    return (
      <tr className={`compliance-row ${hasError ? 'compliance-error' : ''}`}>
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
                checked={value === 'yes'}
                onChange={() => handleComplianceChange('yes')}
              />{' '}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`${label}-compliance`}
                checked={value === 'no'}
                onChange={() => handleComplianceChange('no')}
              />{' '}
              No
            </label>
          </div>
        </td>
        <td className="remarks-cell">
          <input
            ref={inputRef}
            type="text"
            value={localRemarks}
            onChange={handleRemarksChange}
            placeholder="Enter remarks..."
          />
        </td>
      </tr>
    );
  }, (prevProps, nextProps) => {
    return (
      prevProps.label === nextProps.label &&
      prevProps.value === nextProps.value &&
      prevProps.remarks === nextProps.remarks &&
      prevProps.hasError === nextProps.hasError
    );
  });
  // Validate current section
  const validateSection = useCallback(
    step => {
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
        } else if (step === 1) {
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
        } else if (step === 2) {
          const activity = formData.activitiesOffCampus[0];
          newErrors.activitiesOffCampus = [
            {
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
            }
          ];
          isValid = !Object.values(newErrors.activitiesOffCampus[0]).some(error => error);
        }
      } else {
        // AFTER form validation
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
        } else if (step === 4) {
          newErrors.problemsEncountered = !formData.problemsEncountered.trim();
          isValid = !newErrors.problemsEncountered;
        } else if (step === 5) {
          newErrors.recommendation = !formData.recommendation.trim();
          isValid = !newErrors.recommendation;
        }
      }

      setFieldErrors(newErrors);
      return isValid;
    },
    [formData, formPhase]
  );

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
      setTimeout(() => Notification(prev => ({ ...prev, visible: false })), 3000);
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
    } else {
      // AFTER form
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
          programName: '',
          course: '',
          destinationAndVenue: '',
          inclusiveDates: '',
          numberOfStudents: '',
          listOfPersonnelIncharge: ''
        }
      ]
    }));
  };

  const removeBasicInfoRow = index => {
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
      } else if (location.state.editAfterForm) {
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
      } else if (location.state.editBeforeForm) {
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
            ...formData, // This should contain all the form fields
            formPhase: 'BEFORE',
            submittedBy: userData?._id
          }
        };
  
        const response = await fetch(
          'https://studevent-server.vercel.app/api/local-off-campus/before',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(submissionData) // Send the properly formatted data
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || 'Submission failed'}`);
          return;
        }
  
        const result = await response.json();
        setEventId(result.eventId || result._id); // Use eventId if available, fallback to _id
        setBeforeSubmitted(true);
        setFormPhase('AFTER');
        setCurrentStep(3);
  
        // Show success snackbar
        setSnackbar({
          open: true,
          message: 'BEFORE form submitted successfully!',
          severity: 'success'
        });
  
        // Clear localStorage as the BEFORE phase is complete
        localStorage.removeItem('localOffCampusFormData');

        // Redirect to organization's submitted forms page after a delay
        setTimeout(() => {
          navigate('/forms');
        }, 1000);
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
      setTimeout(() => setNotificationVisible(false), 1000);
    }
  };

  // Submit AFTER form
  const handleSubmitAfter = async () => {
    const isValid = validateSection(5);

    if (isValid) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        // 1. Verify BEFORE form is approved
        console.log('Checking BEFORE form approval status for eventId:', eventId);
        const approvalCheck = await fetch(
          `https://studevent-server.vercel.app/api/local-off-campus/${eventId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!approvalCheck.ok) {
          throw new Error('Failed to verify BEFORE form approval status');
        }

        const approvalData = await approvalCheck.json();
        console.log('Approval status response:', approvalData);

        if (approvalData.status !== 'approved') {
          throw new Error('BEFORE form must be approved before submitting AFTER report');
        }

        // 2. Prepare the request data
        const requestData = {
          localOffCampus: {
            afterActivity: formData.afterActivity.map(activity => ({
              programs: activity.programs,
              destination: activity.destination,
              noOfStudents: activity.noOfStudents,
              noofHeiPersonnel: activity.noofHeiPersonnel
            })),
            problemsEncountered: formData.problemsEncountered,
            recommendation: formData.recommendation
          },
          formPhase: 'AFTER'
        };

        console.log('Submitting AFTER report with:', requestData);

        // 3. Submit AFTER report
        const response = await fetch(
          `https://studevent-server.vercel.app/api/local-off-campus/${eventId}/update-to-after`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'AFTER report submission failed');
        }

        // Success handling
        setFormSent(true);
        setSnackbar({
          open: true,
          message: 'AFTER report submitted successfully!',
          severity: 'success'
        });

        // Clear localStorage as the AFTER phase is complete
        localStorage.removeItem('localOffCampusFormData');

        setTimeout(() => navigate('/org-submitted-forms'), 1500);
      } catch (error) {
        console.error('AFTER submission error:', error);
        setSnackbar({
          open: true,
          message: error.message.includes('BEFORE form must be approved')
            ? 'Please ensure the BEFORE form is approved first'
            : `Error: ${error.message}`,
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
                onChange={e => handleChange(e)}
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
                onChange={e => handleChange(e)}
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
                onChange={e => handleChange(e)}
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
                          onChange={e => handleChange(e, index, 'basicInformation')}
                          className={
                            fieldErrors.basicInformation[index]?.programName ? 'input-error' : ''
                          }
                        />
                        {fieldErrors.basicInformation[index]?.programName && (
                          <div className="error-message">This field is required</div>
                        )}
                      </td>
                      <td>
                        <select
                          name="course"
                          value={info.course}
                          onChange={e => handleChange(e, index, 'basicInformation')}
                          className={
                            fieldErrors.basicInformation[index]?.course ? 'input-error' : ''
                          }
                        >
                          <option value="">Select a course</option>
                          {COURSE_OPTIONS.map((course, i) => (
                            <option key={i} value={course}>
                              {course}
                            </option>
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
                          onChange={e => handleChange(e, index, 'basicInformation')}
                          className={
                            fieldErrors.basicInformation[index]?.destinationAndVenue
                              ? 'input-error'
                              : ''
                          }
                        />
                        {fieldErrors.basicInformation[index]?.destinationAndVenue && (
                          <div className="error-message">This field is required</div>
                        )}
                      </td>
                      <td>
                        <DatePicker
                          selected={info.inclusiveDates ? new Date(info.inclusiveDates) : null}
                          onChange={date => {
                            const updatedBasicInfo = [...formData.basicInformation];
                            updatedBasicInfo[index].inclusiveDates = date.toISOString();
                            setFormData({
                              ...formData,
                              basicInformation: updatedBasicInfo
                            });
                          }}
                          dateFormat="yyyy-MM-dd"
                          minDate={new Date()}
                          className={
                            fieldErrors.basicInformation[index]?.inclusiveDates ? 'input-error' : ''
                          }
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
                          onChange={e => handleChange(e, index, 'basicInformation')}
                          className={
                            fieldErrors.basicInformation[index]?.numberOfStudents
                              ? 'input-error'
                              : ''
                          }
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
                          onChange={e => handleChange(e, index, 'basicInformation')}
                          className={
                            fieldErrors.basicInformation[index]?.listOfPersonnelIncharge
                              ? 'input-error'
                              : ''
                          }
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
              <button type="button" className="add-row-btn" onClick={addBasicInfoRow}>
                Add Row
              </button>
            </div>
          </div>
        );

      case 2: // Activities Off Campus (BEFORE)
        return (
          <div>
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
    <div className={`after-phase-container ${
      isBeforeApproved ? 'active-phase' : 'disabled-phase'
    }`}>
      <div className="phase-header">
        <h2>After Activity Report</h2>
        {!isBeforeApproved && (
          <div className="phase-notice">
            <div className="lock-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 3a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v2h4V7a2 2 0 0 0-2-2zm-1 8v2h2v-2h-2z"/>
              </svg>
            </div>
            {beforeSubmitted 
              ? 'Waiting for BEFORE form approval...' 
              : 'Complete and submit the BEFORE form first'}
          </div>
        )}
      </div>

      {isBeforeApproved && (
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
                  onChange={e => handleChange(e, index, 'afterActivity')}
                  className={`form-input ${
                    fieldErrors.afterActivity[index]?.programs ? 'input-error' : ''
                  }`}
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
                  onChange={e => handleChange(e, index, 'afterActivity')}
                  className={`form-input ${
                    fieldErrors.afterActivity[index]?.destination ? 'input-error' : ''
                  }`}
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
                  onChange={e => handleChange(e, index, 'afterActivity')}
                  className={`form-input ${
                    fieldErrors.afterActivity[index]?.noOfStudents ? 'input-error' : ''
                  }`}
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
                  onChange={e => handleChange(e, index, 'afterActivity')}
                  className={`form-input ${
                    fieldErrors.afterActivity[index]?.noofHeiPersonnel ? 'input-error' : ''
                  }`}
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
    <div className={`after-phase-container ${
      isBeforeApproved ? 'active-phase' : 'disabled-phase'
    }`}>
      <div className="phase-header">
        <h2>Problems Encountered</h2>
        {!isBeforeApproved && (
          <div className="phase-notice">
            <div className="lock-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 3a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v2h4V7a2 2 0 0 0-2-2zm-1 8v2h2v-2h-2z"/>
              </svg>
            </div>
            {beforeSubmitted 
              ? 'Waiting for BEFORE form approval...' 
              : 'Complete and submit the BEFORE form first'}
          </div>
        )}
      </div>

      {isBeforeApproved && (
        <div className="form-group">
          <label className={fieldErrors.problemsEncountered ? 'required-field' : ''}>
            Describe any problems encountered:
          </label>
          <textarea
            name="problemsEncountered"
            value={formData.problemsEncountered}
            onChange={e => handleChange(e)}
            rows={5}
            className={`form-textarea ${
              fieldErrors.problemsEncountered ? 'input-error' : ''
            }`}
          />
          {fieldErrors.problemsEncountered && (
            <div className="error-message">This field is required</div>
          )}
        </div>
      )}
    </div>
  );

case 5: // Recommendations (AFTER)
  return (
    <div className={`after-phase-container ${
      isBeforeApproved ? 'active-phase' : 'disabled-phase'
    }`}>
      <div className="phase-header">
        <h2>Recommendations</h2>
        {!isBeforeApproved && (
          <div className="phase-notice">
            <div className="lock-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 3a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v2h4V7a2 2 0 0 0-2-2zm-1 8v2h2v-2h-2z"/>
              </svg>
            </div>
            {beforeSubmitted 
              ? 'Waiting for BEFORE form approval...' 
              : 'Complete and submit the BEFORE form first'}
          </div>
        )}
      </div>

      {isBeforeApproved && (
        <div className="form-group">
          <label className={fieldErrors.recommendation ? 'required-field' : ''}>
            Provide your recommendations:
          </label>
          <textarea
            name="recommendation"
            value={formData.recommendation}
            onChange={e => handleChange(e)}
            rows={5}
            className={`form-textarea ${fieldErrors.recommendation ? 'input-error' : ''}`}
          />
          {fieldErrors.recommendation && (
            <div className="error-message">This field is required</div>
          )}
        </div>
      )}
    </div>
  );

default:
  return <div>Unknown step</div>;
      }
    };

  // Add ref for the mobile step tracker
  const mobileStepTrackerRef = useRef(null);

  // Effect to scroll to the active step when current step changes
  useEffect(() => {
    if (mobileStepTrackerRef.current) {
      const activeElement = mobileStepTrackerRef.current.querySelector('.step-item.active');
      if (activeElement) {
        const containerWidth = mobileStepTrackerRef.current.offsetWidth;
        const activeElementLeft = activeElement.offsetLeft;
        const activeElementWidth = activeElement.offsetWidth;

        const scrollPosition = activeElementLeft - containerWidth / 2 + activeElementWidth / 2;
        mobileStepTrackerRef.current.scrollLeft = scrollPosition;
      }
    }
  }, [currentStep]);

  // Mobile step tracker component
  const renderMobileStepTracker = () => {
    let sectionNames = [];

    // Determine which sections to show based on form phase
    if (formPhase === 'BEFORE') {
      sectionNames = ['School Information', 'Basic Information', 'Activities Off Campus'];
    } else {
      sectionNames = ['After Activity Report', 'Problems Encountered', 'Recommendations'];
    }

    // Calculate progress width based on current step and total steps
    const maxStep = formPhase === 'BEFORE' ? 2 : 5;
    const minStep = formPhase === 'BEFORE' ? 0 : 3;
    const currentProgress = formPhase === 'BEFORE' ? currentStep : currentStep - 3;
    const totalSteps = formPhase === 'BEFORE' ? 2 : 2;

    const progressWidth = `${(currentProgress / totalSteps) * 100}%`;

    return (
      <div className="mobile-step-tracker" ref={mobileStepTrackerRef}>
        <div className="steps">
          <div className="progress-line"></div>
          <div className="progress-line-filled" style={{ width: progressWidth }}></div>

          {sectionNames.map((label, index) => {
            // Calculate the actual step number
            const stepIndex = formPhase === 'BEFORE' ? index : index + 3;

            // Determine completion and active states
            const isActive = currentStep === stepIndex;
            let isCompleted = false;

            if (formPhase === 'BEFORE') {
              if (index === 0) {
                isCompleted =
                  validationResults.nameOfHei &&
                  validationResults.region &&
                  validationResults.address;
              } else if (index === 1) {
                isCompleted = validationResults.basicInformation.every(
                  field =>
                    field.programName &&
                    field.course &&
                    field.destinationAndVenue &&
                    field.inclusiveDates &&
                    field.numberOfStudents &&
                    field.listOfPersonnelIncharge
                );
              } else if (index === 2) {
                isCompleted = Object.values(validationResults.activitiesOffCampus[0]).every(
                  Boolean
                );
              }
            } else {
              if (index === 0) {
                isCompleted =
                  validationResults.afterActivity[0]?.programs &&
                  validationResults.afterActivity[0]?.destination &&
                  validationResults.afterActivity[0]?.noOfStudents &&
                  validationResults.afterActivity[0]?.noofHeiPersonnel;
              } else if (index === 1) {
                isCompleted = validationResults.problemsEncountered;
              } else if (index === 2) {
                isCompleted = validationResults.recommendation;
              }
            }

            return (
              <div
                key={index}
                className={`step-item ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
                onClick={() => {
                  // Only allow navigation to this step if in the right form phase
                  if (
                    (formPhase === 'BEFORE' && stepIndex <= 2) ||
                    (formPhase === 'AFTER' && stepIndex >= 3)
                  ) {
                    setCurrentStep(stepIndex);
                  }
                }}
              >
                <div className="step-number">
                  {isCompleted ? <FaCheck /> : formPhase === 'BEFORE' ? index + 1 : index + 1}
                </div>
                <div className="step-label">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Save formData to localStorage
  useEffect(() => {
    // Avoid saving initial/empty state when specific loading conditions are met
    // (e.g., when location.state is being processed or approval is being checked)
    if (location.state || isCheckingApproval) {
        // If location.state is present, specific useEffects will set formData.
        // If approval is being checked, wait for it to complete.
        // This prevents overwriting fetched/intended state with potentially stale localStorage state too early.
    } else {
        localStorage.setItem('localOffCampusFormData', JSON.stringify(formData));
    }
  }, [formData, location.state, isCheckingApproval]);

  return (
    <div className="form-ubox-4">
      {notificationVisible && !validateSection(currentStep) && (
        <Notification
          type="error"
          message="Please complete all required fields before proceeding"
        />
      )}

      <div className="sidebar">
        <ul>
          {/* BEFORE Sections - only show if in BEFORE phase */}
          {formPhase === 'BEFORE' && (
            <>
              <li
                className={`${currentStep === 0 ? 'active' : ''} ${
                  beforeSubmitted ? 'completed-phase' : ''
                }`}
              >
                {validationResults.nameOfHei &&
                validationResults.region &&
                validationResults.address ? (
                  <FaCheck className="check-icon green" />
                ) : (
                  <span className="error-icon">!</span>
                )}
                School Information
              </li>

              <li
                className={`${currentStep === 1 ? 'active' : ''} ${
                  beforeSubmitted ? 'completed-phase' : ''
                }`}
              >
                {validationResults.basicInformation.every(
                  field =>
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

              <li
                className={`${currentStep === 2 ? 'active' : ''} ${
                  beforeSubmitted ? 'completed-phase' : ''
                }`}
              >
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
            className={`${currentStep === 3 ? 'active' : ''} ${
              formPhase === 'AFTER' ? 'active-phase' : 'disabled-phase'
            }`}
            onClick={() => formPhase === 'AFTER' && setCurrentStep(3)}
          >
            {formPhase === 'AFTER' &&
            validationResults.afterActivity[0]?.programs &&
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
            className={`${currentStep === 4 ? 'active' : ''} ${
              formPhase === 'AFTER' ? 'active-phase' : 'disabled-phase'
            }`}
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
            className={`${currentStep === 5 ? 'active' : ''} ${
              formPhase === 'AFTER' ? 'active-phase' : 'disabled-phase'
            }`}
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
{/* Approval Status Indicator */}
          {beforeSubmitted && (
            <div className="approval-status">
              {isCheckingApproval ? (
                <div className="loading-approval">
                  <div className="loading-spinner"></div>
                  Checking approval status...
                </div>
              ) : isBeforeApproved ? (
                <div className="approved-status">
                  <FaCheck className="check-icon green" />
                  <span>BEFORE Form Approved</span>
                  {formPhase === 'BEFORE' && (
                    <button 
                      onClick={() => {
                        setFormPhase('AFTER');
                        setCurrentStep(3);
                      }} 
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
              {approvalCheckError && <div className="approval-error">{approvalCheckError}</div>}
            </div>
          )}
      </div>

      {/* Add mobile step tracker here */}
      {renderMobileStepTracker()}

      <div className="inner-forms-4">
        <h1>{formPhase === 'BEFORE' ? 'Local Off-Campus Proposal' : 'After Activity Report'}</h1>

        {/* AFTER Form Activation Prompt */}
        {!formSent && beforeSubmitted && isBeforeApproved && formPhase === 'BEFORE' && (
          <div className="after-form-prompt">
            <h2>Your BEFORE form has been approved!</h2>
            <p>You can now complete the AFTER activity report.</p>
            <button onClick={startAfterForm} className="start-after-form-btn">
              Continue to AFTER Report
            </button>
          </div>
        )}

        {renderStepContent()}

        <div className="form-navigation">
          {formPhase === 'BEFORE' ? (
            <>
              {currentStep > 0 && <button onClick={handleBack}>Back</button>}
              {currentStep < 2 && <button onClick={handleNext}>Next</button>}
              {currentStep === 2 && (
                <button onClick={handleSubmitBefore}>
                  {beforeSubmitted ? 'Update BEFORE Form' : 'Submit BEFORE Form'}
                </button>
              )}
            </>
          ) : (
            <>
              {currentStep > 3 && <button onClick={handleBack}>Back</button>}
              {currentStep < 5 && <button onClick={handleNext}>Next</button>}
              {currentStep === 5 && (
                <button onClick={handleSubmitAfter} disabled={!isBeforeApproved}>
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
