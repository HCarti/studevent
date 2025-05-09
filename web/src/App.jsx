import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import AdminHome from './Adm/AdminHome';
import Organizations from './NavbarComp/Organizations';
import ViewAllOrganizations from './NavbarComp/ViewAllOrganizations';
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
import Budget from './Forms/Budget';
import Project from './Forms/Project';
import Liquidation from './Forms/Liquidation';
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
import FormDetails from './Adm/FormDetails';
import LocalOffCampus from './Forms/LocalOffCampus';
import OrgTrackerViewer from './OrgMems/OrgTrackerViewer';
import Footer from './Components/footer';
import EventTrackerList from './Components/EventTrackerList';
import OrgSubmittedForms from './OrgMems/OrgSubmittedForms';
import SuperAdminProfile from './SuperAdmin/SuperAdminProfile';
import NotificationsPage from './Components/NotificationsPage';
import SuperAdminLogs from './SuperAdmin/SuperAdminLogs';
import SuperAdminCalendar from './SuperAdmin/SuperAdminCalendar';

// Global styles to hide scrollbar
const globalStyles = `
  body, html {
    overflow-x: hidden;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  body::-webkit-scrollbar, html::-webkit-scrollbar {
    display: none;
    width: 0;
  }
`;

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = !!user;
  const userRole = user?.role || '';

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Role-specific layout components
const AdminLayout = ({ children }) => (
  <ProtectedRoute allowedRoles={['Admin', 'Authority']}>{children}</ProtectedRoute>
);

const SuperAdminLayoutWrapper = ({ children }) => (
  <ProtectedRoute allowedRoles={['SuperAdmin']}>
    <SuperAdminLayout>{children}</SuperAdminLayout>
  </ProtectedRoute>
);

const MemberLayout = ({ children }) => (
  <ProtectedRoute allowedRoles={['Organization']}>{children}</ProtectedRoute>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [styleElement, setStyleElement] = useState(null);

  // Function to check window width and apply/remove styles accordingly
  const handleResize = () => {
    const isMobile = window.innerWidth < 500;

    if (isMobile && !styleElement) {
      const newStyleElement = document.createElement('style');
      newStyleElement.innerHTML = globalStyles;
      document.head.appendChild(newStyleElement);
      setStyleElement(newStyleElement);
    } else if (!isMobile && styleElement) {
      // Safely check if element exists and is a child before removing
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
      setStyleElement(null);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Initial check for screen size
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [styleElement]);

  const handleLogin = userData => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
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
            element={
              isSignedIn ? (
                <Navigate
                  to={
                    role === 'Organization'
                      ? '/member'
                      : role === 'Authority' || role === 'Admin'
                      ? '/admin'
                      : role === 'SuperAdmin'
                      ? '/superadmin'
                      : '/unauthorized'
                  }
                />
              ) : (
                <Home handleLogin={handleLogin} />
              )
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Public Routes */}
          <Route path="/calendar" element={<OrganizationEvents />} />
          <Route path="/trackerlist" element={<EventTrackerList />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/view-all-organizations" element={<ViewAllOrganizations />} />
          <Route path="/formss" element={<FormsandSig />} />

          {/* Notifications Route */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['Organization', 'Admin', 'Authority', 'SuperAdmin']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* SuperAdmin Routes */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']}>
                <SuperAdminHome /> {/* Standalone home without layout */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadminprofile"
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']}>
                <SuperAdminProfile /> {/* Standalone profile without layout */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']}>
                <SuperAdminLayoutWrapper /> {/* Layout wrapper for sidebar routes */}
              </ProtectedRoute>
            }
          >
            <Route path="s-admincalendar" element={<SuperAdminCalendar />} />
            <Route path="s-adminlogs" element={<SuperAdminLogs />} />
            <Route path="controlpanel" element={<AdminControlPanel />} />
            <Route path="authorities" element={<SuperAdminAuthorities />} />
            <Route path="adminuser" element={<SuperAdminUsers />} />
            <Route path="adduser" element={<SuperAdminAddUser />} />
            <Route path="admintab" element={<AdminTab />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminHome />
              </AdminLayout>
            }
          />

          <Route
            path="/formdetails/:formId"
            element={
              <AdminLayout>
                <FormDetails />
              </AdminLayout>
            }
          />

          <Route
            path="/dashboard"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />

          <Route
            path="/adminprofile"
            element={
              <AdminLayout>
                <AdminProfile />
              </AdminLayout>
            }
          />

          <Route
            path="/adminproposal"
            element={
              <AdminLayout>
                <Proposal />
              </AdminLayout>
            }
          />

          <Route
            path="/adminformview"
            element={
              <AdminLayout>
                <AdminFormView />
              </AdminLayout>
            }
          />

          {/* Member Routes */}
          <Route
            path="/member"
            element={
              <MemberLayout>
                <OrgMemHome />
              </MemberLayout>
            }
          />

          <Route
            path="/forms"
            element={
              <MemberLayout>
                <Forms role={role} />
              </MemberLayout>
            }
          />

          <Route
            path="/orgTrackerViewer/:formId"
            element={
              <MemberLayout>
                <OrgTrackerViewer />
              </MemberLayout>
            }
          />

          <Route
            path="/organization/:studentOrganization/forms"
            element={
              <MemberLayout>
                <OrgSubmittedForms />
              </MemberLayout>
            }
          />

          <Route
            path="/edit-budget/:formId"
            element={
              <MemberLayout>
                <Budget />
              </MemberLayout>
            }
          />

          <Route
            path="/edit-form/:formId"
            element={
              <MemberLayout>
                <Aap />
              </MemberLayout>
            }
          />

        <Route
          path="/project/:formId"
          element={
            <MemberLayout>
              <Project />
            </MemberLayout>
          }
        />

          <Route
            path="/localoffcampus"
            element={
              <MemberLayout>
                <LocalOffCampus />
              </MemberLayout>
            }
          />

          <Route
            path="/liquidation"
            element={
              <MemberLayout>
                <Liquidation />
              </MemberLayout>
            }
          />

          {/* Common Form Routes */}
          <Route
            path="/orgprof"
            element={
              <ProtectedRoute allowedRoles={['Organization', 'Admin', 'Authority']}>
                <OrgProf />
              </ProtectedRoute>
            }
          />

          <Route
            path="/progtrack/:formId"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Authority','SuperAdmin']}>
                <ProgressTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activity"
            element={
              <ProtectedRoute allowedRoles={['Organization', 'Admin', 'Authority']}>
                <Aap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project"
            element={
              <ProtectedRoute allowedRoles={['Organization', 'Admin', 'Authority']}>
                <Project />
              </ProtectedRoute>
            }
          />

          <Route
            path="/budget"
            element={
              <ProtectedRoute allowedRoles={['Organization', 'Admin', 'Authority']}>
                <Budget />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
