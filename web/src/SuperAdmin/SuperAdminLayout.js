// SuperAdminLayout.js
// SuperAdminLayout.js
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';


const SuperAdminLayout = () => {

  return (
    <div className="superadmin-layout">
      <Sidebar />
      <div className="superadmin-content">
        <Outlet /> {/* This will render the matched child route */}
      </div>
    </div>
  );
};

export default SuperAdminLayout;