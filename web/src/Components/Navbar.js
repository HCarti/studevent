import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import StudeventLogo from '../Images/Studevent.png';
import { FiLogOut, FiHome, FiUsers, FiBell } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";

function formatNotificationTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

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

  // Refs for dropdown containers
  const accountDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const drawerRef = useRef(null);
  const mobileMenuIconRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close account dropdown if clicked outside
      if (accountMenuOpen && 
          accountDropdownRef.current && 
          !accountDropdownRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
      
      // Close notification dropdown if clicked outside
      if (notificationMenuOpen && 
          notificationDropdownRef.current && 
          !notificationDropdownRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
      
      // Close drawer if clicked outside (for mobile)
      if (drawerOpen && 
          drawerRef.current && 
          !drawerRef.current.contains(event.target) &&
          (!mobileMenuIconRef.current || !mobileMenuIconRef.current.contains(event.target))) {
        setDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [drawerOpen, accountMenuOpen, notificationMenuOpen]);

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
  
      // Optimistically update the UI
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
  
      // Only decrement unreadCount if the notification was previously unread
      setUnreadCount(prevCount => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.read ? Math.max(prevCount - 1, 0) : prevCount;
      });
  
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    setAccountMenuOpen(false);
    setNotificationMenuOpen(false);
  };

  const toggleNotificationMenu = async () => {
    const wasOpen = notificationMenuOpen;
    setNotificationMenuOpen(!wasOpen);
    setAccountMenuOpen(false);
  
    // If opening the dropdown, mark all as read
    if (!wasOpen && unreadCount > 0) {
      try {
        // Create an array of unread notification IDs
        const unreadIds = notifications
          .filter(notification => !notification.read)
          .map(notification => notification._id);
  
        if (unreadIds.length > 0) {
          // Mark all unread notifications as read in a single batch
          const token = localStorage.getItem("token");
          const response = await fetch(`https://studevent-server.vercel.app/api/notifications/mark-read-batch`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ notificationIds: unreadIds })
          });
  
          if (!response.ok) {
            throw new Error('Failed to mark notifications as read');
          }
  
          // Optimistically update the UI
          setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
              !notification.read ? { ...notification, read: true } : notification
            )
          );
          setUnreadCount(0);
        }
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
           <div 
  className="navbar-notifications" 
  onClick={toggleNotificationMenu}
  ref={notificationDropdownRef}
>
  <FiBell className="navbar-icon" />
  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
  {notificationMenuOpen && (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h4>Notifications</h4>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read"
            onClick={async (e) => {
              e.stopPropagation();
              // Mark all unread notifications as read
              const unreadIds = notifications
                .filter(n => !n.read)
                .map(n => n._id);
              
              if (unreadIds.length > 0) {
                try {
                  const token = localStorage.getItem("token");
                  await fetch(`https://studevent-server.vercel.app/api/notifications/mark-read-batch`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ notificationIds: unreadIds })
                  });
                  
                  // Optimistic update
                  setNotifications(prev => 
                    prev.map(n => !n.read ? {...n, read: true} : n)
                  );
                  setUnreadCount(0);
                } catch (error) {
                  console.error("Error marking all as read:", error);
                }
              }
            }}
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
            .map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => {
                  if (!notification.read) {
                    markNotificationAsRead(notification._id);
                  }
                  // Add any additional click handling here
                }}
              >
                <div className="notification-content">
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {formatNotificationTime(notification.createdAt)}
                  </div>
                </div>
                {notification.type === 'tracker' && (
                  <button 
                    className="view-tracker-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotificationMenuOpen(false);
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
            No notifications available
          </div>
        )}
      </div>
    </div>
  )}
</div>

            <div 
              className="account-dropdown" 
              onClick={toggleAccountMenu}
              ref={accountDropdownRef}
            >
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
      
      <div 
        className="mobile-menu-icon" 
        onClick={toggleDrawer}
        ref={mobileMenuIconRef}
      >
        &#9776;
      </div>
      
      <div className={`drawer ${drawerOpen ? 'open' : ''}`} ref={drawerRef}>
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