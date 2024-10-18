import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OrgMemHome.css';
import StudeventLogo from '../Images/NU_logo.png';
import { FaWpforms } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoPersonCircleOutline, IoSpeedometerOutline } from "react-icons/io5";
import { ParallaxProvider, Parallax } from 'react-scroll-parallax'; 
import facebookIcon from '../Images/facebook.png';
import twitterIcon from '../Images/twitter.png';
import instagramIcon from '../Images/instagram.png';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const OrgMemHome = () => {
  const navigate = useNavigate();
  const [clickedButton, setClickedButton] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [quote, setQuote] = useState('');

  // Array of motivational quotes
  const quotes = [
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. – Steve Jobs",
    "I have learned over the years that when one's mind is made up, this diminishes fear; knowing what must be done does away with fear. – Rosa Parks",
    "Success is not the key to happiness. Happiness is the key to success. – Albert Schweitzer",
    "It always seems impossible until it’s done. – Nelson Mandela",
    "Your time is limited, so don’t waste it living someone else’s life. – Steve Jobs",
    "Believe you can and you're halfway there. – Theodore Roosevelt",
    "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
    "You miss 100% of the shots you don’t take. – Wayne Gretzky",
    "Success is walking from failure to failure with no loss of enthusiasm. – Winston Churchill",
    "Hardships often prepare ordinary people for an extraordinary destiny. – C.S. Lewis"
  ];

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users');
        const filteredOrganizations = response.data.filter(user => user.role === 'Organization');
        setOrganizations(filteredOrganizations);
        if (filteredOrganizations.length > 0) {
          setCurrentOrganization(filteredOrganizations[0]);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);

  // Select a random quote on component mount
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  const handleButtonClick = (button) => {
    setClickedButton(button);
  };

  const handleFormsClick = () => {
    handleButtonClick('forms');
    navigate('/formss');
  };

  const handleEventsClick = () => {
    handleButtonClick('events');
    navigate('/orgcalendar');
  };

  const handleProfileClick = () => {
    handleButtonClick('profile');
    navigate('/orgprof');
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <ParallaxProvider>
      <div className="orgmem-home">
        <header className="header-admin">
          <img src={StudeventLogo} alt="Studevent Logo" className="logo" />
          <h2>Welcome, {currentOrganization ? currentOrganization.organizationName : 'Loading...'}</h2>
        </header>

        <div className="menu-container">
          <div className={`menu-item ${clickedButton === 'events' ? 'active' : ''}`} onClick={handleEventsClick}>
            <FaRegCalendarAlt className="menu-icon" />
            <h3>Calendar</h3>
          </div>
          <div className={`menu-item ${clickedButton === 'forms' ? 'active' : ''}`} onClick={handleFormsClick}>
            <FaWpforms className="menu-icon" />
            <h3>Forms/Signature</h3>
          </div>
          <div className={`menu-item ${clickedButton === 'profile' ? 'active' : ''}`} onClick={handleProfileClick}>
            <IoPersonCircleOutline className="menu-icon" />
            <h3>Profile</h3>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">Logout</button>

        {/* Quote Section */}
        <div className="quote-container">
          <p className="quote animated-fade">{quote}</p>
        </div>

        {/* Footer Section */}
        <Parallax>
          <footer className="footer3">
            <div className="footer3-container">
              <div className="footer3-section contact-info">
                <h4>Contact Us</h4>
                <div className="contact-item">
                  <EmailIcon />
                  <span>SDAO@students.nu-moa.edu.ph</span>
                </div>
                <div className="contact-item">
                  <PhoneIcon />
                  <span>09-xxxxxxxxx</span>
                </div>
              </div>

              <div className="footer3-section social-icons-container">
                <h4>Follow Us:</h4>
                <div className="social-icons">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <img src={facebookIcon} alt="Facebook" className="social-icon" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <img src={twitterIcon} alt="Twitter" className="social-icon" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <img src={instagramIcon} alt="Instagram" className="social-icon" />
                  </a>
                </div>
              </div>

              <div className="footer3-section copyright-info">
                <h4>&copy; 2024 NU MOA - SDAO System</h4>
                <p>All rights reserved.</p>
              </div>
            </div>
          </footer>
        </Parallax>
      </div>
    </ParallaxProvider>
  );
};

export default OrgMemHome;
