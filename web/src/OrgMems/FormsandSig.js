import React, { useEffect, useState } from 'react';
import './FormsandSig.css';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const FormsandSig = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role);
    }
  }, []);

  const handleForms = () => {
    if (userRole === 'Organization') {
      navigate('/forms'); // Organization users go to Forms page
    } else if (userRole === 'Admin' || userRole === 'Authority') {
      navigate('/trackerlist'); // Admins & Authorities go to EventTrackerList
    } else {
      alert("Unauthorized access"); // Optional: Handle unexpected roles
    }
  };

  const handleSig = () => {
    navigate('/my-submissions');
  };

  return (
    <div className="fs-container">
      <h1 className="fs-title">Forms and Signature</h1>
      <div className="steps">
        <div className="step">
          <FileCopyIcon className="step-icon" />
          <h2>Step 1</h2>
          <p>Fill out the form for your project proposal at the bottom, then click "Forms".</p>
        </div>
        <div className="step">
          <EditIcon className="step-icon" />
          <h2>Step 2</h2>
          <p>Submit the form to your Adviser after securing the organization president’s signature.</p>
        </div>
        <div className="step">
          <SupervisorAccountIcon className="step-icon" />
          <h2>Step 3</h2>
          <p>The Adviser reviews the form before forwarding it to the College Dean for final approval.</p>
        </div>
        <div className="step">
          <SearchIcon className="step-icon" />
          <h2>Step 4</h2>
          <p>Track your proposal status through the "Proposal Tracker" to see updates from the Adviser.</p>
        </div>
      </div>

      <div className="bottom-links">
        {/* FORMS button with role-based redirection */}
        <div className="link forms-link" onClick={handleForms}>
          FORMS<br />All forms are located here.
        </div>

        {/* Only show Proposal Tracker if the user is an Organization */}
        {userRole === 'Organization' && (
          <div className="link proposal-link" onClick={handleSig}>
            PROPOSAL TRACKER<br />Monitor all proposals here.
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsandSig;
