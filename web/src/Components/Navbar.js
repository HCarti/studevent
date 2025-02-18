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
    if (!user || !user.email) return; // Prevent making API calls if user is not available
    try {
      const token = localStorage.getItem("token");     
      const response = await fetch(
        `https://studevent-server.vercel.app/api/notifications?userEmail=${user.email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const data = await response.json();
      console.log("Fetched notifications:", data); // Debugging log
  
      if (!data.length) {
        console.log("No notifications available");
      } else {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length); // Count unread notifications
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  
  

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`https://studevent-server.vercel.app/api/notifications/mark-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
  
      // Update state to mark notification as read locally
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
  
      setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
  
      console.log("Notification marked as read successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  
  
  useEffect(() => {
    // This effect will trigger when `user` is updated
  }, [user]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleNotificationMenu = async () => {
    setNotificationMenuOpen(!notificationMenuOpen);
  
    if (!notificationMenuOpen && notifications.length > 0) {
      try {
        const token = localStorage.getItem("token");
        
        // Mark all unread notifications as read
        await Promise.all(
          notifications.map((notification) => 
            markNotificationAsRead(notification._id)
          )
        );
  
        // Clear unread count after marking notifications as read
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
