import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import StudeventLogo from '../Images/Studevent.png';

const Navbar = ({ isLoggedIn, user, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  //notifications
  const notifyUser = async () => {
    try {
      const response = await fetch('https://studevent-server.vercel.app/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,  // Use logged-in user's email
          eventDetails: 'Some important activity',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Notification email sent:', data.message);
      } else {
        console.error('Failed to send notification email:', data.message);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };
  

  useEffect(() => {
    // This effect will trigger when `user` is updated
  }, [user]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleNotificationMenu = () => {
    setNotificationMenuOpen(!notificationMenuOpen);
    if (!notificationMenuOpen) {
      notifyUser(); // Trigger notification email when menu is opened
    }
  };

  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };

  const handleNavbarClick = () => {
    navigate('/');
  };

  const handleLogoutClick = () => {
  localStorage.clear();
  handleLogout(); // Call parent-provided logout function to reset state in the parent component
  navigate('/'); // Redirect to login or home page
  };

  const renderMenuItems = () => (
    <>
      <li>
        <Link
          to="/"
          className={`navbar-menu-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => setDrawerOpen(false)}
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          to="/organizations"
          className={`navbar-menu-item ${location.pathname === '/organizations' ? 'active' : ''}`}
          onClick={() => setDrawerOpen(false)}
        >
          Organizations
        </Link>
      </li>
      {isLoggedIn && user && (
        <li className="navbar-menu-item account-dropdown" onClick={toggleAccountMenu}>
          {user.logo ? (
            <img
              src={`https://studevent-server.vercel.app/uploads/${user.logo}`} 
              alt="Profile" 
              className="navbar-profile-pic"
            />
          ) : (
            <span>Account</span>
          )}
          {accountMenuOpen && (
            <div className="account-dropdown-menu">
              <div className="dropdown-item" onClick={handleLogoutClick}>Logout</div>
            </div>
          )}
        </li>
      )}
    </>
  );

  return (
    <div className="navbar">
      <div className="navbar-logo" onClick={handleNavbarClick}>
        <img src={StudeventLogo} alt="StudEvent Logo" />
        <div className="navbar-title">StudEvent</div>
      </div>
      <div className="navbar-menu">
        {user && user.role === 'member' && (
          <div className="navbar-notifications" onClick={toggleNotificationMenu}>
            <span className="navbar-notification-icon">🔔</span>
            <span className="badge">4</span>
            {notificationMenuOpen && (
              <div className="menu">
                <div className="menu-item">Notification 1</div>
                <div className="menu-item">Notification 2</div>
                <div className="menu-item">Notification 3</div>
              </div>
            )}
          </div>
        )}
        <ul>
          {renderMenuItems()}
        </ul>
      </div>
      <div className="mobile-menu-icon" onClick={toggleDrawer}>
        &#9776;
      </div>
      <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">Menu</div>
          <div className="drawer-close-icon" onClick={toggleDrawer}>
            &times;
          </div>
        </div>
        <ul className="drawer-list">
          {renderMenuItems()}
          {isLoggedIn && (
            <li className="drawer-list-item" onClick={handleLogoutClick}>Logout</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
