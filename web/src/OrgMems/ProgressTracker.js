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
  const [trackerData, setTrackerData] = useState(null);  // State to store tracker data
  const [remarks, setRemarks] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State for editing mode
  const [isApprovedChecked, setIsApprovedChecked] = useState(false); // State for Approved checkbox
  const [isDeclinedChecked, setIsDeclinedChecked] = useState(false); // State for Declined checkbox

  const eventId = 'YOUR_EVENT_ID';  // Replace with the actual event ID

  useEffect(() => {
    // Fetch the tracker data when the component mounts
    fetch(`/trackers/${eventId}`)
      .then(response => response.json())
      .then(data => setTrackerData(data))
      .catch(error => console.error('Error fetching tracker:', error));

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
    // Prepare the status (approved or declined)
    const status = isApprovedChecked ? 'approved' : 'declined';

    const data = { 
      status, 
      remarks 
    };

    // Send the update request to the backend
    fetch(`/trackers/${eventId}/step/${stepIndex}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(updatedTracker => {
      socket.emit('updateTracker', updatedTracker); // Notify server of the update
      setTrackerData(updatedTracker);  // Update the tracker data in state
      setIsEditing(false);  // Exit editing mode
    })
    .catch(error => console.error('Error updating tracker:', error));
  };

  // Handle checkbox selection logic
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

  if (!trackerData) {
    return <div>Loading tracker data...</div>;
  }

  return (
    <div className='prog-box'>
      <h3 style={{ textAlign: 'center' }}>Event Proposal Tracker</h3>
      <div className="progress-tracker">
        <div className="upper-row">
          {/* Progress Bar and Steps */}
          <div className="progress-bar-container">
            {trackerData.steps.map((step, index) => (
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
              <Button variant="contained" className="save-button" onClick={() => handleSaveClick(0)}> {/* You need to set the correct stepIndex */}
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
