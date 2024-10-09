import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';
import StudeventLogo from '../Images/Studevent.png';
import { FaWpforms } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FaPaperPlane } from "react-icons/fa";

const AdminHome = () => {
  const navigate = useNavigate();
  const [clickedButton, setClickedButton] = useState(null);



  const handleButtonClick = (button) => {
    setClickedButton(button);
  };

  const handleFormsClick = () => {
    handleButtonClick('forms');
    console.log("Forms/Signature clicked");
    navigate('/forms');
  };

  const handleEventsClick = () => {
    handleButtonClick('events');
    console.log("Events clicked");
    navigate('/orgcalendar')
  };

  const handleProfileClick = () => {
    handleButtonClick('profile');
    console.log("Profile clicked");
    navigate('/adminprofile')

  };

  const handleDashboardClick = () => {
    handleButtonClick('dashboard');
    console.log("Dashboard clicked");
    navigate('/dashboard');

  };

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/")
  }

  return (
    
      <div className="orgmem-page">
        <header className="header">
          <img src={StudeventLogo} alt="Studevent Logo" />
          <h2>Welcome, Admin!</h2>
          <div className='btns'>
            <div className={`events-btn ${clickedButton === 'events' ? 'clicked' : ''}`}>
              <h3 onClick={handleEventsClick}>
                <IoCalendarOutline style={{ fontSize: '50px', color: '#0175c8' }} /> Calendar
              </h3>
            </div>
            <div className={`forms-btn ${clickedButton === 'forms' ? 'clicked' : ''}`}>
              <h3 onClick={handleFormsClick}>
                <FaWpforms style={{ fontSize: '50px', color: '#0175c8' }} /> Forms/Signature
              </h3>
            </div>
            <div className={`profile-btn ${clickedButton === 'profile' ? 'clicked' : ''}`}>
              <h3 onClick={handleProfileClick}>
                <IoPersonCircleOutline style={{ fontSize: '50px', color: '#0175c8' }} /> Profile
              </h3>
            </div>
            <div className={`dashboard-btn ${clickedButton === 'dashboard' ? 'clicked' : ''}`}>
              <h3 onClick={handleDashboardClick}>
                <FaPaperPlane style={{ fontSize: '50px', color: '#0175c8' }} /> Dashboard
              </h3>
            </div>
          </div>
        </header>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
    
  );
};

export default AdminHome;
