import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  return (
    <div className="admin-dashboard-container">
      <div className="sidebar-content-wrapper">
        <Sidebar />
        <main className="dashboard-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;