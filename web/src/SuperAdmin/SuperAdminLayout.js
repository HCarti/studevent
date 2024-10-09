import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';  // Import Outlet
import Navbar from '../Components/Navbar';

const SuperAdminLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar /> {/* Sidebar only for SuperAdmin */}
      <div style={{ flex: 1}}>
        {/* Render the nested routes here */}
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;
