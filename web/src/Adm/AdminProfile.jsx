import React, { useState } from 'react';
import './AdminProfile.css';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false); // For editing account info
  const [isEditingPassword, setIsEditingPassword] = useState(false); // For editing password info
  const [profilePic, setProfilePic] = useState(null);

  // Toggle editing mode for account info
  const handleEditClick = () => {
    setIsEditing(!isEditing);
    setIsEditingPassword(false); // Disable password editing if it's active
  };

  // Toggle editing mode for password and security
  const handlePasswordEditClick = () => {
    setIsEditingPassword(!isEditingPassword);
    setIsEditing(false); // Disable account editing if it's active
  };

  // Handle profile picture upload
  const handlePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result); // Set the image as a base64 URL
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  return (
    <div className="m-container">
      <h2 style={{ color: '#3246a8' }}>PROFILE</h2>
      <div className="profile-container">
        <div className="profile-left">
          <div className="profile-pic">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="profile-image" />
            ) : (
              <p>No Picture</p>
            )}
          </div>
          <h2>Basil Santiago</h2>
          
          {/* Upload button */}
          <input 
            type="file" 
            accept="image/*" 
            className="upload-input" 
            onChange={handlePictureUpload} 
            style={{ display: 'none' }} 
            id="upload-input" 
          />
          <label htmlFor="upload-input" className="upload-btn">
            Upload Picture
          </label>

          <button className="edit-btn" onClick={handleEditClick}>
            {isEditing ? 'Cancel' : 'Edit Account'}
          </button>
          <p>Joined June 6, 2023</p>
        </div>

        <div className="profile-right">
          {isEditing ? (
            <form>
              <label>First Name:</label>
              <input type="text" defaultValue="Basil" />
              <label>Last Name:</label>
              <input type="text" defaultValue="Santiago" />
              <button className="save-btn" onClick={handleEditClick}>Save</button>
            </form>
          ) : isEditingPassword ? (
            <form>
              <label>Current Password:</label>
              <input type="password" placeholder="Enter current password" />
              <label>New Password:</label>
              <input type="password" placeholder="Enter new password" />
              <label>Confirm Password:</label>
              <input type="password" placeholder="Confirm new password" />
              
              {/* Save and Cancel buttons side by side */}
              <div className="button-group">
                <button className="save-btn" onClick={handlePasswordEditClick}>Save</button>
                <button className="cancel-btn" onClick={handlePasswordEditClick}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <form>
                <label>First Name:</label>
                <input type="text" value="Basil" readOnly />
                <label>Last Name:</label>
                <input type="text" value="Santiago" readOnly />
                <label>Email:</label>
                <input type="email" value="admin@gmail.com" readOnly />
              </form>
              <div className="password-security" onClick={handlePasswordEditClick}>
                <div className="security-icon"></div>
                <p>Password and Security</p>
                <small>Organize your passwords and protect login</small>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
