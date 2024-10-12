import React, { useState } from 'react';
import './AdminProfile.css';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md'; // Updated icon for manage password
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

  const [isEditing, setIsEditing] = useState(false); // For editing account info
  const [isEditingPassword, setIsEditingPassword] = useState(false); // For editing password info
  const [profilePic, setProfilePic] = useState(null);

  // Toggle editing mode for account info
  const handleEditClick = () => {
    if (!isEditing) {
      // Initialize editAccountData with current accountData
      setEditAccountData({ ...accountData });
    }
    setIsEditing(!isEditing);
    setIsEditingPassword(false); // Disable password editing if it's active
  };

  // Toggle editing mode for password and security
  const handlePasswordEditClick = () => {
    if (!isEditingPassword) {
      // Initialize editPasswordData with empty fields
      setEditPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
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
    // Implement save functionality here (e.g., API call)
    setAccountData({ ...editAccountData });
    setIsEditing(false);
    // Optionally, show a success message
  };

  // Handle form submission for password
  const handlePasswordSave = (e) => {
    e.preventDefault();
    // Implement password update functionality here (e.g., API call)
    setEditPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsEditingPassword(false);
    // Optionally, show a success message
  };

  // Handle cancel for account edit
  const handleAccountCancel = () => {
    setIsEditing(false);
    setEditAccountData({ ...accountData }); // Reset editAccountData
  };

  // Handle cancel for password edit
  const handlePasswordCancel = () => {
    setIsEditingPassword(false);
    setEditPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }); // Reset editPasswordData
  };

  return (
    <motion.div
      className="m-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="profile-title">Admin Profile</h2>
      <div className="profile-container">
        <div className="profile-left">
          <motion.div
            className="profile-pic"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="profile-image" />
            ) : (
              <div className="placeholder-pic">
                <FaEdit size={40} color="#bbb" />
              </div>
            )}
          </motion.div>
          <input
            type="file"
            accept="image/*"
            className="upload-input"
            onChange={handlePictureUpload}
            id="upload-input"
          />
          <label htmlFor="upload-input" className="upload-btn">
            Upload Picture
          </label>

          <h3 className="admin-name">
            {accountData.firstName} {accountData.lastName}
          </h3>
          <p className="join-date">Joined June 6, 2023</p>

          <button className="edit-btn" onClick={handleEditClick}>
            {isEditing ? (
              <>
                <FaTimes /> Cancel
              </>
            ) : (
              <>
                <FaEdit /> Edit Account
              </>
            )}
          </button>
        </div>

        <div className="profile-right">
          <AnimatePresence>
            {isEditing && (
              <motion.form
                className="edit-form"
                onSubmit={handleSave}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="firstName">First Name:</label>
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
                  <label htmlFor="lastName">Last Name:</label>
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
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editAccountData.email}
                    onChange={handleAccountChange}
                    required
                  />
                </div>
                <div className="button-group">
                  <button type="submit" className="save-btn">
                    <FaSave /> Save
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleAccountCancel}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              </motion.form>
            )}

            {isEditingPassword && (
              <motion.form
                className="password-form"
                onSubmit={handlePasswordSave}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3>Password & Security</h3>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password:</label>
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
                  <label htmlFor="newPassword">New Password:</label>
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
                  <label htmlFor="confirmPassword">Confirm Password:</label>
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
                <div className="button-group">
                  <button type="submit" className="save-btn">
                    <FaSave /> Save
                  </button>
                  <button type="button" className="cancel-btn" onClick={handlePasswordCancel}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              </motion.form>
            )}

            {!isEditing && !isEditingPassword && (
              <motion.div
                className="view-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="info-group">
                  <h3>Account Information</h3>
                  <p>
                    <strong>First Name:</strong> {accountData.firstName}
                  </p>
                  <p>
                    <strong>Last Name:</strong> {accountData.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {accountData.email}
                  </p>
                </div>
                <motion.div
                  className="password-security"
                  onClick={handlePasswordEditClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <MdSecurity className="security-icon" style={{height:50, width:50,padding:5, marginBottom:5}}/> {/* Updated icon */}
                  <div className="security-text">
                    <p>Password and Security</p>
                    <small>Manage your password and security settings</small>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfile;
