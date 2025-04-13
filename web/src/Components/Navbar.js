import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import StudeventLogo from '../Images/Studevent.png';
import { FiLogOut, FiHome, FiUsers, FiBell } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";

const Navbar = ({ isLoggedIn, user, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notifications
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
  
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
  
      setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
  
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    setAccountMenuOpen(false);
    setNotificationMenuOpen(false);
  };

  const toggleNotificationMenu = async () => {
    setNotificationMenuOpen(!notificationMenuOpen);
    setAccountMenuOpen(false);
  
    if (!notificationMenuOpen && notifications.length > 0) {
      try {
        const token = localStorage.getItem("token");
        
        await Promise.all(
          notifications.map((notification) => 
            markNotificationAsRead(notification._id)
          )
        );
  
        setUnreadCount(0);
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    }
  };
  
  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
    setNotificationMenuOpen(false);
  };

  const handleNavbarClick = () => {
    navigate('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setAccountMenuOpen(false);
    setDrawerOpen(false);
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
    navigate('/orgprof');
    setDrawerOpen(false);
  };

  const renderMenuItems = () => (
    <>
      <li className="navbar-menu-li">
        <button
          className={`navbar-menu-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => {
            navigate('/');
            setDrawerOpen(false);
          }}
        >
          <FiHome className="navbar-menu-icon" />
          <span className="navbar-menu-text">Home</span>
        </button>
      </li>
      <li className="navbar-menu-li">
        <button
          className={`navbar-menu-item ${location.pathname === '/organizations' ? 'active' : ''}`}
          onClick={() => {
            navigate('/organizations');
            setDrawerOpen(false);
          }}
        >
          <FiUsers className="navbar-menu-icon" />
          <span className="navbar-menu-text">Organizations</span>
        </button>
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
        {isLoggedIn && user && !isMobile && (
          <div className="navbar-icons-container">
            <div className="navbar-notifications" onClick={toggleNotificationMenu}>
              <FiBell className="navbar-icon" />
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
                />
              ) : (
                <CgProfile className="navbar-profile-icon" />
              )}
              {accountMenuOpen && (
                <div className="account-dropdown-menu">
                  <div className="dropdown-item" onClick={handleProfileClick}>
                    <CgProfile className="navbar-icon" />
                    <span>Profile</span>
                  </div>
                  <div className="dropdown-item" onClick={handleLogoutClick}>
                    <FiLogOut className="navbar-icon" />
                    <span>Log Out</span>
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
          {isLoggedIn && user && (
            <>
              <li className="drawer-list-item" onClick={toggleNotificationMenu}>
                <FiBell className="navbars-icon" />
                <span>Notifications</span>
                {unreadCount > 0 && <span className="drawer-badge">{unreadCount}</span>}
              </li>
              <li className="drawer-list-item" onClick={handleProfileClick}>
                <CgProfile className="navbars-icon" />
                <span>Profile</span>
              </li>
              <li className="drawer-list-item" onClick={handleLogoutClick}>
                <FiLogOut className="navbars-icon" />
                <span>Logout</span>
              </li>
            </>
          )}
        </ul>
        
        {isLoggedIn && user && notificationMenuOpen && (
          <div className="drawer-notification-dropdown">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`drawer-notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => {
                    markNotificationAsRead(notification._id);
                    setNotificationMenuOpen(false);
                  }}
                >
                  <div className="drawer-notification-message">{notification.message}</div>
                  <div className="drawer-notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                  {notification.type === 'tracker' && (
                    <button 
                      className="drawer-view-tracker-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tracker/${notification.trackerId}`);
                        setNotificationMenuOpen(false);
                      }}
                    >
                      View Tracker
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="drawer-notification-item no-notifications">
                No new notifications
              </div>
            )}
          </div>
        )}
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