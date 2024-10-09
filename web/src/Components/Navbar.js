import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import StudeventLogo from '../Images/Studevent.png';
 
const Navbar = ({ isLoggedIn }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();
 
  let user = null;
  try {
    const userJSON = localStorage.getItem("user");
    if (userJSON) {
      user = JSON.parse(userJSON);
    }
  } catch (error) {
    console.error("Error retrieving user from localStorage", error);
  }
 
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
 
  const toggleNotificationMenu = () => {
    setNotificationMenuOpen(!notificationMenuOpen);
  };
 
  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };
 
  const handleNavbarClick = () => {
    navigate('/');
  };
 
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
 
  const renderMenuItems = () => (
    <>
      <li>
        <Link
          to="/"
          className={`navbar-menu-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => setDrawerOpen(false)} // Close drawer on click
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          to="/organizations"
          className={`navbar-menu-item ${location.pathname === '/organizations' ? 'active' : ''}`}
          onClick={() => setDrawerOpen(false)} // Close drawer on click
        >
          Organizations
        </Link>
      </li>
      {isLoggedIn && (
        <li className="navbar-menu-item" onClick={toggleAccountMenu}>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="navbar-profile-pic"
            />
          ) : (
            <span>Account</span>
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
        &#9776; {/* Hamburger icon */}
      </div>
      <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">Menu</div>
          <div className="drawer-close-icon" onClick={toggleDrawer}>
            &times; {/* Close icon */}
          </div>
        </div>
        <ul className="drawer-list">
          {renderMenuItems()}
          <li className="drawer-list-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      {accountMenuOpen && (
        <div className="menu">
          <div className="menu-item" onClick={handleLogout}>Logout</div>
        </div>
      )}
    </div>
  );
};
 
export default Navbar;