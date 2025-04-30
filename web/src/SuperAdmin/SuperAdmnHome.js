import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminHome.css';
import StudeventLogo from '../Images/NU_logo.png';
import { FaWpforms, FaPaperPlane } from "react-icons/fa";
import { IoCalendarOutline, IoPersonCircleOutline } from "react-icons/io5";
import { IoSpeedometerOutline } from "react-icons/io5";
import { MdDisplaySettings } from "react-icons/md";
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import Footer from '../Components/footer';

const SuperAdminHome = () => {
  const navigate = useNavigate();
  const [clickedButton, setClickedButton] = useState(null);
  const [quote, setQuote] = useState('');

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

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  const handleButtonClick = (button) => {
    setClickedButton(button);
  };

  const handleControlPanelClick = () => {
    handleButtonClick('controlpanel');
    navigate('/superadmin/controlpanel');
  };
  
  const handleFormsClick = () => {
    handleButtonClick('forms');
    navigate('/formss');
  };
  
  const handleEventsClick = () => {
    handleButtonClick('events');
    navigate('/calendar');
  };


  return (
    <ParallaxProvider>
      <React.Fragment>
      <div className="superadmin-home">
        <header className="header-superadmin">
          <img src={StudeventLogo} alt="Studevent Logo" className="logo-superadmin" />
          <h2>Welcome, Super Admin!</h2>
        </header>

        <div className="menu-superadmin-container">
          <div className={`menu-superadmin-item ${clickedButton === 'controlpanel' ? 'active' : ''}`} onClick={handleControlPanelClick}>
            <MdDisplaySettings className="menu-superadmin-icon" />
            <h3>Control Panel</h3>
          </div>
          <div className={`menu-superadmin-item ${clickedButton === 'events' ? 'active' : ''}`} onClick={handleEventsClick}>
            <IoCalendarOutline className="menu-superadmin-icon" />
            <h3>Calendar</h3>
          </div>
          <div className={`menu-superadmin-item ${clickedButton === 'forms' ? 'active' : ''}`} onClick={handleFormsClick}>
            <FaWpforms className="menu-superadmin-icon" />
            <h3>Forms/Signature</h3>
          </div>
        </div>

        <div className="quote-superadmin-container">
          <p className="quote-superadmin animated-fade">{quote}</p>
        </div>      
      </div>
       </React.Fragment>
    </ParallaxProvider>
  );
};

export default SuperAdminHome;