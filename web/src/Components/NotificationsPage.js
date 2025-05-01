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

      // Mark all notifications as read
      if (data.length > 0) {
        await Promise.all(data.map(notification => markNotificationAsRead(notification._id)));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async notificationId => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://studevent-server.vercel.app/api/notifications/mark-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ notificationId })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const handleTrackerClick = trackerId => {
    navigate(`/tracker/${trackerId}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back
        </button>
        <h1>Notifications</h1>
      </div>

      <div className="notifications-container">
        {loading ? (
          <div className="loading-spinner">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <div key={notification._id} className="notification-item">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
              {notification.type === 'tracker' && (
                <button
                  className="view-tracker-btn"
                  onClick={() => handleTrackerClick(notification.trackerId)}
                >
                  View Tracker
                </button>
              )}
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