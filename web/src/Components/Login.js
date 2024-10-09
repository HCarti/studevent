import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import StudeventLogo from '../Images/Studevent.png'; 

const Login = ({ handleClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { email, password };

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', data);
      const { token, user } = response.data;
      console.log()
      localStorage.setItem('token', token);
      console.log(token)
      localStorage.setItem('user', JSON.stringify(user));
      handleClose();  // Close the modal on successful login

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'member') {
        navigate('/orgmember');
      } else {
        navigate('/');
      }
    } catch (error) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="login-section">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <div className="login-alert">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <div className="options">
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
