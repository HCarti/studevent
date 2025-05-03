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

  const getActionColor = (action) => {
    if (action.includes('deleted')) return '#ffebee';
    if (action.includes('created')) return '#e8f5e9';
    if (action.includes('updated')) return '#e3f2fd';
    if (action.includes('change')) return '#fff8e1';
    return '#f5f5f5';
  };

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
      
      <div className="activity-table-container">
        <table className="activity-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Date</th>
              <th>Action</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.map((activity) => (
              <tr 
                key={activity.id}
                style={{ backgroundColor: getActionColor(activity.action) }}
              >
                <td>
                  <div className="user-cell">
                    <span className="user-avatar">{activity.user.charAt(0).toUpperCase()}</span>
                    {activity.user}
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${activity.role}`}>
                    {activity.role}
                  </span>
                </td>
                <td>
                  <div className="datetime-cell">
                    <span className="date">{activity.date}</span>
                    <span className="time">{activity.time}</span>
                  </div>
                </td>
                <td>
                  <span className="action-cell">
                    {activity.action}
                  </span>
                </td>
                <td className="description-cell">
                  {activity.description}
                  <div className="action-links">
                    {activity.action.includes('Post') && (
                      <>
                        <a href="#">View</a>
                        <a href="#">Edit</a>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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