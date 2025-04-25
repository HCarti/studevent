import React, { useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { useNavigate } from 'react-router-dom';
import Person2Icon from '@mui/icons-material/Person2';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import NU_logo from '../Images/NU_logo.png';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Home = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Retrieved user from localStorage:', storedUser);
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  useEffect(() => {
    if (user?.role) {
      switch (user.role) {
        case 'Organization':
          navigate('/member');
          break;
        case 'Admin':
          navigate('/admin');
          break;
        case 'SuperAdmin':
          navigate('/superadmin');
          break;
        case 'Authority':
          navigate('/admin');
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const data = { email, password };
    try {
        console.log("Attempting to log in with data:", data);
        const response = await axios.post('https://studevent-server.vercel.app/api/users/login', data);
        console.log("Full response data:", response.data);

        const { token, data: user } = response.data;

        if (!token || !user) {
            console.error("Token or user data is missing in the response");
            setSnackbarMessage("Login failed. Please check your credentials.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            setLoading(false);
            return;
        }

        const userData = { token, user };
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('token', token);

        console.log('User data successfully stored in localStorage:', userData);

        setUser(user);
        handleLogin(user);

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setSnackbarMessage("Login successful! Redirecting...");
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

    } catch (error) {
        console.error("Login error:", error.response ? error.response.data : error.message);
        const errorMsg = error.response?.data?.message || 'Invalid email or password.';
        setSnackbarMessage(errorMsg);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    } finally {
        setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({...errors, email: ''});
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({...errors, password: ''});
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <ParallaxProvider>
      <div className="home-parallax-container">
        {/* Login Section */}
        <Parallax className="home-parallax-bg" y={[-20, 20]} tagOuter="div">
          <div className="home-login-section">
            <div className="home-login-container">
              <div className="home-login-box">
                <h2 className="home-login-title">Login to your account </h2>
                <form onSubmit={handleSubmit}>
                  <div className={`home-input-container ${isFocused ? 'home-input-focused' : ''} ${errors.email ? 'home-input-error' : ''}`}>
                    <Person2Icon className="home-input-icon" />
                    <input
                      className="home-email-input"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={handleEmailChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => {
                        setIsFocused(false);
                        if (email && !validateEmail(email)) {
                          setErrors({...errors, email: 'Please enter a valid email address'});
                        }
                      }}
                    />
                  </div>
                  {errors.email && <p className="home-error-text">{errors.email}</p>}

                  <div className={`home-input-container home-password-container ${passwordFocused ? 'home-input-focused' : ''} ${errors.password ? 'home-input-error' : ''}`}>
                    <LockIcon className="home-input-icon" />
                    <input
                      className="home-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        setPasswordFocused(false);
                        if (password && !validatePassword(password)) {
                          setErrors({...errors, password: 'Password must be at least 8 characters'});
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="home-toggle-password-btn"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                  </div>
                  {errors.password && <p className="home-error-text">{errors.password}</p>}

                  <button 
                    type="submit" 
                    className="home-login-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Log in'
                    )}
                  </button>
                </form>
              </div>

              <div className="home-logo-container">
                <img src={NU_logo} alt="NU Logo" className="home-nu-logo" />
              </div>

              <div className="home-footer-text">
                <h3>NU MOA - SDAO SYSTEM</h3>
                <p>SDAO manages the student activities and development programs of the institution</p> 
                <p>with the help of the student councils and student organizations.</p>
              </div>
            </div>
          </div>
        </Parallax>

        {/* About Section */}
        <Parallax className="home-parallax-bg" y={[10, -10]} tagOuter="div">
          <div className="home-about-section">
            <div className="home-about-content">
              <h2 className="home-about-title">About Us</h2>
              <p> At SDAO (Student Development and Activities Office), we are committed to enriching the student experience by managing</p> 
              <p>a wide range of student activities and development programs.</p>
              <p>Working hand-in-hand with student councils and organizations, we strive to create a dynamic and engaging environment that fosters leadership, teamwork, and personal growth.</p> 
              <p>Our goal is to support and empower students in making the most of their academic journey through meaningful opportunities and initiatives that promote holistic development.</p>
            </div>
          </div>
        </Parallax>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </ParallaxProvider>
  );
};

export default Home;