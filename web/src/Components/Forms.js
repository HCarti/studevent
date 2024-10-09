import React from 'react'
import './Forms.css';
import { useNavigate } from 'react-router-dom';


const Forms = () => {

  const navigate = useNavigate();

  const handleWaiver = () => {
    console.log("Waiver for Outside School Forms has been clicked");
    navigate('/waiver');
  };

  const handleActivity = () => {
    console.log("Activity Application Forms has been clicked");
    navigate('/activity');
  };

  const handleProject = () => {
    console.log("Project Proposal Forms has been clicked");
    navigate('/project');
  };

  const handleBudget = () => {
    console.log("Budget Proposal Forms has been clicked");
    navigate('/budget');
  };

  const handleLocal = () => {
    console.log("Local Off Campus Forms has been clicked");
    navigate('/local');
  };

  const handleLiquidation= () => {
    console.log("Liquidation Forms has been clicked");
    navigate('/liquidation');
  };



  return (
    <div className="f-box">
      <h1 className="f-title">Document Forms</h1>
      <div className="papers-box">
        <div className="fo-box-1">
          <div className="fi-box-1" onClick={handleWaiver}>
            <h2 className="form">Waiver for Outside School</h2>
            <p>If the event or the organization going to event outside the school, must be required on this form</p>
          </div>
          <div className="fi-box-1" onClick={handleBudget}>
            <h2 className="form">Budget Proposal</h2>
            <p>If the organization must request a budget from school</p>
          </div>
          <div className="fi-box-1" onClick={handleProject}>
            <h2 className="form">Project Proposal</h2>
            <p>Is a form intended to lay out the plan and details of the event</p>
          </div>
        </div>
        <div className="fo-box-2">
          <div className="fi-box-1" onClick={handleActivity}>
            <h2 className="form">Activity Application Form</h2>
            <p>Activity Application Form is a form that can request for school and admin to create an event</p>
          </div>
          <div className="fi-box-1" onClick={handleLocal}>
            <h2 className="form">Local Off-Campus Form</h2>
            <p>This form is about having an event outside the campus</p>
          </div>
          <div className="fi-box-1" onClick={handleLiquidation}>
            <h2 className="form">Liquidation</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Forms