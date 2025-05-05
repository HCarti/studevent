import React, { useState, useEffect, useRef } from 'react';
import './Project.css';
import moment from 'moment';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { useNavigate, useParams } from 'react-router-dom';

const Project = () => {
  const { formId } = useParams(); // Add this with other route hooks
  const isEditMode = !!formId; // Determine if we're in edit mode
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
    budgetAmount: '',
    budgetFrom: '',
    attachedBudget: null, // ID of attached budget proposal
    budgetProposals: [] // List of available budgets for dropdown
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
    budgetAmount: '',
    budgetFrom: '',
    attachedBudget: null,
    budgetProposals: []
  });

  const TimeRangePicker = ({ value, onChange, error }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Initialize values
    useEffect(() => {
      if (value) {
        const [start, end] = value.split('-').map(t => t.trim());
        setStartTime(start || '');
        setEndTime(end || '');
      }
    }, [value]);

    const handleStartTimeChange = e => {
      const newStart = e.target.value;
      setStartTime(newStart);
      // Always update the value, even if end time needs to be cleared
      onChange(
        endTime && !isTimeAfter(newStart, endTime) ? `${newStart}-${endTime}` : `${newStart}-`
      );
    };

    const handleEndTimeChange = e => {
      const newEnd = e.target.value;
      setEndTime(newEnd);
      onChange(`${startTime}-${newEnd}`);
    };

    // More permissive time comparison
    const isTimeAfter = (time1, time2) => {
      if (!time1 || !time2) return false;
      const [h1, m1] = time1.split(':').map(Number);
      const [h2, m2] = time2.split(':').map(Number);
      return h1 > h2 || (h1 === h2 && m1 >= m2); // Changed to >= to allow same time
    };

    return (
      <div className={`time-range-picker ${error ? 'invalid-field' : ''}`}>
        <div className="time-inputs">
          <div className="time-input-group">
            <input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              className={`time-input ${!startTime && error ? 'error' : ''}`}
              required
              step="300"
            />
            {!startTime && error && <span className="time-error-message">Required</span>}
          </div>

          <div className="time-separator">to</div>

          <div className="time-input-group">
            <input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              min={startTime || undefined} // Only set min if startTime exists
              className={`time-input ${!endTime && error ? 'error' : ''}`}
              required
              step="300"
              disabled={!startTime}
            />
            {!endTime && error && <span className="time-error-message">Required</span>}
          </div>
        </div>
      </div>
    );
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [eventsPerDate, setEventsPerDate] = useState({});
  const [loading, setLoading] = useState(isEditMode); // Start loading in edit mode
  const [loadingDates, setLoadingDates] = useState(false);
  const [budgetLoadError, setBudgetLoadError] = useState(null);
  const navigate = useNavigate();
  const [blockedDates, setBlockedDates] = useState([]);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  const [userOrgId, setUserOrgId] = useState(null);

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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?._id) {
      setUserOrgId(user._id);
    }
  }, []);

  const Notification = ({ message }) => <div className="notification">{message}</div>;

  useEffect(() => {
    const fetchFormData = async () => {
      if (!isEditMode) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://studevent-server.vercel.app/api/forms/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch form');

        const formData = await response.json();

        // Format the data for the form
        const formattedData = {
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
          // Format array fields if needed
          programFlow: formData.programFlow || [{ timeRange: '', segment: '' }],
          projectHeads: formData.projectHeads || [{ headName: '', designatedOffice: '' }],
          workingCommittees: formData.workingCommittees || [
            { workingName: '', designatedTask: '' }
          ],
          taskDeligation: formData.taskDeligation || [{ taskList: '', deadline: '' }],
          timelineSchedules: formData.timelineSchedules || [
            { publicationMaterials: '', schedule: '' }
          ],
          schoolEquipments: formData.schoolEquipments || [
            { equipments: '', estimatedQuantity: '' }
          ],
          // Budget fields
          budgetAmount: formData.budgetAmount || '',
          budgetFrom: formData.budgetFrom || 'Org', // Default to 'Org' if empty
          attachedBudget: formData.attachedBudget || null,
          budgetProposals: formData.budgetProposals || []
        };

        setFormData(formattedData);
      } catch (error) {
        console.error('Error fetching form:', error);
        setNotification({
          visible: true,
          message: 'Failed to load form data',
          type: 'error'
        });
        setTimeout(() => setNotification({ visible: false }), 3000);
        navigate('/submitted-forms');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formId, isEditMode, navigate]);

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
          Authorization: `Bearer ${token}`,
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
      setBudgetLoadError(
        error.message || 'Failed to load budget proposals. Please try again later.'
      );
    }
  };

  // Updated helper function to fetch a single budget
  const fetchSingleBudget = async budgetId => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://studevent-server.vercel.app/api/budgets/${budgetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: !value }));
  };

  const validateCurrentStep = () => {
    const stepFields = getFieldsForStep(currentStep);
    let hasErrors = false;
    const newErrors = { ...fieldErrors };

    stepFields.forEach(field => {
      if (Array.isArray(formData[field])) {
        newErrors[field] = formData[field].map((item, index) => {
          const itemErrors = {};
          Object.keys(item).forEach(key => {
            const isEmpty =
              !item[key] || (typeof item[key] === 'string' && item[key].trim() === '');
            itemErrors[key] = isEmpty;
            if (isEmpty) hasErrors = true;
          });
          return itemErrors;
        });
      } else {
        const isEmpty =
          !formData[field] ||
          (typeof formData[field] === 'string' && formData[field].trim() === '');
        newErrors[field] = isEmpty;
        if (isEmpty) hasErrors = true;
      }
    });

    setFieldErrors(newErrors);
    return !hasErrors;
  };

  const showFieldErrors = step => {
    const stepFields = getFieldsForStep(step);
    const newErrors = { ...fieldErrors };

    stepFields.forEach(field => {
      if (Array.isArray(formData[field])) {
        newErrors[field] = formData[field].map(item => {
          const itemErrors = {};
          Object.keys(item).forEach(key => {
            itemErrors[key] = !item[key];
          });
          return itemErrors;
        });
      } else {
        newErrors[field] = !formData[field];
      }
    });

    setFieldErrors(newErrors);
  };

  // Fetch occupied dates from server
  // Fetch occupied dates and event counts
  useEffect(() => {
    const fetchOccupiedData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(
          'https://studevent-server.vercel.app/api/calendar/event-counts',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch calendar data');

        const data = await response.json();
        if (data?.eventCounts) {
          setEventsPerDate(data.eventCounts);
          // Convert eventCounts to occupiedDates if needed
          const dates = Object.keys(data.eventCounts).filter(date => data.eventCounts[date] > 0);
          setOccupiedDates(dates);
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedData();
  }, []);

  const normalizeDateToUTC = date => {
    return moment(date).utc().startOf('day').format('YYYY-MM-DD');
  };

  // Add this function to fetch blocked dates
const fetchBlockedDates = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(
      'https://studevent-server.vercel.app/api/calendar/blocked-dates',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      setBlockedDates(data);
    }
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
  }
};

// Call this in useEffect when component mounts
useEffect(() => {
  fetchBlockedDates();
}, []);

const isDateBlocked = (date) => {
  const dateToCheck = moment(date).startOf('day');
  
  return blockedDates.some(block => {
    const startDate = moment(block.startDate).startOf('day');
    const endDate = block.endDate ? moment(block.endDate).startOf('day') : startDate;
    
    return dateToCheck.isBetween(startDate, endDate, 'day', '[]');
  });
};

  const isDateOccupied = date => {
    if (!date) return false;
    const dateStr = moment(date).format('YYYY-MM-DD');
    return (eventsPerDate[dateStr] || 0) >= 3;
  };

  const handleArrayChange = (field, index, e) => {
    const { name, value } = e.target;
    const updatedArray = formData[field].map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    );
    setFormData(prev => ({ ...prev, [field]: updatedArray }));

    setFieldErrors(prev => {
      const newErrors = { ...prev };
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
  const calculateDurationDisplay = minutes => {
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

  // Remove item from array field
  const removeArrayItem = (field, index) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: updatedArray }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show error notification
      setTimeout(() => setNotification({ visible: false }), 3000);

      // Highlight all errors in current step
      showFieldErrors(currentStep);
    }
  };

  const isSectionComplete = step => {
    const requiredFields = getFieldsForStep(step);
    return requiredFields.every(field => {
      if (Array.isArray(formData[field])) {
        return (
          formData[field].length > 0 &&
          formData[field].every(item => Object.values(item).every(val => val !== ''))
        );
      }
      return formData[field] !== '';
    });
  };

  const convertToMinutes = timeStr => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getFieldsForStep = step => {
    const sections = [
      // Step 0: Project Overview
      [
        'projectTitle',
        'projectDescription',
        'projectObjectives',
        'startDate',
        'endDate',
        'venue',
        'targetParticipants'
      ],

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
      ['attachedBudget', 'budgetAmount', 'budgetFrom']
    ];
    return sections[step] || [];
  };

  const validateAllSections = () => {
    let isValid = true;
    const newErrors = { ...fieldErrors };

    // Check all sections (0-7)
    for (let step = 0; step <= 7; step++) {
      const stepFields = getFieldsForStep(step);

      stepFields.forEach(field => {
        if (Array.isArray(formData[field])) {
          newErrors[field] = formData[field].map((item, index) => {
            const itemErrors = {};
            Object.keys(item).forEach(key => {
              const isEmpty =
                !item[key] || (typeof item[key] === 'string' && item[key].trim() === '');
              itemErrors[key] = isEmpty;
              if (isEmpty) isValid = false;
            });
            return itemErrors;
          });
          if (field === 'budgetAmount') {
            const isEmpty = !formData.budgetAmount || isNaN(formData.budgetAmount);
            newErrors.budgetAmount = isEmpty;
            if (isEmpty) isValid = false;
          }

          if (field === 'budgetFrom') {
            const isEmpty = !formData.budgetFrom;
            newErrors.budgetFrom = isEmpty;
            if (isEmpty) isValid = false;
          }
        } else {
          const isEmpty =
            !formData[field] ||
            (typeof formData[field] === 'string' && formData[field].trim() === '');
          newErrors[field] = isEmpty;
          if (isEmpty) isValid = false;
        }
      });
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    // First validate all sections
    if (!validateAllSections()) {
      setNotification({
        visible: true,
        message: 'Please complete all required fields in all sections before submitting',
        type: 'error'
      });
      setTimeout(() => setNotification({ visible: false }), 3000);

      // Scroll to the first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.invalid-field');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    // Validate dates
    if (moment(formData.endDate).isBefore(moment(formData.startDate))) {
      setFieldErrors(prev => ({
        ...prev,
        startDate: true,
        endDate: true
      }));
      setNotification({
        visible: true,
        message: 'End date must be after start date',
        type: 'error'
      });
      setTimeout(() => setNotification({ visible: false }), 3000);
      return;
    }

    // Validate budget
    if (
      !formData.budgetAmount ||
      isNaN(formData.budgetAmount) ||
      Number(formData.budgetAmount) <= 0
    ) {
      setFieldErrors(prev => ({
        ...prev,
        budgetAmount: true
      }));
      setNotification({
        visible: true,
        message: 'Please enter a valid budget amount',
        type: 'error'
      });
      setTimeout(() => setNotification({ visible: false }), 3000);
      return;
    }

      // Check for blocked dates
  if (formData.startDate && isDateBlocked(formData.startDate)) {
    setNotification({
      visible: true,
      message: 'The selected start date has been blocked by administrators',
      type: 'error'
    });
    setTimeout(() => setNotification({ visible: false }), 3000);
    return;
  }

  if (formData.endDate && isDateBlocked(formData.endDate)) {
    setNotification({
      visible: true,
      message: 'The selected end date has been blocked by administrators',
      type: 'error'
    });
    setTimeout(() => setNotification({ visible: false }), 3000);
    return;
  }

    if (!formData.budgetFrom) {
      setFieldErrors(prev => ({
        ...prev,
        budgetFrom: true
      }));
      setNotification({
        visible: true,
        message: 'Please select a budget source',
        type: 'error'
      });
      setTimeout(() => setNotification({ visible: false }), 3000);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setNotification({
        visible: true,
        message: 'Authentication token not found. Please log in again.',
        type: 'error'
      });
      setTimeout(() => setNotification({ visible: false }), 3000);
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {
        formType: 'Project',
        ...formData,
        ...(userOrgId && { organizationId: userOrgId }), // Critical for budget validation
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        projectObjectives: formData.projectObjectives,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        venue: formData.venue,
        targetParticipants: formData.targetParticipants,
        projectGuidelines: formData.projectGuidelines,
        programFlow: formData.programFlow,
        projectHeads: formData.projectHeads,
        workingCommittees: formData.workingCommittees,
        taskDeligation: formData.taskDeligation,
        timelineSchedules: formData.timelineSchedules,
        schoolEquipments: formData.schoolEquipments,
        // Budget data
        budgetAmount: Number(formData.budgetAmount),
        budgetFrom: formData.budgetFrom,
        attachedBudget: formData.attachedBudget || undefined,
        budgetProposals: formData.budgetProposals
      };

      // Determine endpoint and method based on edit mode
      const url = isEditMode
        ? `https://studevent-server.vercel.app/api/forms/${formId}`
        : 'https://studevent-server.vercel.app/api/forms/submit';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      // Show success message
      setNotification({
        visible: true,
        message: `Project proposal ${isEditMode ? 'updated' : 'submitted'} successfully!`,
        type: 'success'
      });

      // Reset form if not in edit mode
      if (!isEditMode) {
        setFormData({
          projectTitle: '',
          projectDescription: '',
          projectObjectives: '',
          startDate: '',
          endDate: '',
          venue: '',
          targetParticipants: '',
          projectGuidelines: '',
          programFlow: [{ timeRange: '', segment: '' }],
          projectHeads: [{ headName: '', designatedOffice: '' }],
          workingCommittees: [{ workingName: '', designatedTask: '' }],
          taskDeligation: [{ taskList: '', deadline: '' }],
          timelineSchedules: [{ publicationMaterials: '', schedule: '' }],
          schoolEquipments: [{ equipments: '', estimatedQuantity: '' }],
          budgetAmount: '',
          budgetFrom: '',
          attachedBudget: null,
          budgetProposals: []
        });
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        visible: true,
        message: error.message || 'An error occurred while submitting the form.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ visible: false }), 3000);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Project Overview
        return (
          <div className="form-section">
            <div className="form-group">
              <label className="required-field">Project Title:</label>
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
              <label className="required-field">Project Description:</label>
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
              <label className="required-field">Objectives:</label>
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
                    onChange={date =>
                      handleChange({
                        target: {
                          name: 'startDate',
                          value: date ? date.toISOString() : ''
                        }
                      })
                    }
                    minDate={new Date()}
                    filterDate={date => {
                      const dateStr = normalizeDateToUTC(date);
                      const isBlocked = isDateBlocked(date);
                      const isOccupied = (eventsPerDate[dateStr] || 0) >= 3;
                      
                      return !isBlocked && !isOccupied;
                    }}
                    dayClassName={date => {
                      const dateStr = normalizeDateToUTC(date);
                      const count = eventsPerDate[dateStr] || 0;
                      const isBlocked = isDateBlocked(date);

                      if (isBlocked) return 'blocked-day';
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
                    className={`date-picker-input ${fieldErrors.startDate ? 'invalid-field' : ''}`}
                    placeholderText="Select start date and time"
                    popperPlacement="bottom-start"
                    disabled={loadingDates}
                    required
                  />
                  {fieldErrors.startDate && (
                    <div className="validation-error">
                      {formData.startDate && isDateBlocked(formData.startDate)
                        ? 'This date has been blocked by administrators'
                        : formData.startDate && 
                          eventsPerDate[moment(formData.startDate).format('YYYY-MM-DD')] >= 3
                        ? 'This date has reached the maximum number of events (3)'
                        : 'Start Date is required'}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="required-field">End Date:</label>
                  <DatePicker
                    selected={formData.endDate ? new Date(formData.endDate) : null}
                    onChange={date =>
                      handleChange({
                        target: {
                          name: 'endDate',
                          value: date ? date.toISOString() : ''
                        }
                      })
                    }
                    minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                    filterDate={date => {
                      const dateStr = normalizeDateToUTC(date);
                      const isBlocked = isDateBlocked(date);
                      const isOccupied = (eventsPerDate[dateStr] || 0) >= 3;
                      
                      return !isBlocked && !isOccupied;
                    }}
                    dayClassName={date => {
                      const dateStr = normalizeDateToUTC(date);
                      const count = eventsPerDate[dateStr] || 0;
                      const isBlocked = isDateBlocked(date);

                      if (isBlocked) return 'blocked-day';
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
                    className={`date-picker-input ${fieldErrors.endDate ? 'invalid-field' : ''}`}
                    placeholderText="Select end date and time"
                    popperPlacement="bottom-start"
                    disabled={loadingDates || !formData.startDate}
                    required
                  />
                  {fieldErrors.endDate && (
                    <div className="validation-error">
                      {formData.endDate && isDateBlocked(formData.endDate)
                        ? 'This date has been blocked by administrators'
                        : formData.endDate && 
                          eventsPerDate[moment(formData.endDate).format('YYYY-MM-DD')] >= 3
                        ? 'This date has reached the maximum number of events (3)'
                        : 'End Date is required'}
                    </div>
                  )}
                </div>
              </div>

            <div className="form-group">
              <label className="required-field">Venue:</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className={fieldErrors.venue ? 'invalid-field' : ''}
                required
              />
              {fieldErrors.venue && <div className="validation-error">Venue is required</div>}
            </div>

            <div className="form-group">
              <label className="required-field">Target Participants:</label>
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
              <label className="required-field">Guidelines:</label>
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
            <p className="section-description">
              Add the sequence of activities for your event. Specify time ranges and descriptions
              for each segment.
            </p>

            <div className="program-flow-container">
              <table className="program-flow-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>TIME RANGE</th>
                    <th style={{ width: '15%' }}>DURATION</th>
                    <th style={{ width: '45%' }}>SEGMENT DESCRIPTION</th>
                    <th style={{ width: '10%' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.programFlow.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td>
                        <TimeRangePicker
                          value={item.timeRange}
                          onChange={newRange => {
                            handleArrayChange('programFlow', index, {
                              target: { name: 'timeRange', value: newRange }
                            });
                          }}
                          error={fieldErrors.programFlow[index]?.timeRange}
                        />
                      </td>
                      <td>
                        <div className="duration-display-cell">
                          {item.timeRange && item.timeRange.includes('-')
                            ? calculateDurationDisplay(
                                convertToMinutes(item.timeRange.split('-')[1].trim()) -
                                  convertToMinutes(item.timeRange.split('-')[0].trim())
                              )
                            : '--'}
                        </div>
                      </td>
                      <td>
                        <div className="segment-input-container">
                          <textarea
                            name="segment"
                            value={item.segment}
                            onChange={e => handleArrayChange('programFlow', index, e)}
                            className={`segment-input ${
                              fieldErrors.programFlow[index]?.segment ? 'error' : ''
                            }`}
                            placeholder="Describe this program segment..."
                            rows={2}
                            required
                          />
                          {fieldErrors.programFlow[index]?.segment && (
                            <div className="validation-error">Segment description is required</div>
                          )}
                        </div>
                      </td>
                      <td className="actions-cell">
                        {index > 0 && (
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeArrayItem('programFlow', index)}
                            title="Remove this segment"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-footer">
                <button
                  type="button"
                  className="add-btn"
                  onClick={() =>
                    addArrayItem('programFlow', {
                      timeRange: '',
                      segment: ''
                    })
                  }
                >
                  + Add Another Segment
                </button>
              </div>
            </div>
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
                    <label className="required-field">Name:</label>
                    <input
                      type="text"
                      name="headName"
                      value={item.headName}
                      onChange={e => handleArrayChange('projectHeads', index, e)}
                      className={fieldErrors.projectHeads[index]?.headName ? 'error' : ''}
                      required
                    />
                    {fieldErrors.projectHeads[index]?.headName && (
                      <span className="validation-error">Name is required</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="required-field">Designated Office:</label>
                    <input
                      type="text"
                      name="designatedOffice"
                      value={item.designatedOffice}
                      onChange={e => handleArrayChange('projectHeads', index, e)}
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
              onClick={() => addArrayItem('projectHeads', { headName: '', designatedOffice: '' })}
            >
              Add Project Head
            </button>

            <h3>Working Committees</h3>
            {formData.workingCommittees.map((item, index) => (
              <div key={`committee-${index}`} className="array-item">
                <div className="form-row">
                  <div className="form-group">
                    <label className="required-field">Name:</label>
                    <input
                      type="text"
                      name="workingName"
                      value={item.workingName}
                      onChange={e => handleArrayChange('workingCommittees', index, e)}
                      className={fieldErrors.workingCommittees[index]?.workingName ? 'error' : ''}
                      required
                    />
                    {fieldErrors.workingCommittees[index]?.workingName && (
                      <span className="validation-error">Name is required</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="required-field">Designated Task:</label>
                    <input
                      type="text"
                      name="designatedTask"
                      value={item.designatedTask}
                      onChange={e => handleArrayChange('workingCommittees', index, e)}
                      className={
                        fieldErrors.workingCommittees[index]?.designatedTask ? 'error' : ''
                      }
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
              onClick={() =>
                addArrayItem('workingCommittees', { workingName: '', designatedTask: '' })
              }
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
                    <label className="required-field">Task List:</label>
                    <input
                      type="text"
                      name="taskList"
                      value={item.taskList}
                      onChange={e => handleArrayChange('taskDeligation', index, e)}
                      className={fieldErrors.taskDeligation[index]?.taskList ? 'error' : ''}
                      required
                    />
                    {fieldErrors.taskDeligation[index]?.taskList && (
                      <span className="validation-error">Task is required</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="required-field">Deadline:</label>
                    <input
                      type="date"
                      name="deadline"
                      value={item.deadline}
                      onChange={e => handleArrayChange('taskDeligation', index, e)}
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
              onClick={() => addArrayItem('taskDeligation', { taskList: '', deadline: '' })}
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
                    <label className="required-field">Publication Materials:</label>
                    <input
                      type="text"
                      name="publicationMaterials"
                      value={item.publicationMaterials}
                      onChange={e => handleArrayChange('timelineSchedules', index, e)}
                      required
                    />
                    {fieldErrors.timelineSchedules[index]?.publicationMaterials && (
                      <span className="validation-error">Publication Materials is required</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="required-field">Tentative date of Posting</label>
                    <input
                      type="date"
                      name="schedule"
                      value={item.schedule}
                      onChange={e => handleArrayChange('timelineSchedules', index, e)}
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
              onClick={() =>
                addArrayItem('timelineSchedules', { publicationMaterials: '', schedule: '' })
              }
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
                    <label className="required-field">Equipment:</label>
                    <input
                      type="text"
                      name="equipments"
                      value={item.equipments}
                      onChange={e => handleArrayChange('schoolEquipments', index, e)}
                      required
                    />
                    {fieldErrors.schoolEquipments[index]?.equipments && (
                      <span className="validation-error">Equipments is required</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="required-field">Estimated Quantity:</label>
                    <input
                      type="text"
                      name="estimatedQuantity"
                      value={item.estimatedQuantity}
                      onChange={e => handleArrayChange('schoolEquipments', index, e)}
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
              onClick={() =>
                addArrayItem('schoolEquipments', { equipments: '', estimatedQuantity: '' })
              }
            >
              Add Equipment
            </button>
          </div>
        );

      // 3. Update the budget section rendering
      case 7: // Budget Proposal
        return (
          <div className="form-section">
            <div className="budget-selection">
              <label className="required-field">Attached Budget Proposal:</label>
              <select
                name="attachedBudget"
                value={formData.attachedBudget || ''}
                onChange={e => {
                  const budgetId = e.target.value;
                  const selectedBudget = formData.budgetProposals.find(b => b._id === budgetId);

                  setFormData(prev => ({
                    ...prev,
                    attachedBudget: budgetId,
                    budgetAmount: selectedBudget?.grandTotal || '',
                    budgetFrom: selectedBudget?.nameOfRso || 'Org',
                    projectTitle: selectedBudget?.projectTitle || prev.projectTitle
                  }));
                }}
                className={fieldErrors.attachedBudget ? 'invalid-field' : ''}
              >
                <option value="">Select a budget proposal...</option>
                {formData.budgetProposals.map(budget => (
                  <option
                    key={budget._id}
                    value={budget._id}
                    selected={formData.attachedBudget === budget._id}
                  >
                    {budget.eventTitle} - ₱{budget.grandTotal?.toLocaleString()}
                    {budget.status ? ` (${budget.status})` : ''}
                  </option>
                ))}
              </select>
              {fieldErrors.attachedBudget && (
                <span className="validation-error">Please select a budget proposal</span>
              )}
            </div>

            {budgetLoadError && <div className="error-message">{budgetLoadError}</div>}

            <div className="form-group">
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
              {fieldErrors.budgetAmount && (
                <span className="validation-error">Budget amount is required</span>
              )}
            </div>

            <div className="form-group">
              <label className="required-field">Budget From:</label>
              <select
                name="budgetFrom"
                value={formData.budgetFrom}
                onChange={handleChange}
                readOnly={!!formData.attachedBudget}
                className={fieldErrors.budgetFrom ? 'invalid-field' : ''}
              >
                <option value="">Select An Option...</option>
                <option
                  value="College/Department"
                  selected={formData.budgetFrom === 'College/Department'}
                >
                  College/Department
                </option>
                <option value="Org" selected={formData.budgetFrom === 'Org'}>
                  Organization
                </option>
                <option value="SDAO" selected={formData.budgetFrom === 'SDAO'}>
                  SDAO
                </option>
              </select>
              {fieldErrors.budgetFrom && (
                <span className="validation-error">Budget source is required</span>
              )}
            </div>

            <p className="venue-note">
              Note: Budget amount is not automatically approved by this system. Please confirm
              budget availability separately with the budget management before submission.
            </p>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Update renderMobileStepTracker to use the ref from component level
  const renderMobileStepTracker = () => {
    const sectionNames = [
      'Project Overview',
      'Project Guidelines',
      'Program Flow',
      'Officers in Charge',
      'Task Delegation',
      'Timeline/Posting Schedules',
      'School Facilities & Equipment',
      'Budget Proposal'
    ];
    const progressWidth = `${(currentStep / (sectionNames.length - 1)) * 100}%`;

    return (
      <div className="mobile-step-tracker" ref={mobileStepTrackerRef}>
        <div className="steps">
          <div className="progress-line"></div>
          <div className="progress-line-filled" style={{ width: progressWidth }}></div>

          {sectionNames.map((label, index) => (
            <div
              key={index}
              className={`step-item ${currentStep === index ? 'active' : ''} ${
                isSectionComplete(index) ? 'completed' : ''
              }`}
              onClick={() => isSectionComplete(index) && setCurrentStep(index)}
            >
              <div className="step-number">
                {isSectionComplete(index) ? <FaCheck /> : index + 1}
              </div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="form-ubox-1">
      {notification.visible && (
        <Notification message={notification.message} type={notification.type} />
      )}
      <div className="sidebar">
        <ul>
          {[
            'Project Overview',
            'Project Guidelines',
            'Program Flow',
            'Officers in Charge',
            'Task Delegation',
            'Timeline/Posting Schedules',
            'School Facilities & Equipment',
            'Budget Proposal'
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
      {renderMobileStepTracker()}
      <div className="inner-forms-2">
        <h1>{isEditMode ? 'Edit Project Proposal' : 'Project Proposal Form'}</h1>
        {renderStepContent()}
        <div className="form-navigation">
          {currentStep > 0 && <button onClick={() => setCurrentStep(currentStep - 1)}>Back</button>}
          {currentStep < 7 ? (
            <button onClick={handleNext}>Next</button>
          ) : (
            <button onClick={handleSubmit}>
              {isEditMode ? 'Update Proposal' : 'Submit Proposal'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;
