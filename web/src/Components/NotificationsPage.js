import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://studevent-server.vercel.app/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }

      // Remove the deleted notification from local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Optional: Add user-friendly error handling, e.g., show an error toast
      alert('Failed to delete notification. Please try again.');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
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

      // Removed automatic marking all as read
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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

      // Update local state
      setNotifications(
        notifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

      // Update local state
      setNotifications(
        notifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: false } : notification
        )
      );

      return true;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      return false;
    }
  };

  const handleTrackerClick = trackerId => {
    navigate(`/tracker/${trackerId}`);
  };

  // Back button removed

  const handleNotificationClick = async notification => {
    // If notification is not read, mark it as read
    if (!notification.read) {
      await markNotificationAsRead(notification._id);
    }

    // Navigate based on notification type
    if (!notification.type) {
      // Navigate to trackerlist by default instead of just showing as read
      navigate('/trackerlist');
      return;
    }

    switch (notification.type) {
      case 'tracker':
        if (notification.trackerId) {
          navigate(`/tracker/${notification.trackerId}`);
        } else {
          console.log('Tracker notification missing trackerId');
        }
        break;
      case 'event':
        if (notification.eventId) {
          navigate(`/event/${notification.eventId}`);
        } else {
          console.log('Event notification missing eventId');
        }
        break;
      case 'organization':
        if (notification.organizationId) {
          navigate(`/organization/${notification.organizationId}`);
        } else {
          console.log('Organization notification missing organizationId');
        }
        break;
      case 'approval':
        navigate(`/approvals`);
        break;
      case 'liquidation':
        navigate(`/liquidations`);
        break;
      default:
        // For notifications without specific navigation, just mark as read
        console.log('No navigation defined for this notification type:', notification.type);
        break;
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
      </div>

      <div className="notifications-container">
        <>
          {/* Responsive Loader */}
          <div className={`loader-container ${!loading ? 'hidden' : ''}`}>
            <div className="loader"></div>
            <p className="loading-text">Loading...</p>
          </div>
          
          {!loading && (notifications.length > 0 ? (
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
                      onClick={() => handleTrackerClick(notification.trackerId)}
                    >
                      View Tracker
                    </button>
                  )}
                  {notification.read ? (
                    <button
                      className="mark-unread-btn"
                      onClick={() => markNotificationAsUnread(notification._id)}
                    >
                      Mark Unread
                    </button>
                  ) : (
                    <button
                      className="mark-read-btn"
                      onClick={() => markNotificationAsRead(notification._id)}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    className="delete-notification-btn"
                    onClick={() => deleteNotification(notification._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <p>No notifications yet</p>
              <p className="subtext">When you get notifications, they'll appear here</p>
            </div>
          ))}
        </>
      </div>
    </div>
  );
};

export default NotificationsPage;
