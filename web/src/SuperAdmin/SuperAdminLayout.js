import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  return (
    <div className="admin-container">
      <Sidebar />
      <main className="admin-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;