import React, { useState, useEffect } from "react";
import './Project.css';
import moment from 'moment';
import { FaCheck } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';

const Project = () => {
  const [formData, setFormData] = useState({
    // Project Overview
    projectTitle: '',
    projectDescription: '',
    projectObjectives: '',
    startDate: '',
    endDate: '',
    venue: '',
    targetParticipants: '',
    // Project Guidelines
    projectGuidelines: '',
    // Program Flow
    programFlow: [{ timeRange: '', segment: '' }],
    // Officers in Charge
    projectHeads: [{ headName: '', designatedOffice: '' }],
    workingCommittees: [{ workingName: '', designatedTask: '' }],
    // Task Delegation
    taskDeligation: [{ taskList: '', deadline: '' }],
    // Timeline/Posting Schedules
    timelineSchedules: [{ publicationMaterials: '', schedule: '' }],
    // School Facilities & Equipment
    schoolEquipments: [{ equipments: '', estimatedQuantity: '' }],
    // Budget Proposal
    budgetProposal: [{
      budgetItems: '',
      budgetEstimatedQuantity: '',
      budgetPerUnit: '',
      budgetEstimatedAmount: ''
    }],
  });

  const [fieldErrors, setFieldErrors] = useState({
    // Project Overview
    projectTitle: false,
    projectDescription: false,
    projectObjectives: false,
    startDate: false,
    endDate: false,
    venue: false,
    targetParticipants: false,
    
    // Project Guidelines
    projectGuidelines: false,
    
    // Array fields - we'll track errors per item
    programFlow: [],
    projectHeads: [],
    workingCommittees: [],
    taskDeligation: [],
    timelineSchedules: [],
    schoolEquipments: [],
    budgetProposal: []
  });

  const TimeRangePicker = ({ value, onChange }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
  
    useEffect(() => {
      if (value) {
        const [start, end] = value.split('-').map(t => t.trim());
        setStartTime(start || '');
        setEndTime(end || '');
      }
    }, [value]);
  
    const handleTimeChange = (type, timeValue) => {
      if (type === 'start') {
        setStartTime(timeValue);
        onChange(`${timeValue}-${endTime}`);
      } else {
        setEndTime(timeValue);
        onChange(`${startTime}-${timeValue}`);
      }
    };
  
    const durationMinutes = startTime && endTime 
      ? convertToMinutes(endTime) - convertToMinutes(startTime)
      : 0;
  
    const durationDisplay = calculateDurationDisplay(durationMinutes);
  
    return (
      <div className="time-range-picker">
        <div className="time-inputs">
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleTimeChange('start', e.target.value)}
              required
            />
          </div>
          <span className="time-separator">to</span>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleTimeChange('end', e.target.value)}
              min={startTime}
              required
            />
          </div>
        </div>
        <div className="duration-display">
          Duration: {durationDisplay}
        </div>
      </div>
    );
  };

  
  const [currentStep, setCurrentStep] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [eventsPerDate, setEventsPerDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);

  const Notification = ({ message }) => (
    <div className="notification">
      {message}
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: !value }));
  };

const validateCurrentStep = () => {
  const stepFields = getFieldsForStep(currentStep);
  let isValid = true;
  const newErrors = {...fieldErrors};

  stepFields.forEach(field => {
    if (Array.isArray(formData[field])) {
      newErrors[field] = formData[field].map(item => {
        const itemErrors = {};
        Object.keys(item).forEach(key => {
          itemErrors[key] = !item[key];
          if (!item[key]) isValid = false;
        });
        return itemErrors;
      });
    } else {
      newErrors[field] = !formData[field];
      if (!formData[field]) isValid = false;
    }
  });

  setFieldErrors(newErrors);
  return isValid;
};
  

// Validate all fields in current step
const validateStep = (step) => {
  const errors = {...fieldErrors};
  let isValid = true;

  const requiredFields = getFieldsForStep(step);
  
  requiredFields.forEach(field => {
    if (Array.isArray(formData[field])) {
      // Handle array fields
      errors[field] = formData[field].map(item => {
        const itemErrors = {};
        Object.keys(item).forEach(key => {
          itemErrors[key] = !item[key];
          if (!item[key]) isValid = false;
        });
        return itemErrors;
      });
    } else {
      // Handle simple fields
      errors[field] = !formData[field];
      if (!formData[field]) isValid = false;
    }
  });

  setFieldErrors(errors);
  return isValid;
};

