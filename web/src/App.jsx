import React, { useState } from 'react'; //fsdfsf
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import AdminHome from './Adm/AdminHome';
import Organizations from './NavbarComp/Organizations';
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
import SuperAdminLayout from './SuperAdmin/SuperAdminLayout'; // Import the new layout
import AdminTab from './SuperAdmin/AdminTab';
import SuperAdminAuthorities from './SuperAdmin/SuperAdminAuthorities';
import SuperAdminUsers from './SuperAdmin/SuperAdminUsers';
import SuperAdminAddUser from './SuperAdmin/SuperAdminAddUser';
import AdminFormView from './Adm/AdminFormView';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));

  const isSignedIn = signedIn();
  const role = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Navbar isLoggedIn={isSignedIn} handleLogout={handleLogout} />
      <div className="main-content">
      <Routes>
        <Route path="/" element={isSignedIn ? <Navigate to={role === 'Authority' ? '/admin' : role === 'superadmin' ? '/superadmin' : '/member'} /> : <Home />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* SuperAdmin Routes */}
        {/* {role === 'superadmin' && ( */}
            <Route path="/superadmin" element={<SuperAdminHome />} />
            <Route path="/orgcalendar" element={<OrganizationEvents />} />
            <Route element={<SuperAdminLayout />}> {/* Wrap SuperAdmin routes in this layout */}
            <Route path="/controlpanel" element={<AdminControlPanel />} />
            <Route path="/authorities" element={<SuperAdminAuthorities />} />
            <Route path="/adminuser" element={<SuperAdminUsers />} />
            <Route path="/adduser" element={<SuperAdminAddUser />} />
            <Route path="/admintab" element={<AdminTab />} />
          </Route>
        {/* )} */}

        {/* Admin Routes */}
        {/* {role === 'admin' && ( */}
          <>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orgcalendar" element={<OrganizationEvents />} />
            <Route path="/adminprofile" element={<AdminProfile />} />
            <Route path="/adminproposal" element={<Proposal />} />
            <Route path="/adminliquidation" element={<DashLiquidation />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/adminformview" element={<AdminFormView />} />
            <Route path="/activity" element={<Aap />} />
            <Route path="/project" element={<Project />} />
            <Route path="/organizations" element={<Organizations />} />
          </>
        {/* )} */}

        {/* Member Routes */}
        {/* {role === 'member' && ( */}
          <>
            <Route path="/member" element={<OrgMemHome />} />
            <Route path="/orgcalendar" element={<OrganizationEvents />} />
            <Route path="/orgprof" element={<OrgProf />} />
            <Route path="/progtrack" element={<ProgressTracker />} />
            <Route path="/formss" element={<FormsandSig />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/activity" element={<Aap />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/project" element={<Project />} />
          </>
        {/* )} */}

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      </div>
    </Router>
  );
};

export default App;
