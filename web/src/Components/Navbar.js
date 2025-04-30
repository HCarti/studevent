import React, { useState, useEffect, useRef } from 'react';
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

  // Refs for dropdown containers
  const accountDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const drawerRef = useRef(null);
  const mobileMenuIconRef = useRef(null);
  const bellIconRef = useRef(null);

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
      if (accountMenuOpen && 
          accountDropdownRef.current && 
          !accountDropdownRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
      
      if (notificationMenuOpen && 
          notificationDropdownRef.current && 
          !notificationDropdownRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
      
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
  
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
  
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
    if (unreadCount > 0 && bellIconRef.current) {
      bellIconRef.current.classList.add('bell-ring');
      setTimeout(() => {
        if (bellIconRef.current) {
          bellIconRef.current.classList.remove('bell-ring');
        }
      }, 500);
    }
  
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
    if (user.role === 'SuperAdmin') {
      navigate('/superadminprofile');
    } else if (user.role === 'Organization' || user.role === 'Authority' || user.role === 'Admin') {
      navigate('/orgprof');
    } else {
      navigate('/profile');
    }
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
              <FiBell className="navbar-icon" ref={bellIconRef} />
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
                    <span>{user.role === 'SuperAdmin' ? 'Super Admin Profile' : 'Profile'}</span>
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
                <span>{user.role === 'SuperAdmin' ? 'Super Admin Profile' : 'Profile'}</span>
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