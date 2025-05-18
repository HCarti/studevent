import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OrgMemHome.css';
import StudeventLogo from '../Images/NU_logo.png';
import { FaWpforms, FaRegCalendarAlt } from "react-icons/fa";
import { IoPersonCircleOutline } from "react-icons/io5";
import { ParallaxProvider, Parallax } from 'react-scroll-parallax'; 
import facebookIcon from '../Images/facebook.png';
import twitterIcon from '../Images/twitter.png';
import instagramIcon from '../Images/instagram.png';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import image1 from '../Images/NU_moa_event2.jpg';
import image2 from '../Images/NU_moa_event6.jpg';
import image3 from '../Images/NU_moa_event3.jpg';
import image4 from '../Images/NU_moa_event4.jpg';
import Slider from 'react-slick';

const OrgMemHome = () => {
  const navigate = useNavigate();
  const [clickedButton, setClickedButton] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(true); // New loading state

  // Array of motivational quotes
  const quotes = [
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. – Steve Jobs",
    "I have learned over the years that when one's mind is made up, this diminishes fear; knowing what must be done does away with fear. – Rosa Parks",
    "Success is not the key to happiness. Happiness is the key to success. – Albert Schweitzer",
    "It always seems impossible until it's done. – Nelson Mandela",
    "Your time is limited, so don't waste it living someone else's life. – Steve Jobs",
    "Believe you can and you're halfway there. – Theodore Roosevelt",
    "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
    "You miss 100% of the shots you don't take. – Wayne Gretzky",
    "Success is walking from failure to failure with no loss of enthusiasm. – Winston Churchill",
    "Hardships often prepare ordinary people for an extraordinary destiny. – C.S. Lewis"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true); // Start loading
        const token = localStorage.getItem('token');
        console.log('Token retrieved from localStorage:', token);
        if (!token) {
          console.error('No token found, redirecting to login.');
          navigate('/');
          return;
        }

        // Updated API route
        const response = await axios.get('https://studevent-server.vercel.app/api/users/current', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("User data response:", response.data);

        const user = response.data;
        if (user.role === 'Organization') {
          setOrganizationName(user.organizationName);
        } else {
          console.warn('User is not an organization member.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 401) {
          navigate('/');
        }
      } finally {
        setIsLoading(false); // Stop loading whether successful or not
      }
    };

    fetchUserData();
  }, [navigate]);

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
    navigate('/calendar');
  };

  const images = [image1, image2, image3, image4];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, 
    autoplaySpeed: 4000, 
    pauseOnHover: true,
    arrows: false, 
    fade: true,
    cssEase: 'linear',
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  // CSS for the loader (you can also add this to your OrgMemHome.css file)
  const loaderStyles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 1000;
    }
    
    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }
  `;

  return (
    <ParallaxProvider>
      {/* Add the loader styles */}
      <style>{loaderStyles}</style>
      
      {/* Show loader when loading */}
      {isLoading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      <div className="orgmem-home">
        <header className="header-admin">
          <img src={StudeventLogo} alt="Studevent Logo" className="logo" />
          <h2>Welcome, {organizationName || 'Guest'}</h2> 
        </header>

        <div className="menu-container">
          <div className={`menu-item ${clickedButton === 'events' ? 'active' : ''}`} onClick={handleEventsClick}>
            <FaRegCalendarAlt className="menu-icon" />
            <h3>Calendar</h3>
          </div>
          <div className={`menu-item ${clickedButton === 'forms' ? 'active' : ''}`} onClick={handleFormsClick}>
            <FaWpforms className="menu-icon" />
            <h3>Forms/Event Tracker</h3>
          </div>
        </div>

        {/* Quote Section */}
        <div className="quote-container">
          <p className="quote animated-fade">{quote}</p>
        </div>

         <div className="img-slide">
          <Slider {...sliderSettings}>
            {images.map((img, index) => (
              <div key={index} className="slide">
                <img src={img} alt={`Event ${index + 1}`} className="slider-image" />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </ParallaxProvider>
  );
};

export default OrgMemHome;