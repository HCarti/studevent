import React, { useState } from 'react'; 
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import AdminHome from './Adm/AdminHome';
import Organizations from './NavbarComp/Organizations';
import ViewAllOrganizations from './NavbarComp/ViewAllOrganizations'; // Import ViewAllOrganizations
import ProgressTracker from './OrgMems/ProgressTracker';
import OrgMemHome from './OrgMems/OrgMemHome';
import OrganizationEvents from './Components/OrganizationEvents';
import OrgProf from './OrgMems/OrgProf';
import FormsandSig from './OrgMems/FormsandSig';
import Dashboard from './Adm/Dashboard';
import Forms from './Components/Forms';
import Aap from './Forms/Aap';
import Unauthorized from './Unauthorized';
import PageNotFound from './PageNotFound';
import { signedIn } from './hooks/isSignedIn';
import { getUserRole } from './hooks/useUser';
import Budget from './Forms/Budget';
import Project from './Forms/Project';
import DashLiquidation from './Adm/DashLiquidation';
import Proposal from './Adm/Proposal';
import AdminProfile from './Adm/AdminProfile';
import SuperAdminHome from './SuperAdmin/SuperAdmnHome';
import AdminControlPanel from './SuperAdmin/AdminControlPanel';
import SuperAdminLayout from './SuperAdmin/SuperAdminLayout';
import AdminTab from './SuperAdmin/AdminTab';
import SuperAdminAuthorities from './SuperAdmin/SuperAdminAuthorities';
import SuperAdminUsers from './SuperAdmin/SuperAdminUsers';
import SuperAdminAddUser from './SuperAdmin/SuperAdminAddUser';
import AdminFormView from './Adm/AdminFormView';

const App = () => {
   // Initialize state with user and role
   const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isSignedIn = !!user;
  const role = user?.role || '';

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);  // Update state and trigger re-render
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);  // Update state and trigger re-render
  };

  
  return (
    <Router>
      <Navbar isLoggedIn={isSignedIn} user={user} handleLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={isSignedIn ? <Navigate to={role === 'Authority' ? '/admin' : role === 'superadmin' ? '/superadmin' : role === 'Organization' ? '/member' : '/'} /> : <Home />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* SuperAdmin Routes */}
          <Route path="/superadmin" element={<SuperAdminHome />} />
          <Route path="/calendar" element={<OrganizationEvents />} />
          <Route element={<SuperAdminLayout />}>
            <Route path="/controlpanel" element={<AdminControlPanel />} />
            <Route path="/authorities" element={<SuperAdminAuthorities />} />
            <Route path="/adminuser" element={<SuperAdminUsers />} />
            <Route path="/adduser" element={<SuperAdminAddUser />} />
            <Route path="/admintab" element={<AdminTab />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/calendar" element={<OrganizationEvents />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adminprofile" element={<AdminProfile />} />
          <Route path="/adminproposal" element={<Proposal />} />
          <Route path="/adminliquidation" element={<DashLiquidation />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/adminformview" element={<AdminFormView />} />
          <Route path="/activity" element={<Aap />} />
          <Route path="/project" element={<Project />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/view-all-organizations" element={<ViewAllOrganizations />} /> {/* New route for ViewAllOrganizations */}

          {/* Member Routes */}
          <Route path="/member" element={<OrgMemHome />} />
          <Route path="/calendar" element={<OrganizationEvents />} />
          <Route path="/orgprof" element={<OrgProf />} />
          <Route path="/progtrack" element={<ProgressTracker />} />
          <Route path="/formss" element={<FormsandSig />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/activity" element={<Aap />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/project" element={<Project />} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
	