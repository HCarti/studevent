import React, { useState } from 'react';
import './Sidebar.css';
import { FaUser, FaUserPlus, FaUsers } from "react-icons/fa";
import { GrDocumentUser } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <MdDashboard />, path: '/superadmin/controlpanel' },
    { name: 'Users', icon: <FaUsers />, path: '/superadmin/adminuser' },
    { name: 'Add User', icon: <FaUserPlus />, path: '/superadmin/adduser' }
  ];

  return (
    <div 
      className={`sidebar-superadmin ${isHovered ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {menuItems.map((item, index) => (
        <div 
          key={index}
          className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
          style={{ '--index': index }}
          aria-label={item.name}
          title={item.name}
        >
          <div className="sidebar-icon">{item.icon}</div>
          <span className={`sidebar-text ${isHovered ? '' : 'hidden'}`}>
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;