// Validate a single field
const validateField = (name, value) => {
  setFieldErrors(prev => ({
    ...prev,
    [name]: !value
  }));
};

// Validate array item field
const validateArrayField = (arrayName, index, fieldName, value) => {
  setFieldErrors(prev => {
    const newErrors = {...prev};
    if (!newErrors[arrayName][index]) {
      newErrors[arrayName][index] = {};
    }
    newErrors[arrayName][index][fieldName] = !value;
    return newErrors;
  });
};
   // Fetch occupied dates from server
// Fetch occupied dates and event counts
useEffect(() => {
  const fetchOccupiedData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://studevent-server.vercel.app/api/calendar/event-counts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error('Failed to fetch calendar data');
      
      const data = await response.json();
      if (data?.eventCounts) {
        setEventsPerDate(data.eventCounts);
      }
      if (data?.occupiedDates) {
        setOccupiedDates(data.occupiedDates);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchOccupiedData();
}, []);

const isDateOccupied = (date) => {
  if (!date) return false;
  const dateStr = moment(date).format('YYYY-MM-DD');
  return (eventsPerDate[dateStr] || 0) >= 3;
};

const dayClassName = (date) => {
  const dateStr = moment(date).format('YYYY-MM-DD');
  const count = eventsPerDate[dateStr] || 0;
  
  if (count >= 3) return 'fully-booked-day';
  if (count >= 2) return 'approaching-limit-day';
  return '';
};

const handleArrayChange = (field, index, e) => {
  const { name, value } = e.target;
  const updatedArray = formData[field].map((item, i) => 
    i === index ? { ...item, [name]: value } : item
  );
  setFormData(prev => ({ ...prev, [field]: updatedArray }));
  
  setFieldErrors(prev => {
    const newErrors = {...prev};
    if (!newErrors[field][index]) newErrors[field][index] = {};
    newErrors[field][index][name] = !value;
    return newErrors;
  });
};

  // Add new item to array field
  const addArrayItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template]
    }));
  };

// Format minutes to "X hours Y minutes"
const calculateDurationDisplay = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  let display = '';
  if (hours > 0) display += `${hours} hour${hours > 1 ? 's' : ''}`;
  if (mins > 0) {
    if (display) display += ' ';
    display += `${mins} minute${mins > 1 ? 's' : ''}`;
  }
  return display || '0 minutes';
};

