import React, { useEffect, useState, useCallback } from 'react';
import './OrgProf.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrgProf = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get('https://studevent-server.vercel.app/api/users/current', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
