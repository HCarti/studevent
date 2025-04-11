import React, {useState, useEffect, useCallback, useMemo} from "react";
import './LocalOff.css';
import moment from 'moment';
import { FaCheck } from 'react-icons/fa'; // Import check icon from react-icons
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Localoffcampus = () => {
  const [formData, setFormData] = useState({
    localOffCampus: {
      formPhase: 'BEFORE',
      nameOfHei: "",
      region: "",
      address: "",
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
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null); // Add user state
  const [formSent, setFormSent] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false); // State to control notification visibility
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [shouldValidate, setShouldValidate] = useState(false);
  const [formPhase, setFormPhase] = useState('BEFORE'); // 'BEFORE' or 'AFTER'
  const [beforeCompleted, setBeforeCompleted] = useState(false);
  

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
  const [fieldErrors, setFieldErrors] = useState({
    nameOfHei: false,
    region: false,
    address: false,
    basicInformation: [],
    activitiesOffCampus: []
  });

  // Check if BEFORE sections are complete
// Update isBeforeComplete
const isBeforeComplete = useMemo(() => {
  return (
    formData.localOffCampus.nameOfHei.trim() &&
    formData.localOffCampus.region.trim() &&
    formData.localOffCampus.address.trim() &&
    formData.localOffCampus.basicInformation.every(info => (
      info.programName.trim() && 
      info.course.trim() && 
      info.destinationAndVenue.trim() && 
      info.inclusiveDates && 
      info.numberOfStudents && 
      info.listOfPersonnelIncharge.trim()
    )) &&
    Object.values(formData.localOffCampus.activitiesOffCampus[0]).every(
      field => field.compliance
    )
  );
}, [formData]);

// Similarly update validationResults and other validation-related functions

  const validationResults = useMemo(() => {
    const results = {
      nameOfHei: !!formData.localOffCampus.nameOfHei.trim(),
      region: !!formData.localOffCampus.region.trim(),
      address: !!formData.localOffCampus.address.trim(),
      basicInformation: formData.localOffCampus.basicInformation.map(info => ({
        programName: !!info.programName.trim(),
        course: !!info.course.trim(),
        destinationAndVenue: !!info.destinationAndVenue.trim(),
        inclusiveDates: !!info.inclusiveDates,
        numberOfStudents: !!info.numberOfStudents,
        listOfPersonnelIncharge: !!info.listOfPersonnelIncharge.trim()
      })),
      activitiesOffCampus: formData.localOffCampus.activitiesOffCampus.map(activity => ({
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
      }))
    };
    return results;
  }, [formData, validationTrigger]);

  //setUser
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setFormData(prevData => ({
        ...prevData,
        studentOrganization: userData.role === 'Organization' ? userData.organizationName || "" : "",
        emailAddress: userData.email || "",
        applicationDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, []);

  const handleChange = (e, index, fieldType) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {...prev};
      
      if (fieldType === 'basicInformation') {
        newData.localOffCampus.basicInformation[index][name] = type === "checkbox" ? checked : value;
      } 
      else if (fieldType === 'activitiesOffCampus') {
        newData.localOffCampus.activitiesOffCampus[index][name] = type === "checkbox" ? checked : value;
      }
      else if (fieldType === 'afterActivity') {
        newData.localOffCampus.afterActivity[index][name] = type === "checkbox" ? checked : value;
      }
      else {
        newData.localOffCampus[name] = type === "checkbox" ? checked : value;
      }
      
      return newData;
    });
  };

  const handleActivityChange = (section, field, value, remarks = "", index = 0) => {
    setFormData(prev => {
      const newData = {...prev};
      const updatedActivities = [...newData.localOffCampus.activitiesOffCampus];
      
      if (section && field) {
        if (!updatedActivities[index][section]) {
          updatedActivities[index][section] = {};
        }
        updatedActivities[index][section][field] = { 
          compliance: value, 
          remarks: remarks 
        };
      } else {
        updatedActivities[index][field] = { 
          compliance: value, 
          remarks: remarks 
        };
      }
      
      newData.localOffCampus.activitiesOffCampus = updatedActivities;
      return newData;
    });
  };
  
  const ComplianceRow = ({ 
    label, 
    value, 
    remarks, 
    onChange, 
    nested = false,
    indent = false,
    hasError = false
  }) => (
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
              onChange={() => onChange("yes", remarks)}
            /> Yes
          </label>
          <label>
            <input
              type="radio"
              name={`${label}-compliance`}
              checked={value === "no"}
              onChange={() => onChange("no", remarks)}
            /> No
          </label>
        </div>
      </td>
      <td className="remarks-cell">
        <input
          type="text"
          value={remarks || ""}
          onChange={(e) => onChange(value, e.target.value)}
          placeholder="Enter remarks..."
        />
      </td>
    </tr>
  );

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
  
    if (step === 0) {
      newErrors.nameOfHei = !formData.localOffCampus.nameOfHei.trim();
      newErrors.region = !formData.localOffCampus.region.trim();
      newErrors.address = !formData.localOffCampus.address.trim();
      isValid = !newErrors.nameOfHei && !newErrors.region && !newErrors.address;
    } 
    else if (step === 1) {
      formData.localOffCampus.basicInformation.forEach((info, index) => {
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
      const activity = formData.localOffCampus.activitiesOffCampus[0];
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
  
    setFieldErrors(newErrors);
    return isValid;
  }, [formData]);

  // Update handleNext
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
    if (currentStep === 3 && formPhase === 'AFTER') {
      // If going back from AFTER to BEFORE
      setCurrentStep(2); // Last step of BEFORE
      setFormPhase('BEFORE');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getFieldError = (field, index = 0) => {
    if (!shouldValidate) return false;
    
    if (currentStep === 0) {
      return !validationResults[field];
    } else if (currentStep === 1) {
      return !validationResults.basicInformation[index][field];
    } else if (currentStep === 2) {
      return !validationResults.activitiesOffCampus[index][field];
    }
    return false;
  };

  const isCurrentSectionValid = useMemo(() => {
    if (currentStep === 0) {
      return (
        validationResults.nameOfHei &&
        validationResults.region &&
        validationResults.address
      );
    } else if (currentStep === 1) {
      return validationResults.basicInformation.every(field => 
        field.programName &&
        field.course &&
        field.destinationAndVenue &&
        field.inclusiveDates &&
        field.numberOfStudents &&
        field.listOfPersonnelIncharge
      );
    } else if (currentStep === 2) {
      return Object.values(validationResults.activitiesOffCampus[0]).every(Boolean);
    }
    return true;
  }, [currentStep, validationResults]);


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
    if (formData.localOffCampus.basicInformation.length <= 1) return; // Don't remove the last row
    setFormData(prev => ({
      ...prev,
      basicInformation: prev.basicInformation.filter((_, i) => i !== index)
    }));
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
    
    const handleSubmitBefore = async () => {
      const isValid = validateSection(2); // Validate Activities Off Campus
      
      if (isValid) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            alert('Authentication token not found. Please log in again.');
            return;
          }
    
          const userData = JSON.parse(localStorage.getItem('user')); // Get user data
      
          const response = await fetch('https://studevent-server.vercel.app/api/forms/local-off-campus/before', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              formType: "LocalOffCampus",
              localOffCampus: {
                ...formData.localOffCampus,
                formPhase: 'BEFORE',
                submittedBy: userData?._id // Use optional chaining
              }
            }),
          });
    
    
          if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Submission failed'}`);
            return;
          }
    
          const result = await response.json();
          setEventId(result._id);
          setBeforeCompleted(true); // Fixed: should be setBeforeCompleted not beforeCompleted
          setFormPhase('AFTER');
          setCurrentStep(3);
          setNotificationVisible(true);
          setTimeout(() => setNotificationVisible(false), 3000);
    
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while submitting the form.');
        }
      } else {
        setNotificationVisible(true);
        setTimeout(() => setNotificationVisible(false), 3000);
      }
    };
    

  const handleSubmit = async () => {

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

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }
  
    const userData = JSON.parse(localStorage.getItem('user')); // Get user data
    
    const response = await fetch('https://studevent-server.vercel.app/api/forms/local-off-campus/after', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        formType: "LocalOffCampus",
        localOffCampus: {
          ...formData.localOffCampus,
          formPhase: 'AFTER',
          eventId: eventId,
          submittedBy: userData?._id // Use optional chaining
        }
      }),
    });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Submission failed'}`);
        return;
      }
  
      const result = await response.json();
      setEventId(result._id);
      setFormSent(true);
      setNotificationVisible(true);
      setTimeout(() => setNotificationVisible(false), 3000);
  
      // Reset form - update to match your new structure
    setFormData({
      localOffCampus: {
        formPhase: 'BEFORE',
        nameOfHei: "",
        region: "",
        address: "",
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
      }
    });
    setCurrentStep(0); // Reset to first step
    setFormPhase('BEFORE');

  
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    }
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // School Information
        return (
          <div className="form-section">
            <h2>School Information</h2>
            <div className="form-group">
            <label className={fieldErrors.nameOfHei ? 'required-field' : ''}>Name of HEI:</label>
            <input
              type="text"
              name="nameOfHei"
              value={formData.localOffCampus.nameOfHei}
              onChange={(e) => handleChange(e)}
              className={fieldErrors.nameOfHei ? 'input-error' : ''}
            />
            {fieldErrors.nameOfHei && <div className="error-message">This field is required</div>}
                    </div>
            {/* In case 0 of renderStepContent */}
            <div className="form-group">
              <label className={fieldErrors.region ? 'required-field' : ''}>Region:</label>
              <input
                type="text"
                name="region"
                value={formData.localOffCampus.region}
                onChange={(e) => handleChange(e)}
                className={fieldErrors.region ? 'input-error' : ''}
              />
              {fieldErrors.region && <div className="error-message">This field is required</div>}
            </div>
            <div className="form-group">
              <label className={fieldErrors.address ? 'required-field' : ''}>Address:</label>
              <input
                type="text"
                name="address"
                value={formData.localOffCampus.address}
                onChange={(e) => handleChange(e)}
                className={fieldErrors.address ? 'input-error' : ''}
              />
              {fieldErrors.address && <div className="error-message">This field is required</div>}
            </div>
          </div>
        );
  
        case 1: // Basic Information
  return (
    <div className="form-section">
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
            {formData.localOffCampus.basicInformation.map((info, index) => (
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
                  <input
                    type="text"
                    name="course"
                    value={info.course}
                    onChange={(e) => handleChange(e, index, 'basicInformation')}
                    className={fieldErrors.basicInformation[index]?.course ? 'input-error' : ''}
                  />
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
                      const updatedBasicInfo = [...formData.localOffCampus.basicInformation];
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
                  {formData.localOffCampus.basicInformation.length > 1 && (
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
  
        case 2: // Activities Off Campus
        return (
          <div className="form-section">
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
                  {/* Curriculum Requirement */}
                  <ComplianceRow
                    label="1. Curriculum Requirement"
                    value={formData.localOffCampus.activitiesOffCampus[0].curriculumRequirement.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].curriculumRequirement.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'curriculumRequirement', compliance, remarks)
                    }
                    hasError={getFieldError('curriculumRequirement')}
                  />
      
                  {/* Destination */}
                  <ComplianceRow
                    label="2. Destination"
                    value={formData.localOffCampus.activitiesOffCampus[0].destination.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].destination.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'destination', compliance, remarks)
                    }
                    hasError={getFieldError('destination')}
                  />
      
                  {/* Handbook or Manual */}
                  <ComplianceRow
                    label="3. Handbook Or Manual"
                    value={formData.localOffCampus.activitiesOffCampus[0].handbook.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].handbook.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'handbook', compliance, remarks)
                    }
                    hasError={getFieldError('handbook')}
                  />

                  {/* Students Section */}
                  <ComplianceRow
                    label="4. Consent of Parents/Guardians"
                    value={formData.localOffCampus.activitiesOffCampus[0].guardianConsent.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].guardianConsent.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'guardianConsent', compliance, remarks)
                    }
                    hasError={getFieldError('guardianConsent')}
                  />
                  {/* Personnel In-Charge */}
                  <ComplianceRow
                    label="5. Personnel-In-Charge"
                    value={formData.localOffCampus.activitiesOffCampus[0].personnelInCharge.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].personnelInCharge.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'personnelInCharge', compliance, remarks)
                    }
                    hasError={getFieldError('personnelInCharge')}
                  />
      
                  {/* First Aid Kit */}
                  <ComplianceRow
                    label="6. First Aid Kit"
                    value={formData.localOffCampus.activitiesOffCampus[0].firstAidKit.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].firstAidKit.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'firstAidKit', compliance, remarks)
                    }
                    hasError={getFieldError('firstAidKit')}
                  />
      
                  {/* Fees/Funds */}
                  <ComplianceRow
                    label="7. Fees/Funds"
                    value={formData.localOffCampus.activitiesOffCampus[0].feesFunds.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].feesFunds.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'feesFunds', compliance, remarks)
                    }
                    hasError={getFieldError('feesFunds')}
                  />
      
                  {/* Insurance */}
                  <ComplianceRow
                    label="8. Insurance"
                    value={formData.localOffCampus.activitiesOffCampus[0].insurance.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].insurance.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'insurance', compliance, remarks)
                    }
                    hasError={getFieldError('insurance')}
                  />
      
                  {/* Student Vehicles */}
                  <ComplianceRow
                    label="9. Student Vehicles"
                    value={formData.localOffCampus.activitiesOffCampus[0].studentVehicles.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].studentVehicles.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'studentVehicles', compliance, remarks)
                    }
                    hasError={getFieldError('studentVehicles')}
                  />
      
                  {/* LGUs/NGOs */}
                  <ComplianceRow
                    label="10. LGUs/NGOs"
                    value={formData.localOffCampus.activitiesOffCampus[0].lgusNgos.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].lgusNgos.remarks}
                    onChange={(compliance, remarks) => 
                      handleActivityChange(null, 'lgusNgos', compliance, remarks)
                    }
                    hasError={getFieldError('lgusNgos')}
                  />
      
                  {/* Activities Orientation Section */}
                  <ComplianceRow
                    label="11. Consulations and Announcements"
                    value={formData.localOffCampus.activitiesOffCampus[0].consultationAnnouncements.compliance}
                    remarks={formData.localOffCampus.activitiesOffCampus[0].consultationAnnouncements.remarks}
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

