import React from 'react';
import './AdminControlPanel.css';
import { FaUsers, FaBuilding, FaCalendarAlt, FaClipboardList } from 'react-icons/fa'; // Updated icons

const AdminControlPanel = () => {
  return (
    <div className="control-pan">
      <h1 className="dashboard-title">Summary Dashboard</h1>
      <div className="outer-p">
        <div className="c-box c-box-1">
          <FaUsers className="icon" />
          <h4 className="metric-value">20</h4>
          <h2 className="metric-title">Total Users</h2>
        </div>
        <div className="c-box c-box-2">
          <FaBuilding className="icon" />
          <h4 className="metric-value">15</h4>
          <h2 className="metric-title">Active Organizations</h2>
        </div>
        <div className="c-box c-box-3">
          <FaCalendarAlt className="icon" />
          <h4 className="metric-value">100</h4>
          <h2 className="metric-title">Pending Events</h2>
        </div>
        <div className="c-box c-box-4">
          <FaClipboardList className="icon" />
          <h4 className="metric-value">7</h4>
          <h2 className="metric-title">Ongoing Events</h2>
        </div>
      </div>
    </div>
  );
};

export default AdminControlPanel;
