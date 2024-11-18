import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgressTracker.css';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useNavigate, useLocation } from 'react-router-dom';

const ProgressTracker = ({ currentUser }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const form = state?.form;
  const [currentStep, setCurrentStep] = useState(0);
  const [trackerData, setTrackerData] = useState({
    steps: [
      { label: 'Reviewed and Signed by Adviser', color: 'yellow', timestamp: Date.now() },
      { label: 'Reviewed and Signed by College Dean', color: 'yellow', timestamp: Date.now() },
      { label: 'Reviewed and Signed by Academic Services', color: 'yellow', timestamp: Date.now() },
      { label: 'Reviewed and Signed by Executive Director', color: 'yellow', timestamp: Date.now() }
    ]
  });
  const [remarks, setRemarks] = useState('');
  const [forms, setForms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isApprovedChecked, setIsApprovedChecked] = useState(false);
  const [isDeclinedChecked, setIsDeclinedChecked] = useState(false);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('/api/progress-tracker', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setForms(response.data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };
  
    if (currentUser.role === 'Authority') {
      fetchForms();
    }
  }, [currentUser.role]); // Dependency on `currentUser.role`
  

  // Toggle edit mode
  const handleEditClick = () => setIsEditing(true);

  // Save the current step's approval or decline action
  const handleSaveClick = async () => {
    const status = isApprovedChecked ? 'approved' : 'declined';
  
    setTrackerData((prevData) => {
      const updatedSteps = [...prevData.steps];
      updatedSteps[currentStep] = {
        ...updatedSteps[currentStep],
        status,
        remarks,
        color: status === 'approved' ? 'green' : 'red',
        timestamp: Date.now(),
      };
  
      return { ...prevData, steps: updatedSteps };
    });
  
    // Prepare the next authority
    let nextAuthority = null;
    if (status === 'approved' && currentStep < trackerData.steps.length - 1) {
      nextAuthority = trackerData.steps[currentStep + 1].label.split(' ')[3]; // Example: Extract "College Dean"
      setCurrentStep(currentStep + 1);
    }
  
    try {
      // Send updated data to the backend
      await fetch(`/api/forms/${form._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          remarks,
          currentAuthority: nextAuthority,
        }),
      });
      console.log('Progress tracker updated successfully');
    } catch (error) {
      console.error('Error updating progress tracker:', error);
    }
  
    setIsEditing(false);
    setIsApprovedChecked(false);
    setIsDeclinedChecked(false);
  };
  

  const handleCheckboxChange = (checkbox) => {
    setIsApprovedChecked(checkbox === 'approved');
    setIsDeclinedChecked(checkbox === 'declined');
  };

  const handleViewForms = () => {
    if (!form || !form._id) {
      console.error("Form data is missing or does not contain _id");
      return;
    }
    localStorage.setItem('selectedForm', JSON.stringify(form));
    navigate(`/formdetails/${form._id}`);
  };

  return (
    <div className='prog-box'>
      <h3 style={{ textAlign: 'center' }}>Event Proposal Tracker</h3> 
      <div className="progress-tracker">
        <div className="progress-bar-container">
          {trackerData.steps.map((step, index) => {
            const canShowStep = index <= currentStep || trackerData.steps.slice(0, index).every(prevStep => prevStep.color === 'green' || prevStep.color === 'red');

            return canShowStep ? (
              <div key={index} className="step-container">
                <div className="progress-step">
                  {step.color === 'green' ? (
                    <CheckCircleIcon style={{ color: '#4caf50', fontSize: 24 }} />
                  ) : (
                    <RadioButtonUncheckedIcon style={{ color: step.color === 'red' ? 'red' : '#ffeb3b', fontSize: 24 }} />
                  )}
                </div>
                <div className="step-label">
                  {step.label}
                  <span className="timestamp">{new Date(step.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ) : null;
          })}
        </div>

        {isEditing ? (
          <div className="edit-tracker">
            <h3 className="edit-tracker-title">EDIT TRACKER</h3>
            <div className="edit-tracker-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isApprovedChecked}
                  onChange={() => handleCheckboxChange('approved')}
                /> Reviewed and Approved
              </label>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isDeclinedChecked}
                  onChange={() => handleCheckboxChange('declined')}
                /> Declined
              </label>
            </div>
            <Button variant="contained" className="save-button" onClick={handleSaveClick}>
              SAVE
            </Button>
          </div>
        ) : (
          <div className="remarks-section">
            <textarea
              style={{ fontFamily: 'Arial', overflow: 'hidden' }}
              placeholder='Remarks'
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        )}

        <div className="action-buttons">
          {isEditing ? (
            <Button variant="contained" className="action-button" onClick={handleSaveClick}>
              SAVE
            </Button>
          ) : (
            <>
              <Button variant="contained" className="action-button" onClick={handleViewForms}>
                VIEW FORMS
              </Button>
              <Button variant="contained" className="action-button" onClick={handleEditClick}>
                EDIT TRACKER
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
