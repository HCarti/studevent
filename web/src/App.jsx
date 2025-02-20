import React, { useState, useEffect } from 'react'; 
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
import OTPVerification from './Components/OTPVerification';
import FormDetails from './Adm/FormDetails';
import Liquidation from './Forms/Liquidation';
import Waiver from './Forms/Waiver';
import LocalOffCampus from './Forms/LocalOffCampus';
// import MySubmissions from './OrgMems/MySubmissions'; // Import the new page
import Footer from './Components/footer';
import EventTrackerList from './Components/EventTrackerList';


const App = () => {
   // Initialize state with user and role
   const [user, setUser] = useState(null);

   useEffect(() => {
     const savedUser = localStorage.getItem("user");
     if (savedUser && savedUser !== "undefined") {
       try {
         setUser(JSON.parse(savedUser));
       } catch (error) {
         console.error("Error parsing user data:", error);
       }
     }
   }, []);
 
   const handleLogin = (userData) => {
     localStorage.setItem("user", JSON.stringify(userData));
     setUser(userData);
   };
 
   const handleLogout = () => {
     localStorage.removeItem("user");
     setUser(null);
   };
 
   const isSignedIn = !!user;
   const role = user?.role || '';
 
  return (
    <Router>
      <Navbar isLoggedIn={isSignedIn} user={user} handleLogout={handleLogout} />
      <div className="main-content">
        <Routes>
        <Route 
            path="/" 
            element={isSignedIn ? 
              <Navigate to={role === 'Organization' ? '/member' : role === 'Authority' || role === 'Admin' ? '/admin' : role === 'SuperAdmin' ? '/superadmin' : '/unauthorized'} /> 
              : <Home handleLogin={handleLogin} />
            } 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* <Route path="/verification" element={<OTPVerification />} /> */}

          {/* SuperAdmin Routes */}
          <Route path="/superadmin" element={<SuperAdminHome />} />
          <Route path="/calendar" element={<OrganizationEvents />} />
          <Route path="/trackerlist" element={<EventTrackerList />} />
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
          <Route path="/formdetails/:formId" element={<FormDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adminprofile" element={<AdminProfile />} />
          <Route path="/adminproposal" element={<Proposal />} />
          <Route path="/adminliquidation" element={<DashLiquidation />} />
          <Route path="/trackerlist" element={<EventTrackerList />} />
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
          <Route path="/progtrack/:formId" element={<ProgressTracker />} /> {/* Route with formId */}
          <Route path="/formss" element={<FormsandSig />} />
          <Route path="/forms" element={<Forms role={role} />} />
          {/* <Route path="/my-submissions" element={<MySubmissions/>} /> */}
          <Route path="/activity" element={<Aap />} />
          <Route path="/liquidation" element={<Liquidation />} />
          <Route path="/project" element={<Project />} />
          <Route path="/waiver" element={<Waiver />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/localoffcampus" element={<LocalOffCampus />} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
      <Footer/>
    </Router>
  );
};

export default App;
	