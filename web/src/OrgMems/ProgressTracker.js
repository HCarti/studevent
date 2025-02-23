import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
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
  const { formId } = useParams(); // Get formId from the URL

  const [currentStep, setCurrentStep] = useState(0);
  const [trackerData, setTrackerData] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isApprovedChecked, setIsApprovedChecked] = useState(false);
  const [isDeclinedChecked, setIsDeclinedChecked] = useState(false);

  useEffect(() => {
    if (!form?._id) return;

    // Fetch tracker data from backend
    const fetchTrackerData = async () => {
      try {
        console.log("Form ID before fetch:", formId); // Debugging
    
        if (!formId) {
          throw new Error("Form ID is missing. Unable to fetch tracker data.");
        }
    
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }
    
        const response = await fetch(`https://studevent-server.vercel.app/api/tracker/${formId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error(`Error fetching tracker data: ${response.statusText}`);
        }
    
        const data = await response.json();
        console.log("Fetched tracker data:", data); // Debugging
        setTrackerData(data);
      } catch (error) {
        console.error("Error fetching tracker data:", error.message);
      }
    };
    
    fetchTrackerData();
  }, [form]);

  if (!trackerData) return <p>Loading...</p>;

  // Toggle edit mode
  const handleEditClick = () => setIsEditing(true);

  // Save progress tracker
  const handleSaveClick = async () => {
    if (!trackerData) return;

    const status = isApprovedChecked ? 'approved' : 'declined';
    const updatedSteps = [...trackerData.steps];
    updatedSteps[currentStep] = {
      ...updatedSteps[currentStep],
      status,
      remarks,
      color: status === 'approved' ? 'green' : 'red',
      timestamp: Date.now(),
    };

    let nextStep = currentStep;
    let nextAuthority = null;

    if (status === 'approved' && currentStep < updatedSteps.length - 1) {
      nextStep += 1;
      nextAuthority = updatedSteps[nextStep].label;
    }

    try {
      const response = await fetch(`https://studevent-server.vercel.app/api/tracker/${form._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}` // Include token
        },
        body: JSON.stringify({
          currentStep: nextStep,
          status,
          remarks,
          steps: updatedSteps,
          currentAuthority: nextAuthority,
        }),
      });      

      if (!response.ok) throw new Error('Failed to update progress tracker');

      setTrackerData(prevData => ({
        ...prevData,
        currentStep: nextStep,
        steps: updatedSteps,
        currentAuthority: nextAuthority,
      }));
      
      setCurrentStep(nextStep);
    } catch (error) {
      console.error('Error updating progress tracker:', error);
    }

    setIsEditing(false);
    setIsApprovedChecked(false);
    setIsDeclinedChecked(false);
  };

  // Toggle checkboxes logic
  const handleCheckboxChange = (checkbox) => {
    setIsApprovedChecked(checkbox === 'approved');
    setIsDeclinedChecked(checkbox === 'declined');
  };

  // Navigate to form details
  const handleViewForms = () => {
    navigate(`/formdetails/${form._id}`, { state: { form } });
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
                  disabled={isDeclinedChecked} // Disable if declined is checked
                /> Reviewed and Approved
              </label>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isDeclinedChecked}
                  onChange={() => handleCheckboxChange('declined')}
                  disabled={isApprovedChecked} // Disable if approved is checked
                /> Declined
              </label>
            </div>
            <textarea
              style={{ fontFamily: 'Arial', overflow: 'hidden', width: '100%' }}
              placeholder='Remarks'
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <Button variant="contained" className="save-button" onClick={handleSaveClick}>
              SAVE
            </Button>
          </div>
        ) : (
          <div className="action-buttons">
            <Button variant="contained" className="action-button" onClick={handleViewForms}>
              VIEW FORMS
            </Button>
            <Button variant="contained" className="action-button" onClick={handleEditClick}>
              EDIT TRACKER
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
