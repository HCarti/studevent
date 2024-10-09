import React, { useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { Navigate, useNavigate } from 'react-router-dom';
import Person2Icon from '@mui/icons-material/Person2';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NU_logo from '../Images/NU_logo.png';
import facebookIcon from '../Images/facebook.png';
import twitterIcon from '../Images/twitter.png';
import instagramIcon from '../Images/instagram.png';
import EmailIcon from '@mui/icons-material/Email';  
import PhoneIcon from '@mui/icons-material/Phone';  
 
const Home = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState({});
 
  useEffect(() => {
    const getUser = async () => {
      const user = localStorage.getItem("user");
      if (user) {
        setUser(user);
      } else {
        console.log("error getting user");
      }
    };
    getUser();
  }, []);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const data = { email: email, password: password };
 
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', data);
      const { token, data: userData } = response.data;
 
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
 
      const { role } = userData;
 
      localStorage.setItem('token', token);
 
      if (role === "Organization") {
        navigate("/member");
      } else if (role === "Authority") {
        navigate("/admin");
      } else if (role === "SuperAdmin") {
        navigate("/superadmin");
      } else if (role === "Admin"){
        navigate ("/admin")
      }
    } catch (error) {
      setError('Invalid email or password.');
    }
  };
 
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  return (
    <ParallaxProvider>
      <React.Fragment>
        {user?.role === "Organization" ? (
          <Navigate to="/member" />
        ) : user?.role === "admin" ? (
          <Navigate to="/admin" />
        ) : user?.role === "superadmin" ? (
          <Navigate to="/superadmin" />
        ) : (
          <div className="parallax-container">
            {/* Parallax Section 1 */}
            <Parallax className="parallax-bg" y={[-20, 20]} tagOuter="div">
              <div className="parallax-section one">
                <div className="login-container">
                  <div id="loginBox" className="login-box">
                    <h2>LOG IN TO YOUR ACCOUNT</h2>
                    <form onSubmit={handleSubmit}>
                      <div className={`input-container ${isFocused ? 'input-focused' : ''}`}>
                        <Person2Icon />
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          required
                        />
                      </div>
 
                      <div className={`input-container password-container ${passwordFocused ? 'input-focused' : ''}`}>
                        <LockIcon />
                        <input
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
                          className="toggle-password-btn"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                      </div>
 
                      <button type="submit" className="login-button">Log in</button>
                      {error && <p className="error-message">{error}</p>}
                    </form>
                  </div>
 
                  <div className="logo-container">
                    <img src={NU_logo} alt="NU Logo" className="nu-logo" />
                  </div>
 
                  <div className="footer-text">
                    <h3>NU MOA - SDAO SYSTEM</h3>
 
                    <p>SDAO manages the student activities and development programs of</p>
                    <p>the institution with the help of the student councils and student</p>
                    <p>organizations.</p>
                  </div>
                </div>
              </div>
            </Parallax>
 
            {/* Parallax Section 2 */}
            <Parallax className="parallax-bg" y={[10, -10]} tagOuter="div">
              <div className="parallax-section two">
                <div className="content-section">
                  <h2>About Us</h2>
                 
                  <p> At SDAO (Student Development and Activities Office), we are committed to enriching the student experience</p>
                  <p>by managing a wide range of student activities and development programs.</p>
                  <p> Working hand-in-hand with student councils and organizations,</p>
                  <p>we strive to create a dynamic and engaging environment that fosters leadership, teamwork, and personal growth.</p>
                  <p>Our goal is to support and empower students in making the most of their academic journey</p>
                  <p>through meaningful opportunities and initiatives that promote holistic development.</p>
                </div>
              </div>
            </Parallax>
 
            {/* Parallax Section 3 - Footer */}
            <Parallax>
              <div className="parallax-section three">
              <footer className="footer">
   <div className="footer-container">
    <div className="footer-section contact-info">
      <h4 style={{fontSize:'15px'}}>Contact Us</h4>
      <div className="contact-item">
        <EmailIcon />
        <span>SDAO@students.nu-moa.edu.ph</span>
      </div>
      <div className="contact-item">
        <PhoneIcon />
        <span>09-xxxxxxxxx</span>
      </div>
    </div>
 
    {/* Follow Us Section - Centered */}
    <div className="footer-section social-icons-container">
      <h4>Follow Us:</h4>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <img src={facebookIcon} alt="Facebook" className="social-icon" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <img src={twitterIcon} alt="Twitter" className="social-icon" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <img src={instagramIcon} alt="Instagram" className="social-icon" />
        </a>
      </div>
    </div>
 
    <div className="footer-section copyright-info">
      <h4 style={{fontSize:'15px'}}>&copy; 2024 NU MOA - SDAO System</h4>
      <p style={{fontSize:'17px'}}>All rights reserved.</p>
    </div>
  </div>
</footer>
            </div>
        </Parallax>
          </div>
        )}
      </React.Fragment>
    </ParallaxProvider>
  );
};
 
export default Home;