import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';
import StudeventLogo from '../Images/NU_logo.png';
import { FaWpforms, FaPaperPlane } from "react-icons/fa";
import { IoCalendarOutline, IoPersonCircleOutline } from "react-icons/io5";
import { IoSpeedometerOutline } from "react-icons/io5";
import { ParallaxProvider, Parallax } from 'react-scroll-parallax'; // Assuming Parallax is imported from a package or custom component
import facebookIcon from '../Images/facebook.png'; // Add your actual path for the icons
import twitterIcon from '../Images/twitter.png';
import instagramIcon from '../Images/instagram.png';
import EmailIcon from '@mui/icons-material/Email';  
import PhoneIcon from '@mui/icons-material/Phone'; 
import axios from 'axios';

const AdminHome = () => { 
  const navigate = useNavigate();
  const [clickedButton, setClickedButton] = useState(null);
  const [quote, setQuote] = useState('');
  const [authorities, setAuthories] = useState([]);
  const [currentAuthorities, setCurrentAuthoritiy] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(false); // Define a state for admin check
  
  // Array of longer life quotes
 // Array of longer motivational daily quotes from real people
const quotes = [
  "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. And the only way to do great work is to love what you do. If you haven’t found it yet, keep looking. Don’t settle. – Steve Jobs",
  "I have learned over the years that when one's mind is made up, this diminishes fear; knowing what must be done does away with fear. You must never be fearful about what you are doing when it is right. – Rosa Parks",
  "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful. No matter how hard life gets, always choose to pursue the things that bring you joy and fulfillment. – Albert Schweitzer",
  "It always seems impossible until it’s done. Courage is not the absence of fear but the triumph over it. The brave man is not he who does not feel afraid, but he who conquers that fear. – Nelson Mandela",
  "Your time is limited, so don’t waste it living someone else’s life. Don’t be trapped by dogma – which is living with the results of other people’s thinking. Don’t let the noise of others’ opinions drown out your own inner voice. – Steve Jobs",
  "Believe you can and you're halfway there. Do what you can, with what you have, where you are. It’s not the mountain we conquer, but ourselves. The greatest battles are fought within, and the greatest victories are won by taking that first step. – Theodore Roosevelt",
  "The future belongs to those who believe in the beauty of their dreams. The only limit to our realization of tomorrow will be our doubts of today. Do not let the uncertainty of the unknown keep you from chasing the dreams that set your soul on fire. – Eleanor Roosevelt",
  "You miss 100% of the shots you don’t take. I skate to where the puck is going to be, not where it has been. Opportunity is often missed because it is dressed in overalls and looks like work. – Wayne Gretzky",
  "Success is walking from failure to failure with no loss of enthusiasm. To improve is to change; to be perfect is to change often. It is not the critic who counts, but the person who actually steps into the arena. – Winston Churchill",
  "Hardships often prepare ordinary people for an extraordinary destiny. You are never too old to set another goal or to dream a new dream. What lies behind us and what lies before us are tiny matters compared to what lies within us. – C.S. Lewis"
];


  // Select a random quote when the component mounts
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);


  useEffect(() => {
    const fetchAuthorities = async () => {
      try {
        const response = await axios.get('https://studevent-server.vercel.app/api/users');
        const filteredAuthorities = response.data.filter(user => user.role === 'Authority');
        setAuthories(filteredAuthorities);
        if (filteredAuthorities.length > 0) {
          setCurrentAuthoritiy(filteredAuthorities[0]);
        }
      } catch (error) {
        console.error('Error fetching authorities:', error);
      }
    };

    fetchAuthorities();
  }, []);

  // Fetch the logged-in user
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const loggedInUserId = localStorage.getItem('userId');
        if (!loggedInUserId) {
          console.error('No logged-in user found');
          return;
        }

        // Fetch the logged-in user's data
        const response = await axios.get(`https://studevent-server.vercel.app/api/users/${loggedInUserId}`);
        const userData = response.data;

        // Check role and set authority or admin accordingly
        if (userData.role.toLowerCase() === 'authority') {
          setCurrentAuthoritiy(userData);  // For authorities, this will include faculty
        } else if (userData.role.toLowerCase() === 'admin') {
          setCurrentAdmin(true);  // Set currentAdmin to true if role is Admin
        } else {
          console.error('Logged-in user is not an authority or admin');
        }
      } catch (error) {
        console.error('Error fetching logged-in user data:', error);
      }
    };

    fetchLoggedInUser();
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
    navigate('/calendar');
  };

  const handleProfileClick = () => {
    handleButtonClick('profile');
    navigate('/adminprofile');
  };

  const handleDashboardClick = () => {
    handleButtonClick('dashboard');
    navigate('/dashboard');
  };

  return (
 <ParallaxProvider> 
    <div className="admin-home">
      <header className="header-admin">
        <img src={StudeventLogo} alt="Studevent Logo" className="logo" />
        <h2>
        Welcome, {currentAuthorities ? currentAuthorities.faculty || 'Faculty not set' : currentAdmin ? 'Admin' : 'Loading...'}
          </h2>

      </header>
      
      <div className="menu-container">
        <div className={`menu-item ${clickedButton === 'events' ? 'active' : ''}`} onClick={handleEventsClick}>
          <IoCalendarOutline className="menu-icon" />
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
        <div className={`menu-item ${clickedButton === 'dashboard' ? 'active' : ''}`} onClick={handleDashboardClick}>
          <IoSpeedometerOutline className="menu-icon" />
          <h3>Dashboard</h3>
        </div>
      </div>

      {/* Display the random quote with animation */}
      <div className="quote-container">
        <p className="quote animated-fade">{quote}</p>
      </div>

      {/* Footer Section */}
      <Parallax>
        <div className="parallax-sections">
          <footer className="footer2">
            <div className="footer-container">
              <div className="footer-section contact-info">
                <h4 style={{ fontSize: '15px',marginTop:50 }}>Contact Us</h4>
                <div className="contact-item">
                  <EmailIcon />
                  <span>SDAO@students.nu-moa.edu.ph</span>
                </div>
                <div className="contact-item">
                  <PhoneIcon />
                  <span>09-xxxxxxxxx</span>
                </div>
              </div>

              {/* Follow Us Section - Centered */}
              <div className="footer-section social-icons-container">
                <h4 style={{fontWeight: 'bold',fontSize:20}}>Follow Us:</h4>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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

              <div className="footer-section copyright-info">
                <h4 style={{ fontSize: '15px' }}>&copy; 2024 NU MOA - SDAO System</h4>
                <p style={{ fontSize: '17px' }}>All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </Parallax>
    </div>
   </ParallaxProvider>
  );
};

export default AdminHome;
