import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { FaUserPlus, FaUsers } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { TbLogs } from "react-icons/tb";
import { FaUsersCog } from "react-icons/fa";
import { IoCalendarSharp } from "react-icons/io5";
import { IoTrashBinSharp } from "react-icons/io5";
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Collapse sidebar automatically on small screens
      setIsCollapsed(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: <MdDashboard />, path: '/superadmin/controlpanel' },
    { name: 'Organizations', icon: <FaUsers />, path: '/superadmin/adminuser' },
    // { name: 'Authorities', icon: <FaUsers />, path: '/superadmin/adminusers' },
    { name: 'TrasBin', icon:<IoTrashBinSharp />, path: '/superadmin/s-admintrash-bin' },
    { name: 'Add User', icon: <FaUserPlus />, path: '/superadmin/adduser' },
    { name: 'Activity Logs', icon:<TbLogs />, path: '/superadmin/s-adminlogs' },
    { name: 'Calendar', icon:<IoCalendarSharp />, path: '/superadmin/s-admincalendar' }
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div 
      className={`sidebar-superadmin ${isHovered && !isCollapsed ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => !isCollapsed && setIsHovered(true)}
      onMouseLeave={() => !isCollapsed && setIsHovered(false)}
    >
      <div className="sidebar-content">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleItemClick(item.path)}
            style={{ '--index': index }}
            aria-label={isCollapsed ? item.name : undefined}
            aria-current={location.pathname === item.path ? 'page' : undefined}
          >
            <div className="sidebar-icon">{item.icon}</div>
            <span className={`sidebar-text ${isCollapsed ? 'hidden' : 'visible'}`}>
              {item.name}
            </span>
            <div className="active-indicator" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;