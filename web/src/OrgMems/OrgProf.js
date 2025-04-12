import React, { useEffect, useState, useCallback } from 'react';
import './OrgProf.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PuffLoader } from 'react-spinners'; // Import your preferred loader
import { css } from '@emotion/react'; // For custom styling

const OrgProf = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom CSS for the loader
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      setLoading(true);
      const response = await axios.get('https://studevent-server.vercel.app/api/users/current', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <div className="m-container">
        <div className="sophisticated-loader">
          <PuffLoader
            color="#0046ad"
            loading={loading}
            css={override}
            size={100}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          <p className="loading-text">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-container">
      <div className="profile-container">
        <div className="profile-left">
          <div
            className="profile-pic"
            style={{
              backgroundImage: `url(${user?.logo || user?.image || '/default-profile.png'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <h2>{user?.role === 'Organization' ? user.organizationName : `${user?.firstName} ${user?.lastName}`}</h2>
          <p>{`Joined ${user?.joinedDate || "June 6, 2023"}`}</p>
        </div>
        <div className="profile-right">
          <h2>Account Information</h2>
          <form>
            {user?.role === 'Organization' ? (
              <>
                <label>Organization Name:</label>
                <input className="orgprof-input" type="text" value={user?.organizationName || "Unknown Organization"} readOnly />
                <label>Email:</label>
                <input className="orgprof-input" type="email" value={user?.email || "unknown@email.com"} readOnly />
                <label>Role:</label>
                <input className="orgprof-input" type="text" value={user?.role || "Unknown Role"} readOnly />
              </>
            ) : (
              <>
                <label>First Name:</label>
                <input className="orgprof-input" type="text" value={user?.firstName || "Admin"} readOnly />
                <label>Last Name:</label>
                <input className="orgprof-input" type="text" value={user?.lastName || "Unknown"} readOnly />
                <label>Email:</label>
                <input className="orgprof-input" type="email" value={user?.email || "unknown@email.com"} readOnly />
                <label>Faculty:</label>
                <input className="orgprof-input" type="text" value={user?.faculty || "Unknown"} readOnly />
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrgProf;