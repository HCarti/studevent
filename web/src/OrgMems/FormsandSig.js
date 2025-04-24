import React, { useEffect, useState, useRef } from 'react';
import './FormsandSig.css';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SearchIcon from '@mui/icons-material/Search';
import FaceIcon from '@mui/icons-material/Face';
import { useNavigate } from 'react-router-dom';

const FormsandSig = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser?.role);
      setOrganizationId(parsedUser?._id);
    }
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

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
      navigate(`/organization/${organizationId}/forms`);
    } else {
      alert("Organization ID not found.");
    }
  };

  return (
    <div className="fs-container">
      <h1 className="fs-title">Forms and Signature</h1>

      {/* Icon to toggle modal */}
{/* Icon with tooltip for clarity */}
<div className="help-icon" onClick={() => setShowModal(!showModal)}>
  <div className="help-tooltip">Click me</div>
  <FaceIcon style={{ fontSize: '60px', color: '#2563eb' }} />
</div>

      {showModal && (
        <div className="modal-bottom-right-overlay">
          <div className="modal-content small" ref={modalRef}>

            <h2>Instructions</h2>
            <p>To use the forms and signature feature, follow these steps:</p>

            <h3>Step 1: Go to the forms</h3>
            <p><strong></strong> You must select and create forms and then there will be a progress tracker created specifically for that form
            </p>

            <h3>Step 2: Go to the Progress Tracker</h3>
            <p><strong></strong> Inside the progress tracker are the forms you created. You can see the progress of the forms you created.</p>
          </div>
        </div>
      )}

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
