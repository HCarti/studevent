import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminAdmins.css"; // Reusing the same CSS but with modified classnames
import { FaSearch } from "react-icons/fa";
import { IoTrashBinSharp } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

// Icons
const EditIcon = () => (
  <svg className="saa-btn-icon" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="saa-btn-icon" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// Helper to get status badge class
const getStatusBadgeClass = (status) => {
  if (!status) return "saa-status-badge";
  const s = status.toLowerCase();
  if (s === "active") return "saa-status-badge saa-status-active";
  if (s === "inactive") return "saa-status-badge saa-status-inactive";
  if (s === "pending") return "saa-status-badge saa-status-pending";
  if (s === "declined") return "saa-status-badge saa-status-declined";
  return "saa-status-badge";
};

const SuperAdminAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

useEffect(() => {
  const fetchAdmins = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      "https://studevent-server.vercel.app/api/users/authorities",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status === 200) {
      const adminsData = response.data.data || response.data;
      setAdmins(adminsData);
    } else {
      console.error("Unexpected response:", response);
    }
  } catch (error) {
    console.error("Error fetching admins:", error);
    showNotification('Failed to fetch admins', 'error');
  } finally {
    setLoading(false);
  }
}; 

  fetchAdmins();
}, []);

  const handleDeleteClick = (userId) => {
    setAdminToDelete(userId);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    try {
      setDeleteError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `https://studevent-server.vercel.app/api/users/${adminToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.success) {
        setAdmins(admins.filter((user) => user._id !== adminToDelete));
        setShowDeleteModal(false);
        setAdminToDelete(null);
        showNotification('Admin account moved to trash successfully');
      } else {
        const errorMsg = response.data?.message || 'Unknown error occurred';
        setDeleteError(errorMsg);
      }
    } catch (error) {
      let errorMsg = "Failed to delete admin. Please try again.";
      if (error.response) {
        errorMsg = error.response.data.message || 
                  error.response.data.error || 
                  errorMsg;
      } else if (error.request) {
        errorMsg = "No response from server. Please check your connection.";
      }
      
      setDeleteError(errorMsg);
      showNotification(errorMsg, 'error');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
    setDeleteError(null);
  };

  const handleEditClick = (admin) => {
    setEditingAdmin(admin._id);
    setEditFormData({
      email: admin.email,
      role: admin.role,
      status: admin.status,
      password: "",
      confirmPassword: ""
    });
    setPasswordError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (editFormData.password || editFormData.confirmPassword) {
      if (editFormData.password !== editFormData.confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
      if (editFormData.password.length < 6) {
        setPasswordError("Password must be at least 6 characters");
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSend = { ...editFormData };
      
      if (!dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.confirmPassword;
      } else {
        delete dataToSend.confirmPassword;
      }

      await axios.put(
        `https://studevent-server.vercel.app/api/users/authorities/${editingAdmin}`,
        dataToSend,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );
      setAdmins(
        admins.map((admin) =>
          admin._id === editingAdmin ? { ...admin, ...dataToSend } : admin
        )
      );
      setEditingAdmin(null);
      showNotification('Admin account updated successfully');
    } catch (error) {
      console.error("Error updating admin:", error);
      showNotification('Failed to update admin account', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(prev => ({...prev, show: false}));
    }, 5000);
  };

  const closeNotification = () => {
    setNotification(prev => ({...prev, show: false}));
  };

  const filteredAdmins = admins.filter((admin) => {
    return (
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

   return (
    <div className="saa-container">
      {notification.show && (
        <div className={`saa-notification ${notification.type}`}>
          <div className="saa-notification-content">
            {notification.message}
            <button className="saa-notification-close" onClick={closeNotification}>
              <IoClose />
            </button>
          </div>
        </div>
      )}
      <h1 className="saa-title">ADMIN & AUTHORITIES MANAGEMENT</h1>
      <p className="saa-subtitle">Manage all admin and authority accounts</p>
      <div className="saa-controls">
        <div className="saa-search-container">
          <FaSearch className="saa-search-icon" />
          <input
            type="text"
            className="saa-search-bar"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="saa-results-count">
        <span>{filteredAdmins.length}</span> accounts found
      </div>
      {loading ? (
        <p className="saa-loading-message">Loading admins...</p>
      ) : (
        <div className="saa-card-grid">
          {filteredAdmins.map((admin) => (
            <div key={admin._id} className="saa-card">
              <div className="saa-card-header">
                {admin.avatar ? (
                  <img
                    src={admin.avatar}
                    alt="Admin Avatar"
                    className="saa-card-logo"
                  />
                ) : (
                  <div className="saa-card-no-logo">No Avatar</div>
                )}
                <div>
                  <div className="saa-card-title">{admin.name || "No Name"}</div>
                  <div className="saa-card-email">{admin.email}</div>
                </div>
              </div>
              <div className="saa-card-details">
                <div className="saa-card-row">
                  <span className="saa-card-label">Role</span>
                  <span className="saa-card-value">{admin.role}</span>
                </div>
                <div className="saa-card-row">
                  <span className="saa-card-label">Status</span>
                  <span className={getStatusBadgeClass(admin.status)}>{admin.status}</span>
                </div>
              </div>
              <div className="saa-card-actions">
                <button className="saa-btn saa-btn-sm saa-delete-btn" onClick={() => handleDeleteClick(admin._id)}>
                  <DeleteIcon /> <span>Delete</span>
                </button>
                <button className="saa-btn saa-btn-sm saa-edit-btn" onClick={() => handleEditClick(admin)}>
                  <EditIcon /> <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit Form Modal */}
      {editingAdmin && (
        <div className="saa-modal-overlay">
          <div className="saa-edit-form">
            <h2>Edit Admin Account</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="saa-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="saa-form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Authority">Authority</option>
                </select>
              </div>
              <div className="saa-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="saa-form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="saa-form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={editFormData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                />
                {passwordError && (
                  <p className="saa-error-message">
                    {passwordError}
                  </p>
                )}
                <p className="saa-password-note">
                  Note: Leave password fields blank if you don't want to change the password.
                </p>
              </div>
              
              <div className="saa-form-actions">
                <button type="button" className="saa-btn saa-cancel-btn" onClick={() => setEditingAdmin(null)}>
                  Cancel
                </button>
                <button type="submit" className="saa-btn saa-update-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="saa-modal-overlay">
          <div className="saa-delete-modal">
            <h3>Confirm Deletion</h3>
            <p>This admin account will be moved to trash and automatically deleted after 30 days.</p>
            <p>You can restore it from the trash bin during this period.</p>
            {deleteError && <p className="saa-error-message">{deleteError}</p>}
            <div className="saa-modal-actions">
              <button className="saa-btn saa-cancel-delete-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="saa-btn saa-confirm-delete-btn" onClick={confirmDelete}>
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAdmins;