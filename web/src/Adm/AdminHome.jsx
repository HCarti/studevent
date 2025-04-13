import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';
import StudeventLogo from '../Images/NU_logo.png';
import { FaWpforms, FaPaperPlane } from "react-icons/fa";
import { IoCalendarOutline, IoPersonCircleOutline } from "react-icons/io5";
import { IoSpeedometerOutline } from "react-icons/io5";
import { ParallaxProvider } from 'react-scroll-parallax';
import axios from 'axios';
import image1 from '../Images/NU_moa_event2.jpg';
import image2 from '../Images/NU_moa_event6.jpg';
import image3 from '../Images/NU_moa_event3.jpg';
import image4 from '../Images/NU_moa_event4.jpg';
import Slider from 'react-slick';

const AdminHome = () => { 
  const navigate = useNavigate();
  const [clickedButton, setClickedButton] = useState(null);
  const [quote, setQuote] = useState('');
  const [currentAuthority, setCurrentAuthority] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  const quotes = [
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work... – Steve Jobs",
    "I have learned over the years that when one's mind is made up, this diminishes fear... – Rosa Parks",
    "Success is not the key to happiness. Happiness is the key to success... – Albert Schweitzer",
    "It always seems impossible until it's done... – Nelson Mandela",
    "Your time is limited, so don't waste it living someone else's life... – Steve Jobs",
    "Believe you can and you're halfway there... – Theodore Roosevelt",
    "The future belongs to those who believe in the beauty of their dreams... – Eleanor Roosevelt",
    "You miss 100% of the shots you don't take... – Wayne Gretzky",
    "Success is walking from failure to failure with no loss of enthusiasm... – Winston Churchill",
    "Hardships often prepare ordinary people for an extraordinary destiny... – C.S. Lewis"
  ];

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  useEffect(() => {
    const fetchAuthorities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://studevent-server.vercel.app/api/current', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });        
        console.log('Response data:', response.data);
        const filteredAuthorities = response.data.filter(user => user.role === 'Authority');
        if (filteredAuthorities.length > 0) {
          setCurrentAuthority(filteredAuthorities[0]);
        } else {
          console.warn('No authority users found');
        }
      } catch (error) {
        console.error('Error fetching authorities:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAuthorities();
  }, []);
  
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser) {
      console.error('No logged-in user found');
      navigate('/');
      return;
    }

    if (loggedInUser.role === 'Authority') {
      setCurrentAuthority(loggedInUser);
    } else if (loggedInUser.role === 'Admin') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, [navigate]);

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

  const handleDashboardClick = () => {
    handleButtonClick('dashboard');
    navigate('/dashboard');
  };

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
  
  const images = [image1, image2, image3, image4];

  // CSS for the loader
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
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 1000;
      backdrop-filter: blur(3px);
    }
    
    .loader {
      width: 48px;
      height: 48px;
      border: 5px solid #0175c8;
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
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

      <div className="admin-home">
        <header className="header-admin">
          <img src={StudeventLogo} alt="Studevent Logo" className="logo" />
          <h2>Welcome, {isLoading ? "..." : isAdmin ? "Admin" : currentAuthority ? currentAuthority.faculty : "Guest"}</h2>
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
          {isAdmin && (
          <div className={`menu-item ${clickedButton === 'dashboard' ? 'active' : ''}`} onClick={handleDashboardClick}>
            <IoSpeedometerOutline className="menu-icon" />
            <h3>Dashboard</h3>
          </div>
        )}
      </div>

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

export default AdminHome;