// Format 24-hour time to 12-hour with AM/PM
const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

  // Remove item from array field
  const removeArrayItem = (field, index) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: updatedArray }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Please complete all required fields in this section before proceeding.");
    }
  };

  const isSectionComplete = (step) => {
    const requiredFields = getFieldsForStep(step);
    return requiredFields.every(field => {
      if (Array.isArray(formData[field])) {
        return formData[field].length > 0 && 
          formData[field].every(item => 
            Object.values(item).every(val => val !== "")
          );
      }
      return formData[field] !== "";
    });
  };

  const convertToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };  

  const getFieldsForStep = (step) => {
    const sections = [
      // Step 0: Project Overview
      ['projectTitle', 'projectDescription', 'projectObjectives', 'startDate', 'endDate', 'venue', 'targetParticipants'],
      
      // Step 1: Project Guidelines
      ['projectGuidelines'],
      
      // Step 2: Program Flow
      ['programFlow'],
      
      // Step 3: Officers in Charge
      ['projectHeads', 'workingCommittees'],
      
      // Step 4: Task Delegation
      ['taskDeligation'],
      
      // Step 5: Timeline/Posting Schedules
      ['timelineSchedules'],
      
      // Step 6: School Facilities & Equipment
      ['schoolEquipments'],
      
      // Step 7: Budget Proposal
      ['budgetProposal']
    ];
    return sections[step] || [];
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    setFieldErrors(prev => ({ ...prev, [field]: !date }));
    
    // Cross-validate dates
    if (field === 'startDate' && formData.endDate) {
      const endDateValid = moment(formData.endDate).isSameOrAfter(date);
      setFieldErrors(prev => ({ ...prev, endDate: !endDateValid }));
    }
    if (field === 'endDate' && formData.startDate) {
      const startDateValid = moment(date).isSameOrAfter(formData.startDate);
      setFieldErrors(prev => ({ ...prev, startDate: !startDateValid }));
    }
  };


  const handleSubmit = async () => {
    // Validate dates
    if (moment(formData.endDate).isBefore(moment(formData.startDate))) {
      setFieldErrors(prev => ({
        ...prev,
        startDate: true,
        endDate: true
      }));
      alert("End date must be after start date");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('https://studevent-server.vercel.app/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          formType: 'Project',
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      const result = await response.json();
      setFormSent(true);
      setNotificationVisible(true);
      
      // Reset form
      // Replace your current reset with:
setFormData({
  formType: 'Project',
  projectTitle: "",
  projectDescription: "",
  projectObjectives: "",
  startDate: "",
  endDate: "",
  venue: "",
  targetParticipants: "",
  projectGuidelines: "",
  programFlow: [{ timeRange: "", duration: "", segment: "" }],
  projectHeads: [{ headName: "", designatedOffice: "" }],
  workingCommittees: [{ workingName: "", designatedTask: "" }],
  taskDeligation: [{ taskList: "", deadline: "" }],
  timelineSchedules: [{ publicationMaterials: "", schedule: "" }],
  schoolEquipments: [{ equipments: "", estimatedQuantity: "" }],
  budgetProposal: [{ 
    budgetItems: "", 
    budgetEstimatedQuantity: "", 
    budgetPerUnit: "", 
    budgetEstimatedAmount: "" 
  }],
});

      setTimeout(() => setNotificationVisible(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred while submitting the form.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Project Overview
      return (
        <div className="form-section">
          <div className="form-group">
            <label>Project Title:</label>
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              className={fieldErrors.projectTitle ? 'invalid-field' : ''}
              required
            />
            {fieldErrors.projectTitle && (
              <div className="validation-error">Project Title is required</div>
            )}
          </div>

          <div className="form-group">
            <label>Project Description:</label>
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              className={fieldErrors.projectDescription ? 'invalid-field' : ''}
              required
              rows={4}
            />
            {fieldErrors.projectDescription && (
              <div className="validation-error">Project Description is required</div>
            )}
          </div>

          <div className="form-group">
            <label>Objectives:</label>
            <textarea
              name="projectObjectives"
              value={formData.projectObjectives}
              onChange={handleChange}
              className={fieldErrors.projectObjectives ? 'invalid-field' : ''}
              required
              rows={4}
            />
            {fieldErrors.projectObjectives && (
              <div className="validation-error">Objectives are required</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="required-field">Start Date:</label>
              <DatePicker
                selected={formData.startDate ? new Date(formData.startDate) : null}
                onChange={(date) =>
                  handleChange({
                    target: {
                      name: 'startDate',
                      value: date ? date.toISOString() : '',
                    },
                  })
                }
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
                selectsStart
                startDate={formData.startDate ? new Date(formData.startDate) : null}
                endDate={formData.endDate ? new Date(formData.endDate) : null}
                dateFormat="MMMM d, yyyy h:mm aa"
                showTimeSelect
                timeFormat="h:mm aa"
                timeIntervals={15}
                timeCaption="Time"
                className={`date-picker-input ${
                  fieldErrors.startDate ? 'invalid-field' : ''
                }`}
                placeholderText="Select start date and time"
                popperPlacement="bottom-start"
                disabled={loadingDates}
                required
              />
              {fieldErrors.startDate && (
                <div className="validation-error">Start Date is required</div>
              )}
            </div>

            <div className="form-group">
              <label className="required-field">End Date:</label>
              <DatePicker
                selected={formData.endDate ? new Date(formData.endDate) : null}
                onChange={(date) =>
                  handleChange({
                    target: {
                      name: 'endDate',
                      value: date ? date.toISOString() : '',
                    },
                  })
                }
                minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
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
                selectsEnd
                startDate={formData.startDate ? new Date(formData.startDate) : null}
                endDate={formData.endDate ? new Date(formData.endDate) : null}
                dateFormat="MMMM d, yyyy h:mm aa"
                showTimeSelect
                timeFormat="h:mm aa"
                timeIntervals={15}
                timeCaption="Time"
                className={`date-picker-input ${
                  fieldErrors.endDate ? 'invalid-field' : ''
                }`}
                placeholderText="Select end date and time"
                popperPlacement="bottom-start"
                disabled={loadingDates || !formData.startDate}
                required
              />
              {fieldErrors.endDate && (
                <div className="validation-error">End Date is required</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Venue:</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className={fieldErrors.venue ? 'invalid-field' : ''}
              required
            />
            {fieldErrors.venue && (
              <div className="validation-error">Venue is required</div>
            )}
          </div>

          <div className="form-group">
            <label>Target Participants:</label>
            <input
              type="text"
              name="targetParticipants"
              value={formData.targetParticipants}
              onChange={handleChange}
              className={fieldErrors.targetParticipants ? 'invalid-field' : ''}
              min="1"
              required
            />
            {fieldErrors.targetParticipants && (
              <div className="validation-error">Target Participants are required</div>
            )}
          </div>
        </div>
      );

      case 1: // Project Guidelines
        return (
          <div className="form-section">
            <h2>Project Guidelines</h2>
            <div className="form-group">
              <label>Guidelines:</label>
              <textarea
                name="projectGuidelines"
                value={formData.projectGuidelines}
                onChange={handleChange}
                required
                rows={8}
              />
              {fieldErrors.projectGuidelines && (
              <div className="validation-error">project guidelines are required</div>
            )}
            </div>
          </div>
        );

        case 2: // Program Flow
          return (
            <div className="form-section">
              <h2>Program Flow</h2>
              <table className="program-flow-table">
                <thead>
                  <tr>
                    <th>TIME</th>
                    <th>DURATION</th>
                    <th>SEGMENT</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.programFlow.map((item, index) => {
                    const [start = '', end = ''] = item.timeRange.split('-');
                    const formattedTime = start && end 
                      ? `${formatTimeDisplay(start)} - ${formatTimeDisplay(end)}`
                      : '';
                    const duration = start && end
                      ? calculateDurationDisplay(convertToMinutes(end) - convertToMinutes(start))
                      : '';
                    
                    return (
                      <tr key={index}>
                        <td>
                          <TimeRangePicker
                            value={item.timeRange}
                            onChange={(newRange) => {
                              handleArrayChange('programFlow', index, {
                                target: { name: 'timeRange', value: newRange }
                              });
                            }}
                          />
                          {fieldErrors.programFlow[index]?.timeRange && (
                            <span className="validation-error">Time range is required</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={duration}
                            readOnly
                            className="duration-display"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="segment"
                            value={item.segment}
                            onChange={(e) => handleArrayChange('programFlow', index, e)}
                            className={fieldErrors.programFlow[index]?.segment ? 'error' : ''}
                            required
                          />
                          {fieldErrors.programFlow[index]?.segment && (
                            <span className="validation-error">Segment is required</span>
                          )}
                        </td>
                        <td>
                          {index > 0 && (
                            <button 
                              type="button" 
                              className="remove-btn"
                              onClick={() => removeArrayItem('programFlow', index)}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button 
                type="button" 
                className="add-btn"
                onClick={() => addArrayItem('programFlow', { 
                  timeRange: '', 
                  segment: '' 
                })}
              >
                Add Segment
              </button>
            </div>
          );

          case 3: // Officers in Charge
          return (
            <div className="form-section">
              <h2>Officers in Charge</h2>
              
              <h3>Project Heads</h3>
              {formData.projectHeads.map((item, index) => (
                <div key={`head-${index}`} className="array-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        name="headName"
                        value={item.headName}
                        onChange={(e) => handleArrayChange('projectHeads', index, e)}
                        className={fieldErrors.projectHeads[index]?.headName ? 'error' : ''}
                        required
                      />
                      {fieldErrors.projectHeads[index]?.headName && (
                        <span className="validation-error">Name is required</span>
                      )}
                    </div>
        
                    <div className="form-group">
                      <label>Designated Office:</label>
                      <input
                        type="text"
                        name="designatedOffice"
                        value={item.designatedOffice}
                        onChange={(e) => handleArrayChange('projectHeads', index, e)}
                        className={fieldErrors.projectHeads[index]?.designatedOffice ? 'error' : ''}
                        required
                      />
                      {fieldErrors.projectHeads[index]?.designatedOffice && (
                        <span className="validation-error">Office is required</span>
                      )}
                    </div>
                  </div>
        
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeArrayItem('projectHeads', index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
        
              <button 
                type="button" 
                className="add-btn"
                onClick={() => addArrayItem('projectHeads', { headName: "", designatedOffice: "" })}
              >
                Add Project Head
              </button>
        
              <h3>Working Committees</h3>
              {formData.workingCommittees.map((item, index) => (
                <div key={`committee-${index}`} className="array-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        name="workingName"
                        value={item.workingName}
                        onChange={(e) => handleArrayChange('workingCommittees', index, e)}
                        className={fieldErrors.workingCommittees[index]?.workingName ? 'error' : ''}
                        required
                      />
                      {fieldErrors.workingCommittees[index]?.workingName && (
                        <span className="validation-error">Name is required</span>
                      )}
                    </div>
        
                    <div className="form-group">
                      <label>Designated Task:</label>
                      <input
                        type="text"
                        name="designatedTask"
                        value={item.designatedTask}
                        onChange={(e) => handleArrayChange('workingCommittees', index, e)}
                        className={fieldErrors.workingCommittees[index]?.designatedTask ? 'error' : ''}
                        required
                      />
                      {fieldErrors.workingCommittees[index]?.designatedTask && (
                        <span className="validation-error">Task is required</span>
                      )}
                    </div>
                  </div>
        
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeArrayItem('workingCommittees', index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
        
              <button 
                type="button" 
                className="add-btn"
                onClick={() => addArrayItem('workingCommittees', { workingName: "", designatedTask: "" })}
              >
                Add Committee Member
              </button>
            </div>
          );

          case 4: // Task Delegation
          return (
            <div className="form-section">
              <h2>Task Delegation</h2>
              {formData.taskDeligation.map((item, index) => (
                <div key={index} className="array-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Task List:</label>
                      <input
                        type="text"
                        name="taskList"
                        value={item.taskList}
                        onChange={(e) => handleArrayChange('taskDeligation', index, e)}
                        className={fieldErrors.taskDeligation[index]?.taskList ? 'error' : ''}
                        required
                      />
                      {fieldErrors.taskDeligation[index]?.taskList && (
                        <span className="validation-error">Task is required</span>
                      )}
                    </div>
        
                    <div className="form-group">
                      <label>Deadline:</label>
                      <input
                        type="date"
                        name="deadline"
                        value={item.deadline}
                        onChange={(e) => handleArrayChange('taskDeligation', index, e)}
                        className={fieldErrors.taskDeligation[index]?.deadline ? 'error' : ''}
                        required
                      />
                      {fieldErrors.taskDeligation[index]?.deadline && (
                        <span className="validation-error">Deadline is required</span>
                      )}
                    </div>
                  </div>
        
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeArrayItem('taskDeligation', index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
        
              <button 
                type="button" 
                className="add-btn"
                onClick={() => addArrayItem('taskDeligation', { taskList: "", deadline: "" })}
              >
                Add Task
              </button>
            </div>
          );

      case 5: // Timeline/Posting Schedules
        return (
          <div className="form-section">
            <h2>Timeline/Posting Schedules</h2>
            {formData.timelineSchedules.map((item, index) => (
              <div key={index} className="array-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Publication Materials:</label>
                    <input
                      type="text"
                      name="publicationMaterials"
                      value={item.publicationMaterials}
                      onChange={(e) => handleArrayChange('timelineSchedules', index, e)}
                      required
                    />
                    {fieldErrors.timelineSchedules[index]?.publicationMaterials && (
                        <span className="validation-error">Publication Materials is required</span>
                      )}
                  </div>

                  <div className="form-group">
                    <label>Tentative date of Posting</label>
                    <input
                      type="date"
                      name="schedule"
                      value={item.schedule}
                      onChange={(e) => handleArrayChange('timelineSchedules', index, e)}
                      min="1"
                      required
                    />
                    {fieldErrors.timelineSchedules[index]?.schedule && (
                        <span className="validation-error">Schedule is required</span>
                      )}
                  </div>
                </div>

                {index > 0 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeArrayItem('timelineSchedules', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button 
              type="button" 
              className="add-btn"
              onClick={() => addArrayItem('timelineSchedules', { publicationMaterials: "", schedule: "" })}
            >
              Add Schedule
            </button>
          </div>
        );

      case 6: // School Facilities & Equipment
        return (
          <div className="form-section">
            <h2>School Facilities & Equipment</h2>
            {formData.schoolEquipments.map((item, index) => (
              <div key={index} className="array-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Equipment:</label>
                    <input
                      type="text"
                      name="equipments"
                      value={item.equipments}
                      onChange={(e) => handleArrayChange('schoolEquipments', index, e)}
                      required
                    />
                    {fieldErrors.schoolEquipments[index]?.equipments && (
                        <span className="validation-error">Equipments is required</span>
                      )}
                  </div>

                  <div className="form-group">
                    <label>Estimated Quantity:</label>
                    <input
                      type="text"
                      name="estimatedQuantity"
                      value={item.estimatedQuantity}
                      onChange={(e) => handleArrayChange('schoolEquipments', index, e)}
                      min="1"
                      required
                    />
                    {fieldErrors.schoolEquipments[index]?.estimatedQuantity && (
                        <span className="validation-error">Estimated Quantity is required</span>
                      )}
                  </div>
                </div>

                {index > 0 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeArrayItem('schoolEquipments', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button 
              type="button" 
              className="add-btn"
              onClick={() => addArrayItem('schoolEquipments', { equipments: "", estimatedQuantity: "" })}
            >
              Add Equipment
            </button>
          </div>
        );

      case 7: // Budget Proposal
        return (
          <div className="form-section">
            <h2>Budget Proposal</h2>
            {formData.budgetProposal.map((item, index) => (
              <div key={index} className="array-item">
                <div className="form-group">
                  <label>Budget Item:</label>
                  <input
                    type="text"
                    name="budgetItems"
                    value={item.budgetItems}
                    onChange={(e) => handleArrayChange('budgetProposal', index, e)}
                    required
                  />
                  {fieldErrors.budgetProposal[index]?.budgetItems && (
                        <span className="validation-error">Budget Item is required</span>
                      )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Estimated Quantity:</label>
                    <input
                      type="number"
                      name="budgetEstimatedQuantity"
                      value={item.budgetEstimatedQuantity}
                      onChange={(e) => handleArrayChange('budgetProposal', index, e)}
                      min="1"
                      required
                    />
                    {fieldErrors.budgetProposal[index]?.budgetEstimatedQuantity && (
                        <span className="validation-error">Budget Estimated Quantity is required</span>
                      )}
                  </div>

                  <div className="form-group">
                    <label>Cost Per Unit ($):</label>
                    <input
                      type="number"
                      name="budgetPerUnit"
                      value={item.budgetPerUnit}
                      onChange={(e) => handleArrayChange('budgetProposal', index, e)}
                      min="0"
                      step="0.01"
                      required
                    />
                    {fieldErrors.budgetProposal[index]?.budgetPerUnit && (
                        <span className="validation-error">Budget Per Unit is required</span>
                      )}
                  </div>

                  <div className="form-group">
                    <label>Estimated Amount ($):</label>
                    <input
                      type="number"
                      name="budgetEstimatedAmount"
                      value={item.budgetEstimatedAmount}
                      onChange={(e) => handleArrayChange('budgetProposal', index, e)}
                      min="0"
                      step="0.01"
                      required
                    />
                    {fieldErrors.budgetProposal[index]?.budgetEstimatedAmount && (
                        <span className="validation-error">Budget Estimated Amount is required</span>
                      )}
                  </div>
                </div>

                {index > 0 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeArrayItem('budgetProposal', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button 
              type="button" 
              className="add-btn"
              onClick={() => addArrayItem('budgetProposal', { 
                budgetItems: "", 
                budgetEstimatedQuantity: "", 
                budgetPerUnit: "", 
                budgetEstimatedAmount: "" 
              })}
            >
              Add Budget Item
            </button>
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
          {[
            "Project Overview",
            "Project Guidelines",
            "Program Flow",
            "Officers in Charge",
            "Task Delegation",
            "Timeline/Posting Schedules",
            "School Facilities & Equipment",
            "Budget Proposal"
          ].map((step, index) => (
            <li 
              key={index} 
              className={currentStep === index ? 'active' : ''}
              onClick={() => isSectionComplete(index) && setCurrentStep(index)}
            >
              {isSectionComplete(index) ? <FaCheck className="check-icon green" /> : null}
              {step}
            </li>
          ))}
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

export default Project;