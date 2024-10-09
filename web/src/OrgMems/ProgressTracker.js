import React, { useState } from 'react';
import './ProgressTracker.css';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const ProgressTracker = () => {
  const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];


  return (
    <div className='prog-box'>
      <h3 style={{ textAlign: 'center' }}>Event Proposal Tracker</h3>
      <div className="progress-tracker">
        <div className="progress-bar-container">
          <div className="progress-bar">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`progress-step ${index <= steps.length - 1 ? 'active' : ''}`}
              />
            ))}
          </div>
          <div className="step-labels">
            {steps.map((step, index) => (
              <div key={index} className={`step-label`}>
                {step.label}
                <span className="timestamp">{step.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="remarks-section">
          <textarea placeholder="Remarks"></textarea>
          <button className="send-button">Send</button>
        </div>
        <div className="action-buttons">
          <button>DONE</button>
          <button>VIEW FORMS</button>
          <button>EDIT TRACKER</button>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
