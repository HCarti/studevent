import React, { useEffect, useState, useCallback } from 'react';
import './SuperAdminProfile.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PuffLoader } from 'react-spinners';
import { css } from '@emotion/react';
import { FiEdit, FiLock, FiUpload, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

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
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Custom CSS for the loader
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: #0046ad;
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
      setImagePreview(response.data.logo || response.data.image || '/default-profile.png');
    } catch (error) {
      if (error.response?.status === 401) navigate('/');
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
    
    // Create FormData and ensure all fields have values
    const formData = new FormData();
    formData.append('firstName', editedUser.firstName || '');
    formData.append('lastName', editedUser.lastName || '');
    formData.append('email', editedUser.email || '');
    
    if (profileImage) {
      formData.append('image', profileImage);
    }

    // Debug output
    console.log('Sending:', {
      firstName: editedUser.firstName,
      lastName: editedUser.lastName,
      email: editedUser.email,
      hasImage: !!profileImage
    });

    const response = await axios.put(
      'https://studevent-server.vercel.app/api/users/update/profile',
      formData,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      }
    );
    
    console.log('Response:', response.data);

    setUser(prev => ({
      ...prev,
      ...editedUser,
      ...(imagePreview && { image: imagePreview })
    }));
    
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Failed to update profile. Please try again.');
    }
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
      
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to change password. Please try again.');
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
    setImagePreview(user?.logo || user?.image || '/default-profile.png');
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
          <div className="sap-profile-pic-container">
            <div
              className="sap-profile-pic"
              style={{
                backgroundImage: `url(${imagePreview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            {isEditing && (
              <label className="sap-upload-button">
                <FiUpload className="upload-icon" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sap-file-input"
                />
              </label>
            )}
          </div>
          <h2>{`${user?.firstName} ${user?.lastName}`}</h2>
          <p className="sap-join-date">{`Joined ${user?.joinedDate || "June 6, 2023"}`}</p>
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
            <div className="sap-form-group">
              <label>First Name:</label>
              <input 
                className="sap-proflie-input" 
                type="text" 
                value={user?.firstName || "Admin"} 
                readOnly 
              />
            </div>
            <div className="sap-form-group">
              <label>Last Name:</label>
              <input 
                className="sap-proflie-input" 
                type="text" 
                value={user?.lastName || "Unknown"} 
                readOnly 
              />
            </div>
            <div className="sap-form-group">
              <label>Email:</label>
              <input 
                className="sap-proflie-input" 
                type="email" 
                value={user?.email || "unknown@email.com"} 
                readOnly 
              />
            </div>
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
                <FiX className="action-icon" /> Cancel
              </button>
              <button 
                className="sap-modal-save" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <PuffLoader color="#fff" size={20} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="action-icon" />
                    <span>Save Changes</span>
                  </>
                )}
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
                <FiX className="action-icon" /> Cancel
              </button>
              <button 
                className="sap-modal-save" 
                onClick={handleSavePassword}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <PuffLoader color="#fff" size={20} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="action-icon" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminProfile;