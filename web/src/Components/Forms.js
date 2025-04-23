import React, { useState, useEffect } from 'react';
import './Forms.css';
import { useNavigate } from 'react-router-dom';
import FaceIcon from '@mui/icons-material/Face';
import { FaFileContract, FaMoneyCheckAlt, FaProjectDiagram, FaClipboardList, FaMapMarkedAlt, FaMoneyBillWave } from 'react-icons/fa';

const Forms = ({ role }) => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

useEffect(() => {
  const hasSeenInstructions = localStorage.getItem('seenFormsInstructions');
  if (!hasSeenInstructions) {
    setShowModal(true);
    localStorage.setItem('seenFormsInstructions', 'true');
  }
}, []);

const handleCloseModal = (e) => {
  if (e.target.className === 'modal') {
    setShowModal(false);
  }
};


  const handleNavigation = (path, formName) => {
    console.log(`${formName} has been clicked`);
    if (role === 'Admin' || role === 'Authority') {
      navigate('/adminformview');
    } else {
      navigate(path);
    }
  };

  const formsData = [
    {
      name: 'Budget Proposal',
      description: 'Request a budget from the school.',
      icon: <FaMoneyCheckAlt />,
      path: '/budget',
    },
    {
      name: 'Project Proposal',
      description: 'Layout the plan and details of the event.',
      icon: <FaProjectDiagram />,
      path: '/project',
    },
    {
      name: 'Activity Application Form',
      description: 'Request the school and admin to create an event.',
      icon: <FaClipboardList />,
      path: '/activity',
    },
    {
      name: 'Liquidation Form',
      description: 'After Event Form.',
      icon: <FaMoneyBillWave />,
      path: '/liquidation',
    },
    {
      name: 'Local Off-Campus Form',
      description: 'For events outside the campus.',
      icon: <FaMapMarkedAlt />,
      path: '/localoffcampus',
    },
  ];

  return (
    <div className="f-box">
      <h1 className="f-title">Document Forms</h1>
      {/* Instruction Icon */}

<div
  className="help-icon"
  title="Need help?"
  onClick={() => setShowModal(!showModal)}
>
  <FaceIcon style={{ fontSize: '60px', color: '#0ea5e9', cursor: 'pointer' }} />
</div>


{/* Instruction Modal */}
{showModal && (
  <div className="modal" onClick={handleCloseModal}>
    <div className="modal-content small">
      <h3>Instructions for Document Forms</h3>
      <ul>
        <li>Select the appropriate form for your activity.</li>
        <li>Complete all required fields and attach necessary files.</li>
        <li>After submission, your form will be routed to your Adviser and Dean for review.</li>
        <li>You can monitor the status in the Proposal Tracker.</li>
      </ul>
    </div>
  </div>
)}

      <div className="papers-box">
        {formsData.map((form, index) => (
          <div
            key={index}
            className="fi-box-1"
            onClick={() => handleNavigation(form.path, form.name)}
          >
            <div className="icon">{form.icon}</div>
            <h2 className="form">{form.name}</h2>
            <p>{form.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forms;
