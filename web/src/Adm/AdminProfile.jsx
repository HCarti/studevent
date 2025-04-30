import React, { useState } from 'react';
import './AdminProfile.css';
import { FaEdit, FaSave, FaTimes, FaUserCircle, FaCamera } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProfile = () => {
  // State for displaying account information
  const [accountData, setAccountData] = useState({
    firstName: 'Basil',
    lastName: 'Santiago',
    email: 'admin@gmail.com',
  });

  // State for editing account information
  const [editAccountData, setEditAccountData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // State for editing password information
  const [editPasswordData, setEditPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [activeTab, setActiveTab] = useState('account');

  // Toggle editing mode for account info
  const handleEditClick = () => {
    if (!isEditing) {
      setEditAccountData({ ...accountData });
    }
    setIsEditing(!isEditing);
    setIsEditingPassword(false);
    setActiveTab('account');
  };

  // Toggle editing mode for password and security
  const handlePasswordEditClick = () => {
    if (!isEditingPassword) {
      setEditPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setIsEditingPassword(!isEditingPassword);
    setIsEditing(false);
    setActiveTab('security');
  };

  // Handle profile picture upload
  const handlePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes for account info
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setEditAccountData({ ...editAccountData, [name]: value });
  };

  // Handle form input changes for password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setEditPasswordData({ ...editPasswordData, [name]: value });
  };

  // Handle form submission for account info
  const handleSave = (e) => {
    e.preventDefault();
    setAccountData({ ...editAccountData });
    setIsEditing(false);
  };

  // Handle form submission for password
  const handlePasswordSave = (e) => {
    e.preventDefault();
    setEditPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsEditingPassword(false);
  };

  // Handle cancel for account edit
  const handleAccountCancel = () => {
    setIsEditing(false);
    setEditAccountData({ ...accountData });
  };

  // Handle cancel for password edit
  const handlePasswordCancel = () => {
    setIsEditingPassword(false);
    setEditPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <motion.div
      className="admin-profile-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-header">
        <h2 className="profile-title">Admin Profile</h2>
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('account');
              setIsEditingPassword(false);
            }}
          >
            Account
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('security');
              setIsEditing(false);
            }}
          >
            Security
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-pic-container">
            <motion.div
              className="profile-pic"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="profile-image" />
              ) : (
                <FaUserCircle className="placeholder-icon" />
              )}
              <label className="camera-icon" htmlFor="upload-input">
                <FaCamera />
              </label>
            </motion.div>
            <input
              type="file"
              accept="image/*"
              className="upload-input"
              onChange={handlePictureUpload}
              id="upload-input"
            />
          </div>

          <h3 className="admin-name">
            {accountData.firstName} {accountData.lastName}
          </h3>
          <p className="admin-email">{accountData.email}</p>
          <p className="join-date">Joined June 6, 2023</p>

          <button className="edit-btn" onClick={handleEditClick}>
            {isEditing ? (
              <>
                <FaTimes /> Cancel
              </>
            ) : (
              <>
                <FaEdit /> Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="profile-main">
          <AnimatePresence>
            {activeTab === 'account' && (
              <motion.div
                className="tab-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isEditing ? (
                  <form className="edit-form" onSubmit={handleSave}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={editAccountData.firstName}
                          onChange={handleAccountChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={editAccountData.lastName}
                          onChange={handleAccountChange}
                          required
                        />
                      </div>
                      <div className="form-group full-width">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={editAccountData.email}
                          onChange={handleAccountChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        <FaSave /> Save Changes
                      </button>
                      <button type="button" className="cancel-btn" onClick={handleAccountCancel}>
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="account-info">
                    <div className="info-card">
                      <h3>Personal Information</h3>
                      <div className="info-item">
                        <span className="info-label">First Name</span>
                        <span className="info-value">{accountData.firstName}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Last Name</span>
                        <span className="info-value">{accountData.lastName}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{accountData.email}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                className="tab-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isEditingPassword ? (
                  <form className="password-form" onSubmit={handlePasswordSave}>
                    <h3>Change Password</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={editPasswordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={editPasswordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={editPasswordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        <FaSave /> Update Password
                      </button>
                      <button type="button" className="cancel-btn" onClick={handlePasswordCancel}>
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="security-info">
                    <div className="info-card">
                      <h3>Security Settings</h3>
                      <div className="security-card" onClick={handlePasswordEditClick}>
                        <MdSecurity className="security-icon" />
                        <div className="security-details">
                          <h4>Password</h4>
                          <p>Last changed 3 months ago</p>
                        </div>
                        <button className="edit-security-btn">
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfile;