import React from 'react';
import './FormsandSig.css';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const FormsandSig = () => {

  const navigate = useNavigate();

  const handleForms = () => {
    console.log("Forms has been clicked");
    navigate('/forms');
  };

  const handleSig = () => {
    console.log("signature tracker has been clicked");
    navigate('/sigtrack');
  };
  

  return (
    <div className="fs-box">
      <h1 className="fs-title">FORMS AND SIGNATURE</h1>
      <div className="steps">
        <div className="step s1">
          <FileCopyIcon className="step-icon" />
          <h2>STEP 1</h2>
          <p>Answer the form you want to approve in your project proposal located at the bottom and click "FORMS"</p>
        </div>
        <div className="step s2">
          <EditIcon className="step-icon" />
          <h2>STEP 2</h2>
          <p>After answering the form you must submit to your Adviser. Remember that organization president must always have a signature before giving it to the adviser.</p>
        </div>
        <div className="step s3">
          <SupervisorAccountIcon className="step-icon" />
          <h2>STEP 3</h2>
          <p>Organization Adviser will review the form. After reviewing the form, Adviser will give it to College Dean to be approved and reviewed.</p>
        </div>
        <div className="step s4">
          <SearchIcon className="step-icon" />
          <h2>STEP 4</h2>
          <p>Visit the "Proposal Tracker" to track your proposal in Forms/Signature page. Rejected or Approved, the Organization’s Office must see their adviser to give them an update about the proposal.</p>
        </div>
      </div>
      <div className="bottom-links">
        <div className="link forms-link" onClick={handleForms}>FORMS<br />ALL FORMS FROM SDAO ARE LOCATED HERE.</div>
        <div className="link proposal-link" onClick={handleSig}>PROPOSAL TRACKER<br />ALL PROPOSALS ARE HERE FOR MONITORING PROCESS</div>
      </div>
    </div>
  );
}

export default FormsandSig;
