import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleNotificationClick = async notification => {
    // If notification is not read, mark it as read
    if (!notification.read) {
      await markNotificationAsRead(notification._id);
    }

    // Navigate based on notification type
    if (!notification.type) {
      console.log('Notification has no type - showing notification as read only');
      return; // Just mark as read but don't navigate if no type is available
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
        <button className="back-button" onClick={handleBackClick}>
          ← Back
        </button>
      </div>

      <div className="notifications-container">
        {loading ? (
          <div className="loading-spinner">Loading notifications...</div>
        ) : notifications.length > 0 ? (
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
                    onClick={e => {
                      e.stopPropagation();
                      markNotificationAsUnread(notification._id);
                    }}
                  >
                    Mark as Unread
                  </button>
                ) : (
                  <button
                    className="mark-read-btn"
                    onClick={e => {
                      e.stopPropagation();
                      markNotificationAsRead(notification._id);
                    }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <p>No notifications yet</p>
            <p className="subtext">When you get notifications, they'll appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
