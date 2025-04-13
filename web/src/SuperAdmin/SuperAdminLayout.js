// SuperAdminLayout.js
import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import './SuperAdminLayout.css'; // Make sure this CSS file exists

const SuperAdminLayout = () => {
  return (
    <div className="superadmin-layout">
      <Sidebar />
      <div className="superadmin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;