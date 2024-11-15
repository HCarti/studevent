import React from 'react';
import './Forms.css';
import { useNavigate } from 'react-router-dom';
import { FaFileContract, FaMoneyCheckAlt, FaProjectDiagram, FaClipboardList, FaMapMarkedAlt, FaMoneyBillWave } from 'react-icons/fa';

const Forms = ({ role }) => {
  const navigate = useNavigate();

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
      name: 'Waiver for Outside School',
      description: 'Required for events or organizations going outside the school.',
      icon: <FaFileContract />,
      path: '/waiver',
    },
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
      name: 'Liquidation',
      description: 'Submit liquidation forms for financial reconciliation.',
      icon: <FaMoneyBillWave />,
      path: '/liquidation',
    },
  ];

  return (
    <div className="f-box">
      <h1 className="f-title">Document Forms</h1>
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
