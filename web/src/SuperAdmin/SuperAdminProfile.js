import React, { useEffect, useState, useCallback } from 'react';
import './SuperAdminProfile.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PuffLoader } from 'react-spinners';
import { css } from '@emotion/react';
import { FiEdit, FiLock } from 'react-icons/fi';

const SuperAdminProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
      setEditedUser({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || ''
      });
    } catch (error) {
      if (error.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
  };

  const handleChangePasswordClick = () => {
    setIsChangingPassword(true);
    setIsEditing(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordChange = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'https://studevent-server.vercel.app/api/users/update',
        editedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(prev => ({
        ...prev,
        ...editedUser
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!validatePasswordChange()) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'https://studevent-server.vercel.app/api/users/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to change password. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setEditedUser({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || ''
    });
    setErrors({});
  };

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
    <div className="sap-container">
      <div className="sap-profile-container">
        <div className="sap-profile-left">
          <div
            className="sap-profile-pic"
            style={{
              backgroundImage: `url(${user?.logo || user?.image || '/default-profile.png'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <h2>{`${user?.firstName} ${user?.lastName}`}</h2>
          <p>{`Joined ${user?.joinedDate || "June 6, 2023"}`}</p>
          <div className="sap-profile-actions">
            <button className="sap-action-button" onClick={handleEditClick}>
              <FiEdit className="action-icon" /> Edit Profile
            </button>
            <button className="sap-action-button" onClick={handleChangePasswordClick}>
              <FiLock className="action-icon" /> Change Password
            </button>
          </div>
        </div>
        <div className="sap-profile-right">
          <h2>Account Information</h2>
          <form>
            <label>First Name:</label>
            <input 
              className="sap-proflie-input" 
              type="text" 
              value={user?.firstName || "Admin"} 
              readOnly 
            />
            <label>Last Name:</label>
            <input 
              className="sap-proflie-input" 
              type="text" 
              value={user?.lastName || "Unknown"} 
              readOnly 
            />
            <label>Email:</label>
            <input 
              className="sap-proflie-input" 
              type="email" 
              value={user?.email || "unknown@email.com"} 
              readOnly 
            />
          </form>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="sap-modal-overlay">
          <div className="sap-modal">
            <h2>Edit Profile</h2>
            <div className="sap-modal-content">
              <div className="sap-form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={editedUser.firstName}
                  onChange={handleInputChange}
                  className="sap-modal-input"
                />
              </div>
              <div className="sap-form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={editedUser.lastName}
                  onChange={handleInputChange}
                  className="sap-modal-input"
                />
              </div>
              <div className="sap-form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  className="sap-modal-input"
                />
              </div>
            </div>
            <div className="sap-modal-actions">
              <button 
                className="sap-modal-cancel" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="sap-modal-save" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="sap-modal-overlay">
          <div className="sap-modal">
            <h2>Change Password</h2>
            <div className="sap-modal-content">
              <div className="sap-form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="sap-modal-input"
                />
                {errors.currentPassword && <span className="sap-error">{errors.currentPassword}</span>}
              </div>
              <div className="sap-form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="sap-modal-input"
                />
                {errors.newPassword && <span className="sap-error">{errors.newPassword}</span>}
              </div>
              <div className="sap-form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="sap-modal-input"
                />
                {errors.confirmPassword && <span className="sap-error">{errors.confirmPassword}</span>}
              </div>
            </div>
            <div className="sap-modal-actions">
              <button 
                className="sap-modal-cancel" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="sap-modal-save" 
                onClick={handleSavePassword}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminProfile;