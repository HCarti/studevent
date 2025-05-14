import React, { useEffect, useState, useRef } from 'react';
import './FormsandSig.css';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SearchIcon from '@mui/icons-material/Search';
import FaceIcon from '@mui/icons-material/Face';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const FormsandSig = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const modalRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser?.role);
      setOrganizationId(parsedUser?._id);
    }

    // Handle responsive rendering
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setShowModal(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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
    } else if (userRole === 'Admin' || userRole === 'Authority' || userRole === 'SuperAdmin') {
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

  const handleStepClick = (stepNumber) => {
    setActiveStep(stepNumber);
  };

  const closeStepModal = () => {
    setActiveStep(null);
  };

  const steps = [
    {
      icon: <FileCopyIcon className="step-icon" />,
      title: "Step 1",
      description: "Fill out the form for your project proposal at the bottom, then click 'Forms'.",
      details: "This is where you'll start your project proposal process. Make sure to fill out all required fields accurately and completely. The form will guide you through the necessary information needed for your project proposal."
    },
    {
      icon: <EditIcon className="step-icon" />,
      title: "Step 2",
      description: "Submit the form to your Adviser after securing the organization president's signature.",
      details: "After completing the form, you'll need to get it signed by your organization president. This signature indicates that your organization supports the proposed project. Once signed, you can submit it to your adviser for review."
    },
    {
      icon: <SupervisorAccountIcon className="step-icon" />,
      title: "Step 3",
      description: "The Adviser reviews the form before forwarding it to the College Dean for final approval.",
      details: "Your adviser will carefully review your proposal and may provide feedback or request changes. They will ensure that the proposal meets all requirements before forwarding it to the College Dean for final approval."
    },
    {
      icon: <SearchIcon className="step-icon" />,
      title: "Step 4",
      description: "Track your proposal status through the 'Proposal Tracker' to see updates from the Adviser.",
      details: "Use the Proposal Tracker to monitor the progress of your proposal. You'll be able to see real-time updates on the status of your proposal, including any feedback or approvals from your adviser or the College Dean."
    }
  ];

  return (
    <div className="fs-container">
      <h1 className="fs-title">Forms and Signature</h1>

      {/* Icon to toggle modal */}
      {!isMobile && (
        <div className="help-icon" onClick={() => setShowModal(!showModal)}>
          <div className="help-tooltip">Click me</div>
          <FaceIcon style={{ fontSize: '60px', color: '#2563eb' }} />
        </div>
      )}

      {showModal && !isMobile && (
        <div className="modal-bottom-right-overlay">
          <div className="modal-content small" ref={modalRef}>
            <h2>Instructions</h2>
            <p>To use the forms and signature feature, follow these steps:</p>
            <h3>Step 1: Go to the forms</h3>
            <p><strong></strong> You must select and create forms and then there will be a progress tracker created specifically for that form</p>
            <h3>Step 2: Go to the Progress Tracker</h3>
            <p><strong></strong> Inside the progress tracker are the forms you created. You can see the progress of the forms you created.</p>
          </div>
        </div>
      )}

      <div className="steps">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="step"
            onClick={() => handleStepClick(index + 1)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStepClick(index + 1);
              }
            }}
          >
            {step.icon}
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      {/* Step Modal */}
      {activeStep && (
        <div className="modal-overlay" onClick={closeStepModal}>
          <div className="modal-content step-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeStepModal}>
              <CloseIcon />
            </button>
            <div className="step-modal-content">
              {steps[activeStep - 1].icon}
              <h2>{steps[activeStep - 1].title}</h2>
              <p className="step-description">{steps[activeStep - 1].description}</p>
              <p className="step-details">{steps[activeStep - 1].details}</p>
            </div>
          </div>
        </div>
      )}

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
