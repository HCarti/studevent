import React from 'react';
import './Sidebar.css';
import { FaUser } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { GrDocumentUser } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleDashboardlick = () => {
    console.log("Dashboard clicked");
    navigate('/controlpanel');
  };

  const handleAdminclick = () => {
    console.log("Admin Tab clicked");
    navigate('/admintab');
  };

  const handleAuthoritiesclick = () => {
    console.log("Authorities Tab clicked");
    navigate('/authorities');
  };

  const handleUsersclick = () => {
    console.log("Authorities Tab clicked");
    navigate('/adminuser');
  };

  const handleAddUsersclick = () => {
    console.log("Authorities Tab clicked");
    navigate('/adduser');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-item" style={{fontSize:'12px'}} onClick={handleDashboardlick}>
                        <MdDashboard style={{ fontSize: '45px', color: '#0175c8' }}/>Dashboard</div>
      <div className="sidebar-item" style={{fontSize:'12px'}}>
                        <FaUser style={{ fontSize: '45px', color: '#0175c8' }} onClick={handleAdminclick}/>Admin</div>
      <div className="sidebar-item" style={{fontSize:'12px'}}>
                        <GrDocumentUser style={{ fontSize: '45px', color: '#0175c8' }} onClick={handleAuthoritiesclick}/>Authorities</div>
      <div className="sidebar-item" style={{fontSize:'12px'}}>
                        <FaUsers style={{ fontSize: '45px', color: '#0175c8' }} onClick={handleUsersclick}/>Users</div>
      <div className="sidebar-item" style={{fontSize:'12px'}}>
                        <FaUserPlus style={{ fontSize: '45px', color: '#0175c8' }} onClick={handleAddUsersclick}/>Add User</div>
    </div>
  );
};

export default Sidebar;
