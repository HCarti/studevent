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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  //notifications
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user]);
  
  const fetchNotifications = async () => {
  if (!user || !user.email) return;
  
  try {
    const token = localStorage.getItem("token");     
    const response = await fetch(
      `https://studevent-server.vercel.app/api/notifications`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch notifications');
    
    const data = await response.json();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    // Optional: Add retry logic or error state
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
    setShowLogoutModal(true);
    setAccountMenuOpen(false); // Close account menu when logout is clicked
    setDrawerOpen(false); // Close drawer if open
  };

  const confirmLogout = () => {
    localStorage.clear();
    handleLogout();
    navigate('/');
    setShowLogoutModal(false);
  };
  
  const cancelLogout = () => {
    setShowLogoutModal(false);
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
return(
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
                    notifications.map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => {
                          markNotificationAsRead(notification._id);
                        }}
                      >
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                        {notification.type === 'tracker' && (
                          <button 
                            className="view-tracker-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tracker/${notification.trackerId}`);
                            }}
                          >
                            View Tracker
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="notification-item no-notifications">
                      No new notifications
                    </div>
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-buttons">
              <button 
                className="logout-modal-cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button 
                className="logout-modal-confirm"
                onClick={confirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
