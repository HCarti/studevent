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
    console.log('Retrieved user from localStorage:', storedUser); // Add this line for debugging
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  

  useEffect(() => {
    if (user?.role) {
      // Redirect based on user role after login
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
    setSuccessMessage(''); // Clear previous success messages
    setErrorMessage(''); // Clear previous error messages

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

        // Set success message
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
      <React.Fragment>
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
                                className="homeinputEmail"
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
                      className="homeinputPass"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      required/>
                        </div>
                        <button type="submit" className="login-button">Log in</button>
                        {successMessage && <p className="success-message">{successMessage}</p>}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </form>
                </div>

                <div className="logo-container">
                  <img src={NU_logo} alt="NU Logo" className="nu-logo" />
                </div>

                <div className="footer-text">
                  <h3>NU MOA - SDAO SYSTEM</h3>
                  <p>SDAO manages the student activities and development programs of the institution</p> 
                   <p>with the help of the student councils and student organizations.</p>
                </div>
              </div>
            </div>
          </Parallax>

          {/* Parallax Section 2 */}
          <Parallax className="parallax-bg" y={[10, -10]} tagOuter="div">
            <div className="parallax-section two">
              <div className="content-section">
                <h2>About Us</h2>
                 <p> At SDAO (Student Development and Activities Office), we are committed to enriching the student experience by managing</p> 
                   <p>a wide range of student activities and development programs.</p>
                    <p>Working hand-in-hand with student councils and organizations, we strive to create a dynamic and engaging environment that fosters leadership, teamwork, and personal growth.</p> 
                  <p>Our goal is to support and empower students in making the most of their academic journey through meaningful opportunities and initiatives that promote holistic development.</p>
              </div>
            </div>
          </Parallax>
          
        </div>
      </React.Fragment>
    </ParallaxProvider>
  );
};

export default Home;
