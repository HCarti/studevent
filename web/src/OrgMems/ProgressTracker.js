  import React, { useState, useEffect } from 'react';
  import './ProgressTracker.css';
  import Stepper from '@mui/material/Stepper';
  import Step from '@mui/material/Step';
  import StepLabel from '@mui/material/StepLabel';
  import Button from '@mui/material/Button';
  import CheckCircleIcon from '@mui/icons-material/CheckCircle';
  import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
  import { useNavigate, useLocation } from 'react-router-dom';

  const ProgressTracker = ({currentUser}) => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const form = state?.form; // Retrieve form data from state
    const [eventId, setEventId] = useState(null); // Step 1: Define eventId state
    const [currentStep, setCurrentStep] = useState(0); // Track the current step
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
    const [isEditing, setIsEditing] = useState(false);
    const [isApprovedChecked, setIsApprovedChecked] = useState(false);
    const [isDeclinedChecked, setIsDeclinedChecked] = useState(false);


    const handleEditClick = () => {
      setIsEditing(true);
    };

    const handleSaveClick = (stepIndex) => {
      if (!eventId || !currentUser) {
        console.error('Missing eventId or currentUser');
        return;
      }
    
      const status = isApprovedChecked ? 'approved' : 'declined';
      const data = { status, remarks, eventId, userId: currentUser.id }; // Include userId
      const updatedStep = { status, remarks, stepIndex };
    
      // Emit the correct data including stepIndex
      
      // Update the local state
      setTrackerData((prevData) => {
        const updatedSteps = [...prevData.steps];
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          status,
          remarks,
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

    const handleViewForms = (form) => {
  console.log(form); // Check the content of the form object
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
          <div className="upper-row">
            <div className="progress-bar-container">
              {trackerData.steps.map((step, index) => {
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
                <Button variant="contained" className="action-button" key={form._id} onClick={() => handleViewForms(form)}>
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
