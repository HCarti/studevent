import React, { useState, useEffect } from 'react';
import './ProgressTracker.css';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');  // Connect to the backend server

const ProgressTracker = () => {
  const navigate = useNavigate();
  // Set initial dummy tracker data for testing
  const [trackerData, setTrackerData] = useState({
    steps: [
      { label: 'Submitted to Adviser', color: 'yellow', timestamp: Date.now() },
      { label: 'Reviewed and Signed by Adviser', color: 'yellow', timestamp: Date.now() },
      { label: 'Reviewed and Signed by college dean', color: 'yellow', timestamp: Date.now() },
      { label: 'Reviewed and Signed by Academic Services', color: 'yellow', timestamp: Date.now() },
      { label: 'Reviewed and Signed by Executive Director', color: 'yellow', timestamp: Date.now() }
    ]
  });
  const [remarks, setRemarks] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State for editing mode
  const [isApprovedChecked, setIsApprovedChecked] = useState(false); // State for Approved checkbox
  const [isDeclinedChecked, setIsDeclinedChecked] = useState(false); // State for Declined checkbox

  const eventId = 'YOUR_EVENT_ID';  // Replace with the actual event ID

  useEffect(() => {
    // Skipping fetch for now to display dummy data
    /*
    fetch(`/trackers/${eventId}`)
      .then(response => response.json())
      .then(data => setTrackerData(data))
      .catch(error => console.error('Error fetching tracker:', error));
    */
    
    // Listen for real-time updates via socket
    socket.on('trackerUpdated', (updatedTracker) => {
      setTrackerData(updatedTracker);
    });

    return () => {
      socket.off('trackerUpdated');
    };
  }, [eventId]);

  const handleEditClick = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleSaveClick = (stepIndex) => {
    const status = isApprovedChecked ? 'approved' : 'declined';
    const data = { status, remarks };

    // Simulate sending update request to backend
    setTrackerData((prevData) => {
      const updatedSteps = [...prevData.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status,
        color: status === 'approved' ? 'green' : 'red',
        timestamp: Date.now(),
      };
      return { ...prevData, steps: updatedSteps };
    });
    setIsEditing(false);
  };

  const handleCheckboxChange = (checkbox) => {
    if (checkbox === 'approved') {
      setIsApprovedChecked(true);
      setIsDeclinedChecked(false);
    } else if (checkbox === 'declined') {
      setIsApprovedChecked(false);
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
            {trackerData.steps.map((step, index) => {
              // Only show step if all previous steps are completed (either green or red)
              const canShowStep = index === 0 || trackerData.steps.slice(0, index).every(prevStep => prevStep.color === 'green' || prevStep.color === 'red');

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
              <Button variant="contained" className="save-button" onClick={() => handleSaveClick(0)}>
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
