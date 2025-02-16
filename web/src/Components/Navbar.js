import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import StudeventLogo from '../Images/Studevent.png';
import { FiLogOut } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { FiBell } from "react-icons/fi"; // Import bell icon

const Navbar = ({ isLoggedIn, user, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  //notifications
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user]);
  
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token'); // Get JWT from localStorage
      if (!token) {
        console.error("No token found in localStorage!");
        return;
      }
      const response = await fetch(`https://studevent-server.vercel.app/api/notifications?userEmail=${user.email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Notifications:', data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  

  // const markNotificationsAsRead = async () => {
  //   try {
  //     await fetch("https://studevent-server.vercel.app/api/notifications/mark-read", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userEmail: user.email }),
  //     });
  //     setUnreadCount(0);
  //   } catch (error) {
  //     console.error("Error marking notifications as read:", error);
  //   }
  // };
  
  useEffect(() => {
    // This effect will trigger when `user` is updated
  }, [user]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleNotificationMenu = async () => {
    setNotificationMenuOpen(!notificationMenuOpen);
    
    if (!notificationMenuOpen) {
      try {
        await fetch("https://studevent-server.vercel.app/api/notifications/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: user.email }),
        });
        setUnreadCount(0);
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
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

  const handleProfileClick = () => {
    navigate('/orgprof'); // Redirect to login or home page
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
    </>
  );

  return (
    <div className="navbar">
      <div className="navbar-logo" onClick={handleNavbarClick}>
        <img src={StudeventLogo} alt="StudEvent Logo" />
        <div className="navbar-title">StudEvent</div>
      </div>
      <div className="navbar-menu">
      <ul>
          {renderMenuItems()}
        </ul>
      {isLoggedIn && user && (
           <div className="navbar-icons-container">
           <div className="navbar-notifications" onClick={toggleNotificationMenu}>
             <FiBell className="navbar-notification-icon" />
             {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
             {notificationMenuOpen && (
               <div className="notification-dropdown">
                 {notifications.length > 0 ? (
                   notifications.map((notification, index) => (
                     <div key={index} className="notification-item">
                       {notification.message}
                     </div>
                   ))
                 ) : (
                   <div className="notification-item no-notifications">No new notifications</div>
                 )}
               </div>
             )}
           </div>      

  <div className="account-dropdown" onClick={toggleAccountMenu}>
    {user.logo ? (
      <img
        src={user.logo}
        alt="Profile"
        className="navbar-profile-pic"
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = '/path/to/default/profile-pic.png'; 
        }}
      />
    ) : (
      <span>Account</span>
    )}
    {accountMenuOpen && (
      <div className="account-dropdown-menu">
        <div className="dropdown-item" onClick={handleProfileClick}>
          Profile <CgProfile className="navbar-icon" />
        </div>
        <div className="dropdown-item" onClick={handleLogoutClick}>
          Log Out <FiLogOut className="navbar-icon1" />
        </div>
      </div>
    )}
  </div>
</div>       
        )}
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
