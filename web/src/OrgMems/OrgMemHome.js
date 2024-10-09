import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OrgMemHome.css';
import StudeventLogo from '../Images/Studevent.png';
import { FaWpforms } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoPersonCircleOutline } from "react-icons/io5";

const OrgMemHome = () => {

  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null); // New state to hold the current organization

  useEffect(() => {
      const fetchOrganizations = async () => {
          try {
              const response = await axios.get('http://localhost:8000/api/users');
              const filteredOrganizations = response.data.filter(user => user.role === 'Organization');
              setOrganizations(filteredOrganizations);
              if (filteredOrganizations.length > 0) {
                setCurrentOrganization(filteredOrganizations[0]); // Set the first organization as the current one (adjust this logic as needed)
              }
          } catch (error) {
              console.error('Error fetching organizations:', error);
          }
      };

      fetchOrganizations();
  }, []);

  const navigate = useNavigate();
  const [clickedButton, setClickedButton] = useState(null);
  
  const handleButtonClick = (button) => {
    setClickedButton(button);
    setTimeout(() => {
      if (button === 'events') navigate('/orgcalendar');
    }, 500);
  };

  const handleFormsClick = () => {
    handleButtonClick('forms');
    console.log("Forms/Signature clicked");
    navigate('/forms');
  };

  const handleEventsClick = () => {
    handleButtonClick('events');
    console.log("Events clicked");
  };

  const handleProfileClick = () => {
    handleButtonClick('profile');
    console.log("Profile clicked");
    navigate('/orgprof');
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    console.log("Logout has been clicked");
  };

  return (
    <div className="orgmem-page">
      <header className="header">
        <img src={StudeventLogo} alt="Studevent Logo" />
        {/* Dynamically render the organization type next to "Welcome" */}
        <h2>Welcome, {currentOrganization ? `${currentOrganization.organizationType}` : 'Loading...'}</h2>
        <div className='btns'>
          <div className={`events-btn ${clickedButton === 'events' ? 'clicked' : ''}`}>
            <h3 onClick={handleEventsClick}>
              <FaRegCalendarAlt style={{ fontSize: '40px', color: '#0175c8' }} /> Calendar
            </h3>
          </div>
          <div className={`forms-btn ${clickedButton === 'forms' ? 'clicked' : ''}`}>
            <h3 onClick={handleFormsClick}>
              <FaWpforms style={{ fontSize: '40px', color: '#0175c8' }} /> Forms/Signature
            </h3>
          </div>
          <div className={`profile-btn ${clickedButton === 'profile' ? 'clicked' : ''}`}>
            <h3 onClick={handleProfileClick}>
              <IoPersonCircleOutline style={{ fontSize: '40px', color: '#0175c8' }} /> Profile
            </h3>
          </div>
        </div>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
    </div>
  );
};

export default OrgMemHome;
