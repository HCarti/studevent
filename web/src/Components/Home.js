import React, { useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { useNavigate } from 'react-router-dom';
import Person2Icon from '@mui/icons-material/Person2';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NU_logo from '../Images/NU_logo.png';

const Home = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false)
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    setSuccessMessage('');
    setErrorMessage('');

    const data = { email, password };
    try {
        console.log("Attempting to log in with data:", data);
        const response = await axios.post('https://studevent-server.vercel.app/api/users/login', data);
        console.log("Full response data:", response.data);

        const { token, data: user } = response.data;

        if (!token || !user) {
            console.error("Token or user data is missing in the response");
            setErrorMessage("Login failed. Please check your credentials.");
            return;
        }

        const userData = { token, user };
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('token', token);

        console.log('User data successfully stored in localStorage:', userData);

        setUser(user);
        handleLogin(user);

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setSuccessMessage("Login successful! Redirecting...");

    } catch (error) {
        console.error("Login error:", error.response ? error.response.data : error.message);
        setErrorMessage('Invalid email or password.');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                  <div className={`home-input-container ${isFocused ? 'home-input-focused' : ''}`}>
                    <Person2Icon className="home-input-icon" />
                    <input
                      className="home-email-input"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      required
                    />
                  </div>

                  <div className={`home-input-container home-password-container ${passwordFocused ? 'home-input-focused' : ''}`}>
                    <LockIcon className="home-input-icon" />
                    <input
                      className="home-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      required
                    />
                    <button 
                      type="button" 
                      className="home-toggle-password-btn"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                  </div>
                  <button type="submit" className="home-login-btn">Log in</button>
                  {successMessage && <p className="home-success-message">{successMessage}</p>}
                  {errorMessage && <p className="home-error-message">{errorMessage}</p>}
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
      </div>
    </ParallaxProvider>
  );
};

export default Home;