import React, { useState } from 'react';
import './SuperAdminLogs.css';

const SuperAdminLogs = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - in a real app, this would come from your API
  const activities = [
    {
      id: 1300,
      user: 'mark_ashten',
      role: 'administration',
      date: 'May 30, 2022',
      time: '5:00 pm',
      action: 'User updated',
      description: 'A user with username (blog) and email (blog@blog.com) was updated',
      category: 'user'
    },
    {
      id: 1299,
      user: 'mark_ashten',
      role: 'administration',
      date: 'May 30, 2022',
      time: '4:59 pm',
      action: 'Post deleted',
      description: 'Deleted post Android (ID:1122)',
      category: 'content'
    },
    {
      id: 1298,
      user: 'mark_ashten',
      role: 'administration',
      date: 'May 30, 2022',
      time: '4:59 pm',
      action: 'Post deleted',
      description: 'Deleted post Design (ID:1289)',
      category: 'content'
    },
    {
      id: 1296,
      user: 'mark_ashten',
      role: 'administration',
      date: 'May 30, 2022',
      time: '4:59 pm',
      action: 'Post status change',
      description: 'Post status changed from new to publish Docs (ID:1295)',
      category: 'content'
    },
    {
      id: 1297,
      user: 'john_doe',
      role: 'editor',
      date: 'May 30, 2022',
      time: '4:59 pm',
      action: 'Post created',
      description: 'Created post Docs',
      category: 'content'
    },
    {
      id: 1293,
      user: 'jane_smith',
      role: 'author',
      date: 'May 30, 2022',
      time: '4:59 pm',
      action: 'Post status change',
      description: 'Post status changed from new to publish Design (ID:1292)',
      category: 'content'
    },
    {
      id: 1294,
      user: 'alex_wong',
      role: 'organization',
      date: 'May 30, 2022',
      time: '4:59 pm',
      action: 'Post created',
      description: 'Created post Design',
      category: 'content'
    },
  ];

  const filteredActivities = activities.filter(activity => {
    // Filter by role/category
    if (filter !== 'all' && activity.category !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && 
        !activity.user.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !activity.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !activity.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="activity-logs-container">
      <div className="activity-header">
        <h1>Activity Logs</h1>
        <p>Monitor all user activities across the system</p>
      </div>
      
      <div className="activity-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All actions</option>
            <option value="user">User actions</option>
            <option value="content">Content actions</option>
            <option value="system">System actions</option>
          </select>
        </div>
      </div>
      
      <div className="activity-list">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <div className="activity-card-header">
              <div className="user-avatar">
                {activity.user.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{activity.user}</div>
                <span className={`role-badge ${activity.role}`}>
                  {activity.role}
                </span>
              </div>
            </div>
            
            <div className="activity-details">
              <div className="activity-detail">
                <span className="detail-label">Date</span>
                <span className="detail-value">{activity.date}</span>
              </div>
              <div className="activity-detail">
                <span className="detail-label">Time</span>
                <span className="detail-value">{activity.time}</span>
              </div>
              <div className="activity-detail">
                <span className="detail-label">Action</span>
                <span className="detail-value">{activity.action}</span>
              </div>
            </div>
            
            <div className="activity-description">
              {activity.description}
            </div>
            
            {activity.action.includes('Post') && (
              <div className="action-links">
                <a href="#">View</a>
                <a href="#">Edit</a>
              </div>
            )}
          </div>
        ))}
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