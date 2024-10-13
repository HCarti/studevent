import React, { useEffect, useRef, useState } from 'react';
import './Sidebar.css';
import { FaUser, FaUserPlus, FaUsers } from "react-icons/fa";
import { GrDocumentUser } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <MdDashboard />, onClick: () => navigate('/controlpanel') },
    { name: 'Admin', icon: <FaUser />, onClick: () => navigate('/admintab') },
    { name: 'Authorities', icon: <GrDocumentUser />, onClick: () => navigate('/authorities') },
    { name: 'Users', icon: <FaUsers />, onClick: () => navigate('/adminuser') },
    { name: 'Add User', icon: <FaUserPlus />, onClick: () => navigate('/adduser') }
  ];

  return (
    <div 
      className={`sidebar ${isHovered ? 'expanded' : 'collapsed'}`} 
      ref={sidebarRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {menuItems.map((item, index) => (
        <div 
          key={index} 
          className="sidebar-item" 
          onClick={item.onClick}
          aria-label={item.name}
          title={item.name}
        >
          <div className="sidebar-icon">{item.icon}</div>
          <span className={`sidebar-text ${isHovered ? '' : 'hidden'}`}>{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
