import React, { useState } from 'react';
import './ProgressTracker.css';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useNavigate } from 'react-router-dom';

const ProgressTracker = () => {
  const navigate = useNavigate();

  const steps = [
    { label: 'Submitted to Adviser', timestamp: '12:30pm 3/11/24', color: 'yellow' },
    { label: 'Reviewed and Signed by Adviser', timestamp: '1:30pm 3/11/24', color: 'green' },
    { label: 'Reviewed and Approved by College Dean', timestamp: '2:45pm 3/11/24', color: 'green' },
    { label: 'Submitted to SDAO', timestamp: '11:00am 3/12/24', color: 'yellow' },
    { label: 'Reviewed and Approved by SDAO', timestamp: '1:00pm 3/12/24', color: 'green' }
  ];

  const [remarks, setRemarks] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Add state for editing mode
  const [isApprovedChecked, setIsApprovedChecked] = useState(false); // State for Approved checkbox
  const [isDeclinedChecked, setIsDeclinedChecked] = useState(false); // State for Declined checkbox

  const handleEditClick = () => {
    setIsEditing(true); // Enable editing mode when "EDIT TRACKER" is clicked
  };

  const handleSaveClick = () => {
    setIsEditing(false); // Disable editing mode when "SAVE" or "UPDATE TRACKER" is clicked
  };


  // Function to handle checkbox selection logic
  const handleCheckboxChange = (checkbox) => {
    if (checkbox === 'approved') {
      setIsApprovedChecked(true);
      setIsDeclinedChecked(false); // Disable the Declined checkbox when Approved is checked
    } else if (checkbox === 'declined') {
      setIsApprovedChecked(false); // Disable the Approved checkbox when Declined is checked
      setIsDeclinedChecked(true);
    }
  };

  const handleViewForms = () => {
    navigate('/adminformview');
  };


  return (
    <div className='prog-box'>
      <h3 style={{ textAlign: 'center' }}>Event Proposal Tracker</h3>
      <div className="progress-tracker">
        <div className="upper-row">
          {/* Progress Bar and Steps */}
          <div className="progress-bar-container">
            {steps.map((step, index) => (
              <div key={index} className="step-container">
                <div className="progress-step">
                  {step.color === 'green' ? (
                    <CheckCircleIcon style={{ color: '#4caf50', fontSize: 24 }} />
                  ) : (
                    <RadioButtonUncheckedIcon style={{ color: '#ffeb3b', fontSize: 24 }} />
                  )}
                </div>
                <div className="step-label">
                  {step.label}
                  <span className="timestamp">{step.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Remarks or Edit Tracker */}
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
                onChange={(e) => setRemarks(e.target.value)}
              />
              <Button variant="contained" className="send-button">
                Send
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="action-buttons">
          {isEditing ? (
            <>
              <Button variant="contained" className="action-button">
                SEND
              </Button>
              <Button variant="contained" className="action-button">
                UPDATE TRACKER
              </Button>
            </>
          ) : (
            <>
              <Button variant="contained" className="action-button">
                DONE
              </Button>
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
