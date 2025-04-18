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
  const [organizationId, setOrganizationId] = useState(null); // Using the userId of the organization

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser?.role); // Get the role
      setOrganizationId(parsedUser?._id); // Get the userId (which matches the organizationId in forms)
    }
  }, []);

  const handleForms = () => {
    if (!userRole) {
      alert("User role not found. Please log in again.");
      return;
    }

    if (userRole === 'Organization') {
      navigate('/forms');
    } else if (userRole === 'Admin' || userRole === 'Authority') {
      navigate('/trackerlist');
    } else {
      alert("Unauthorized access");
    }
  };

  const handleSig = () => {
    if (organizationId) {
      navigate(`/organization/${organizationId}/forms`); // Use the userId as the identifier
    } else {
      alert("Organization ID not found.");
    }
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
        <div className="link forms-link" onClick={handleForms}>
          FORMS<br />All forms are located here.
        </div>

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
