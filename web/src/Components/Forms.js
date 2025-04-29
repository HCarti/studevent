import React, { useState, useEffect, useRef } from 'react';
import './Forms.css';
import { useNavigate } from 'react-router-dom';
import FaceIcon from '@mui/icons-material/Face';
import { FaFileContract, FaMoneyCheckAlt, FaProjectDiagram, FaClipboardList, FaMapMarkedAlt, FaMoneyBillWave } from 'react-icons/fa';


const Forms = ({ role }) => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef();

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
      name: 'Local Off-Campus Form',
      description: 'For events outside the campus.',
      icon: <FaMapMarkedAlt />,
      path: '/localoffcampus',
    },
    {
      name: 'Liquidation Form',
      description: 'After Event Form.',
      icon: <FaMoneyBillWave />,
      path: '/liquidation',
    },
  ];

  return (
    <div className="f-box">
      <h1 className="f-title">Document Forms</h1>
      {/* Instruction Icon */}

      <div className="help-icon" onClick={() => setShowModal(!showModal)}>
  <div className="help-tooltip">Click me</div>
  <FaceIcon style={{ fontSize: '60px', color: '#2563eb' }} />
</div>


{/* Instruction Modal */}
{showModal && (
  <div className="modal">
    <div className="modal-content small" ref={modalRef}>
      <h3>Instructions for Document Forms</h3>
      <ul>
        <li>Create First a Budget Proposal before creating an event proposal.</li>
        <li>Complete all required fields and attach necessary files.</li>
        <li>After submission, your form will be submitted to the first reviewee for approval.</li>
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
