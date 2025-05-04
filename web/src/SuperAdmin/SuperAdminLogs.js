import React, { useState, useEffect } from 'react';
import './SuperAdminLogs.css';

const SuperAdminLogs = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('https://studevent-server.vercel.app/api/activity-logs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity logs');
        }
        
        const data = await response.json();
        setActivities(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    // Filter by action type
    if (filter !== 'all') {
      if (filter === 'user' && !activity.action.includes('USER_')) {
        return false;
      }
      if (filter === 'content' && !activity.action.includes('POST_')) {
        return false;
      }
      if (filter === 'system' && !activity.action.includes('SYSTEM_')) {
        return false;
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        activity.userEmail.toLowerCase().includes(query) ||
        (activity.targetUserEmail && activity.targetUserEmail.toLowerCase().includes(query)) ||
        activity.action.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Format action type for display
  const formatAction = (action) => {
    return action
      .replace('USER_', '')
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format date and time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="activity-logs-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-logs-container">
        <div className="error-message">
          Error loading activity logs: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="activity-logs-container">
      <div className="activity-header">
        <h1>SuperAdmin Activity Logs</h1>
        <p>Monitor all system activities performed by administrators</p>
      </div>
      
      <div className="activity-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by user, action, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All actions</option>
            <option value="user">User management</option>
            <option value="content">Content actions</option>
            <option value="system">System actions</option>
          </select>
        </div>
      </div>
      
      <div className="activity-list">
        {filteredActivities.map((activity) => {
          const { date, time } = formatDateTime(activity.timestamp);
          
          return (
            <div key={activity._id} className="activity-card">
              <div className="activity-card-header">
                <div className="user-avatar">
                  {activity.userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{activity.userEmail}</div>
                  <span className={`role-badge ${activity.userRole.toLowerCase()}`}>
                    {activity.userRole}
                  </span>
                </div>
                <div className="activity-meta">
                  <span className="activity-date">{date}</span>
                  <span className="activity-time">{time}</span>
                </div>
              </div>
              
              <div className="activity-content">
                <div className="activity-action">
                  <span className="action-label">Action:</span>
                  <span className={`action-value ${activity.action.toLowerCase()}`}>
                    {formatAction(activity.action)}
                  </span>
                </div>
                
                {activity.targetUserEmail && (
                  <div className="activity-target">
                    <span className="target-label">Target User:</span>
                    <span className="target-value">{activity.targetUserEmail}</span>
                    <span className={`role-badge ${activity.targetUserRole.toLowerCase()}`}>
                      {activity.targetUserRole}
                    </span>
                  </div>
                )}
                
                <div className="activity-description">
                  {activity.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredActivities.length === 0 && (
        <div className="no-results">
          <p>No activities found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLogs;