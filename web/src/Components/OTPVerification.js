import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState(''); // Email needs to be passed here
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://studevent-server.vercel.app/api/auth/verify-otp', { email, otp });
      setSuccess(response.data.message);
      setError('');
      navigate('/login'); // Redirect to login after successful verification
    } catch (error) {
      setError(error.response.data.message || 'Error verifying OTP');
      setSuccess('');
    }
  };

  return (
    <div>
      <h2>OTP Verification</h2>
      <form onSubmit={handleVerifyOTP}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default OTPVerification;
