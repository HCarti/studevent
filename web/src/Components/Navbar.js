import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import StudeventLogo from '../Images/Studevent.png';
import { FiLogOut, FiHome, FiUsers, FiBell, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';

const Navbar = ({ isLoggedIn, user, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Refs for dropdown containers
  const notificationDropdownRef = useRef(null);
  const drawerRef = useRef(null);
  const mobileMenuIconRef = useRef(null);
  const bellIconRef = useRef(null);
  const navbarRef = useRef(null);
  const profileModalRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = event => {
      // Close notification dropdown if clicked outside
      if (
        notificationMenuOpen &&
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target) &&
        (!bellIconRef.current || !bellIconRef.current.contains(event.target))
      ) {
        setNotificationMenuOpen(false);
      }

      // Close drawer if clicked outside
      if (
        drawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        (!mobileMenuIconRef.current || !mobileMenuIconRef.current.contains(event.target)) &&
        (!navbarRef.current || !navbarRef.current.contains(event.target))
      ) {
        setDrawerOpen(false);
      }

      // Close profile modal if clicked outside
      if (
        showProfileModal &&
        profileModalRef.current &&
        !profileModalRef.current.contains(event.target) &&
        (!document.querySelector('.profile-icon-container') ||
          !document.querySelector('.profile-icon-container').contains(event.target))
      ) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [drawerOpen, notificationMenuOpen, showProfileModal]);

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
      const token = localStorage.getItem('token');
      const response = await fetch(`https://studevent-server.vercel.app/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async notificationId => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://studevent-server.vercel.app/api/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
      console.error('Error:', error);
      return false;
    }
  };

  const markNotificationAsUnread = async notificationId => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://studevent-server.vercel.app/api/mark-unread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as unread: ${response.status}`);
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: false } : notification
        )
      );

      setUnreadCount(prevCount => prevCount + 1);

      return true;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      return false;
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
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
  };

  const handleNavbarClick = () => {
    navigate('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
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
    if (isMobile) {
      // In mobile view, directly navigate to profile
      navigateToProfile();
    } else {
      // In web view, show profile options modal
      setShowProfileModal(true);
    }
  };

  const navigateToProfile = () => {
    if (user.role === 'SuperAdmin') {
      navigate('/superadminprofile');
    } else if (user.role === 'Organization' || user.role === 'Authority' || user.role === 'Admin') {
      navigate('/orgprof');
    } else {
      navigate('/profile');
    }
    setDrawerOpen(false);
    setNotificationMenuOpen(false);
    setShowProfileModal(false);
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

  const handleDrawerNotificationClick = () => {
    navigate('/notifications');
    setDrawerOpen(false);
  };

  const handleNotificationClick = async notification => {
    // If notification is not read, mark it as read
    if (!notification.read) {
      await markNotificationAsRead(notification._id);
    }

    // Close the notification dropdown
    setNotificationMenuOpen(false);

    // Navigate based on notification type
    switch (notification.type) {
      case 'tracker':
        navigate(`/tracker/${notification.trackerId}`);
        break;
      case 'event':
        navigate(`/event/${notification.eventId}`);
        break;
      case 'organization':
        navigate(`/organization/${notification.organizationId}`);
        break;
      case 'approval':
        navigate(`/approvals`);
        break;
      case 'liquidation':
        navigate(`/liquidations`);
        break;
      default:
        // For notifications without specific navigation, just mark as read
        console.log('No navigation defined for this notification type');
        break;
    }
  };

  return (
    <div className="navbar" ref={navbarRef}>
      <div className="navbar-logo" onClick={handleNavbarClick}>
        <img src={StudeventLogo} alt="StudEvent Logo" />
        <div className="navbar-title">StudEvent</div>
      </div>

      <div className="navbar-menu">
        <ul>{renderMenuItems()}</ul>
        {isLoggedIn && user && !isMobile && (
          <div className="navbar-icons-container">
            <div
              className="navbar-notifications"
              onClick={toggleNotificationMenu}
              ref={notificationDropdownRef}
            >
              <div className="bell-container">
                <FiBell className="navbar-icon" ref={bellIconRef} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </div>
              {notificationMenuOpen && (
                <div className="notification-dropdown">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification._id}
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={e => {
                          // Don't trigger navigation if clicking on buttons
                          if (
                            e.target.tagName === 'BUTTON' ||
                            e.target.closest('button') ||
                            e.target.className === 'notification-actions'
                          ) {
                            return;
                          }
                          handleNotificationClick(notification);
                        }}
                      >
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                        <div className="notification-actions">
                          {notification.type === 'tracker' && (
                            <button
                              className="view-tracker-btn"
                              onClick={e => {
                                e.stopPropagation();
                                navigate(`/tracker/${notification.trackerId}`);
                                setNotificationMenuOpen(false);
                              }}
                            >
                              View Tracker
                            </button>
                          )}
                          {notification.read ? (
                            <button
                              className="mark-unread-btn"
                              onClick={e => {
                                e.stopPropagation();
                                markNotificationAsUnread(notification._id);
                              }}
                            >
                              <FiCircle /> Mark as Unread
                            </button>
                          ) : (
                            <button
                              className="mark-read-btn"
                              onClick={e => {
                                e.stopPropagation();
                                markNotificationAsRead(notification._id);
                              }}
                            >
                              <FiCheckCircle /> Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="notification-item no-notifications">No new notifications</div>
                  )}
                  <div className="notification-footer">
                    <button
                      className="view-all-notifications"
                      onClick={() => {
                        navigate('/notifications');
                        setNotificationMenuOpen(false);
                      }}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-icon-container">
              {user.logo ? (
                <img
                  src={user.logo}
                  alt="Profile"
                  className="navbar-profile-pic"
                  onClick={handleProfileClick}
                />
              ) : (
                <CgProfile className="navbar-profile-icon" onClick={handleProfileClick} />
              )}
            </div>
          </div>
        )}
      </div>

      {isLoggedIn && user && isMobile && (
        <div className="mobile-menu-container">
          <div className="navbar-notifications" onClick={() => navigate('/notifications')}>
            <div className="bell-container">
              <FiBell className="navbar-icon" ref={bellIconRef} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>
          </div>
          <div className="mobile-menu-icon" onClick={toggleDrawer} ref={mobileMenuIconRef}>
            &#9776;
          </div>
        </div>
      )}

      {!isLoggedIn && (
        <div className="mobile-menu-icon" onClick={toggleDrawer} ref={mobileMenuIconRef}>
          &#9776;
        </div>
      )}

      <div className={`drawer-overlay ${drawerOpen ? 'visible' : ''}`} onClick={toggleDrawer}></div>
      <div className={`drawer ${drawerOpen ? 'open' : ''}`} ref={drawerRef}>
        <div className="drawer-header">
          <div className="drawer-user-info">
            {user && (
              <>
                {user.logo ? (
                  <img
                    src={user.logo}
                    alt="Profile"
                    className="drawer-profile-pic"
                    onClick={navigateToProfile}
                  />
                ) : (
                  <div className="drawer-profile-icon" onClick={navigateToProfile}>
                    <CgProfile />
                  </div>
                )}
                <div className="drawer-user-details">
                  <div className="drawer-user-name">{user.name || user.email}</div>
                  <div className="drawer-user-email">{user.email}</div>
                </div>
              </>
            )}
          </div>
          <button className="drawer-close-btn" onClick={toggleDrawer}>
            &times;
          </button>
        </div>
        <div className="drawer-content">
          <ul className="drawer-list">
            <li
              className={`drawer-list-item ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => {
                navigate('/');
                setDrawerOpen(false);
              }}
            >
              <FiHome className="drawer-icon" />
              <span>Home</span>
            </li>
            <li
              className={`drawer-list-item ${
                location.pathname === '/organizations' ? 'active' : ''
              }`}
              onClick={() => {
                navigate('/organizations');
                setDrawerOpen(false);
              }}
            >
              <FiUsers className="drawer-icon" />
              <span>Organizations</span>
            </li>
            {isLoggedIn && user && (
              <>
                <li className="drawer-list-item" onClick={handleLogoutClick}>
                  <FiLogOut className="drawer-icon" />
                  <span>Logout</span>
                </li>
              </>
            )}
          </ul>
          <div className="drawer-footer">
            <div className="app-version">v1.0.0</div>
            <div className="app-copyright">© 2025 StudEvent</div>
          </div>
        </div>
      </div>

      {/* Profile Options Modal */}
      {showProfileModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal" ref={profileModalRef}>
            <h3>Profile Options</h3>
            <div className="profile-modal-buttons">
              <button className="profile-modal-view" onClick={navigateToProfile}>
                View Profile
              </button>
              <button
                className="profile-modal-logout"
                onClick={() => {
                  setShowProfileModal(false);
                  setShowLogoutModal(true);
                }}
              >
                Log Out
              </button>
              <button className="profile-modal-cancel" onClick={() => setShowProfileModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-buttons">
              <button className="logout-modal-cancel" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="logout-modal-confirm" onClick={confirmLogout}>
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
