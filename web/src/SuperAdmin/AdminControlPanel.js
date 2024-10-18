import React, { useEffect, useState }from 'react';
import axios from 'axios';
import './AdminControlPanel.css';
import { FaUsers, FaBuilding, FaCalendarAlt, FaClipboardList } from 'react-icons/fa'; // Updated icons

const AdminControlPanel = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for data fetching

  useEffect(() => {
    const fetchOrganizations = async () => {
try {
    const response = await axios.get('http://localhost:8000/api/users');
    console.log('API Response:', response.data); // Log the entire response data
    const filteredOrganizations = response.data.filter(user => user.role === 'Organization');
    console.log('Filtered Organizations:', filteredOrganizations); // Log filtered organizations
    setOrganizations(filteredOrganizations);
} catch (error) {
    console.error('Error fetching organizations:', error);
} finally {
    setLoading(false);
}
};

    fetchOrganizations();
}, []);


  return (
    <div className="control-pan">
      <h1 className="dashboard-title">Summary Dashboard</h1>
      <div className="outer-p">
        <div className="c-box c-box-1">
          <FaUsers className="icon" />
          <h4 className="metric-value">{organizations.length}</h4>
          <h2 className="metric-title">Total Users</h2>
        </div>
        <div className="c-box c-box-2">
          <FaBuilding className="icon" />
          <h4 className="metric-value">{organizations.length}</h4>
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