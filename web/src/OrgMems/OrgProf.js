import React from 'react';
import './OrgProf.css';
import { useNavigate } from 'react-router-dom';



const OrgProf = () => {

  const navigate = useNavigate();

  const handlePassword = () => {
    console.log("Password has been clicked");
    navigate('/pass');
  };


  return (
    <div className="m-container">
      <h2 style={{color:'#3246a8'}}>PROFILE</h2>
    <div className="profile-container">
      <div className="profile-left">
        <div className="profile-pic"></div>
        <h2>Admin</h2>
        <p>Joined June 6, 2023</p>
      </div>
      <div className="profile-right">
        <form>
          <label>First Name:</label>
          <input type="text" value="Admin" readOnly />
          <label>Last Name:</label>
          <input type="text" value="Santiago" readOnly />
          <label>Email:</label>
          <input type="email" value="admin@email.com" readOnly />
          <label>Admin:</label>
          <input type="text" value="SDAO Coordinator" readOnly />
        </form>
        <div className="password-security">
          <div className="security-icon"></div>
          <p>Password and Security</p>
          <small>Organize your passwords and protect login</small>
        </div>
      </div>
    </div>
    </div>
  );
};

export default OrgProf;