case 3: // After Activity
  return (
    <div className="form-section">
      <h2>After Activity Report</h2>
      {formData.afterActivity.map((activity, index) => (
        <div key={index} className="after-activity-group">
          <div className="form-group">
            <label>Programs:</label>
            <input
              type="text"
              name="programs"
              value={activity.programs}
              onChange={(e) => handleChange(e, index, 'afterActivity')}
            />
          </div>
          <div className="form-group">
            <label>Destination:</label>
            <input
              type="text"
              name="destination"
              value={activity.destination}
              onChange={(e) => handleChange(e, index, 'afterActivity')}
            />
          </div>
          <div className="form-group">
            <label>Number of Students:</label>
            <input
              type="number"
              name="noOfStudents"
              value={activity.noOfStudents}
              onChange={(e) => handleChange(e, index, 'afterActivity')}
            />
          </div>
          <div className="form-group">
            <label>Number of HEI Personnel:</label>
            <input
              type="number"
              name="noofHeiPersonnel"
              value={activity.noofHeiPersonnel}
              onChange={(e) => handleChange(e, index, 'afterActivity')}
            />
          </div>
        </div>
      ))}
    </div>
  );

case 4: // Problems Encountered
  return (
    <div className="form-section">
      <h2>Problems Encountered</h2>
      <div className="form-group">
        <textarea
          name="problemsEncountered"
          value={formData.problemsEncountered}
          onChange={(e) => handleChange(e)}
          rows={5}
        />
      </div>
    </div>
  );

case 5: // Recommendations
  return (
    <div className="form-section">
      <h2>Recommendations</h2>
      <div className="form-group">
        <textarea
          name="recommendation"
          value={formData.recommendation}
          onChange={(e) => handleChange(e)}
          rows={5}
        />
      </div>
    </div>
  );
        
      default:
        return <div>Unknown step</div>;
    }
  };

    return (
      <div className="form-ubox-4">
         {notificationVisible && !validateSection(currentStep) && (
      <Notification type="error"message="Please complete all required fields before proceeding" />
        )}
<div className="sidebar">
  <ul>
    {/* BEFORE Sections - always visible */}
    <li className={`${currentStep === 0 ? 'active' : ''} ${formPhase === 'AFTER' ? 'completed-phase' : ''}`}>
      {validationResults.nameOfHei && validationResults.region && validationResults.address ? (
        <FaCheck className="check-icon green" />
      ) : (
        <span className="error-icon">!</span>
      )}
      School Information
    </li>
    
    <li className={currentStep === 1 ? 'active' : ''}>
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
    
    <li className={currentStep === 2 ? 'active' : ''}>
      {Object.values(validationResults.activitiesOffCampus[0]).every(Boolean) ? (
        <FaCheck className="check-icon green" />
      ) : (
        <span className="error-icon">!</span>
      )}
      Activities Off Campus
    </li>

    {/* AFTER Sections - always visible but grayed out if BEFORE not complete */}
    <li className={`${currentStep === 3 ? 'active' : ''} ${!beforeCompleted ? 'disabled-section' : ''}`}>
      {beforeCompleted && formData.afterActivity[0].programs && 
       formData.afterActivity[0].destination && 
       formData.afterActivity[0].noOfStudents && 
       formData.afterActivity[0].noofHeiPersonnel ? (
        <FaCheck className="check-icon green" />
      ) : (
        beforeCompleted && <span className="error-icon">!</span>
      )}
      After Activity Report
    </li>
    
    <li className={`${currentStep === 4 ? 'active' : ''} ${!beforeCompleted ? 'disabled-section' : ''}`}>
      {beforeCompleted && formData.problemsEncountered ? (
        <FaCheck className="check-icon green" />
      ) : (
        beforeCompleted && <span className="error-icon">!</span>
      )}
      Problems Encountered
    </li>
    
    <li className={`${currentStep === 5 ? 'active' : ''} ${!beforeCompleted ? 'disabled-section' : ''}`}>
      {beforeCompleted && formData.recommendation ? (
        <FaCheck className="check-icon green" />
      ) : (
        beforeCompleted && <span className="error-icon">!</span>
      )}
      Recommendations
    </li>
  </ul>
</div>
        <div className="inner-forms-4">
          <h1>Local off Campus Proposal</h1>
          {renderStepContent()}
          <div className="form-navigation">
          {currentStep > 0 && formPhase === 'BEFORE' && (
            <button onClick={handleBack}>Back</button>
          )}
          
          {currentStep < 2 && formPhase === 'BEFORE' && (
            <button onClick={handleNext}>Next</button>
          )}
          
          {currentStep === 2 && formPhase === 'BEFORE' && (
            <button onClick={handleSubmitBefore}>Submit BEFORE Form</button>
          )}
          
          {formPhase === 'AFTER' && currentStep < 5 && (
            <button onClick={handleNext}>Next</button>
          )}
          
          {formPhase === 'AFTER' && currentStep === 5 && (
            <button onClick={handleSubmit}>Submit AFTER Report</button>
          )}
        </div>
        </div>
      </div>
    );
};

export default Localoffcampus;