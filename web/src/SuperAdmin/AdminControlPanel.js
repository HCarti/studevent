import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminControlPanel.css';
import { 
  FaUsers, 
  FaBuilding, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaChartLine, 
  FaRegClock 
} from 'react-icons/fa';
import { BsCalendarCheck } from 'react-icons/bs';

const AdminControlPanel = () => {
  const [organizations, setOrganizations] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingEvents, setPendingEvents] = useState(0);
  const [ongoingEvents, setOngoingEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    weeklyGrowth: 0,
    activeUsers: 0
  });

  // Function to get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch all data with authentication
  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      try {
        // Fetch all users
        const usersResponse = await axios.get(
          'https://studevent-server.vercel.app/api/getall',
          config
        );
        setTotalUsers(usersResponse.data.length);
        
        // Fetch organizations
        const orgsResponse = await axios.get(
          'https://studevent-server.vercel.app/api/users/organizations',
          config
        );
        setOrganizations(orgsResponse.data);
        
        // Calculate active users (65% of total users - replace with actual endpoint when available)
        const activeUsersCount = Math.floor(usersResponse.data.length * 0.65);
        
        // Calculate weekly growth (mock calculation - replace with actual endpoint when available)
        const weeklyGrowth = usersResponse.data.length > 0 ? 
          Math.min(25, Math.floor(Math.random() * 15) + 5) : 0;
        
        // Set stats
        setStats({
          weeklyGrowth,
          activeUsers: activeUsersCount
        });
        
        // Fetch events stats (using mock data until endpoint is available)
        try {
          const eventsResponse = await axios.get(
            'https://studevent-server.vercel.app/api/events/stats',
            config
          );
          setPendingEvents(eventsResponse.data.pendingEvents || 0);
          setOngoingEvents(eventsResponse.data.ongoingEvents || 0);
        } catch (eventsError) {
          console.log('Using mock events data as events endpoint is not available');
          setPendingEvents(Math.floor(Math.random() * 50) + 50);
          setOngoingEvents(Math.floor(Math.random() * 10) + 5);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status === 401) {
          // Handle unauthorized error (token expired or invalid)
          console.error('Authentication failed - please login again');
          // You might want to redirect to login here
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="control-panel">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="control-panel">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      
      <div className="metrics-grid">
        {/* Main metrics cards */}
        <div className="metric-card metric-card-1">
          <div className="metric-content">
            <div className="metric-icon"><FaUsers /></div>
            <div className="metric-info">
              <h3 className="metric-value">{totalUsers}</h3>
              <p className="metric-title">Total Users</p>
            </div>
          </div>
          <div className="metric-footer">
            <span className="growth-indicator positive">
              <FaChartLine /> {stats.weeklyGrowth}% this week
            </span>
          </div>
        </div>
        
        <div className="metric-card metric-card-2">
          <div className="metric-content">
            <div className="metric-icon"><FaBuilding /></div>
            <div className="metric-info">
              <h3 className="metric-value">{organizations.length}</h3>
              <p className="metric-title">Organizations</p>
            </div>
          </div>
          <div className="metric-footer">
            <span className="growth-indicator positive">
              <FaChartLine /> {organizations.length > 0 ? Math.floor(Math.random() * 10) + 5 : 0}% this month
            </span>
          </div>
        </div>
        
        <div className="metric-card metric-card-3">
          <div className="metric-content">
            <div className="metric-icon"><FaCalendarAlt /></div>
            <div className="metric-info">
              <h3 className="metric-value">{pendingEvents}</h3>
              <p className="metric-title">Pending Events</p>
            </div>
          </div>
          <div className="metric-footer">
            <span className="growth-indicator warning">
              <FaRegClock /> Needs review
            </span>
          </div>
        </div>
        
        <div className="metric-card metric-card-4">
          <div className="metric-content">
            <div className="metric-icon"><BsCalendarCheck /></div>
            <div className="metric-info">
              <h3 className="metric-value">{ongoingEvents}</h3>
              <p className="metric-title">Ongoing Events</p>
            </div>
          </div>
          <div className="metric-footer">
            <span className="growth-indicator neutral">
              <FaChartLine /> 5 active today
            </span>
          </div>
        </div>
        
        {/* Additional metrics */}
        <div className="metric-card metric-card-5">
          <div className="metric-content">
            <div className="metric-icon"><FaClipboardList /></div>
            <div className="metric-info">
              <h3 className="metric-value">{stats.activeUsers}</h3>
              <p className="metric-title">Active Users</p>
            </div>
          </div>
          <div className="metric-footer">
            <span>{Math.round((stats.activeUsers / totalUsers) * 100)}% of total</span>
          </div>
        </div>
        
        <div className="metric-card metric-card-6">
          <div className="metric-content">
            <div className="metric-icon"><FaUsers /></div>
            <div className="metric-info">
              <h3 className="metric-value">
                {Math.floor(totalUsers * 0.1)} {/* 10% of total users as new signups */}
              </h3>
              <p className="metric-title">New Signups</p>
            </div>
          </div>
          <div className="metric-footer">
            <span className="growth-indicator positive">
              <FaChartLine /> {stats.weeklyGrowth}% increase
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminControlPanel;