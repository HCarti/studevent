import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminUsers.css";
import { FaSearch} from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoTrashBinSharp } from "react-icons/io5";

// Icons
const EditIcon = () => (
  <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// Helper to get status badge class
const getStatusBadgeClass = (status) => {
  if (!status) return "status-badge";
  const s = status.toLowerCase();
  if (s === "active") return "status-badge status-active";
  if (s === "inactive") return "status-badge status-inactive";
  if (s === "pending") return "status-badge status-pending";
  if (s === "declined") return "status-badge status-declined";
  return "status-badge";
};

const SuperAdminUsers = () => {
  const [organizations, setOrganizations] = useState([]);
  const [editingOrg, setEditingOrg] = useState(null);
  const [editFormData, setEditFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          "https://studevent-server.vercel.app/api/users/organizations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrganizations(response.data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };    

    fetchOrganizations();
  }, []);

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://studevent-server.vercel.app/api/users/${userToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrganizations(organizations.filter((user) => user._id !== userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeleteError("Failed to delete user. Please try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  const handleEditClick = (organization) => {
    setEditingOrg(organization._id);
    setEditFormData({
      email: organization.email,
      organizationType: organization.organizationType || "",
      status: organization.status,
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

    // Clear password error when user types
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords if either field is filled
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
      
      // Remove password fields if they're empty (no change desired)
      if (!dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.confirmPassword;
      } else {
        // If password is provided, remove confirmPassword as we don't need to send it to the server
        delete dataToSend.confirmPassword;
      }

      await axios.put(
        `https://studevent-server.vercel.app/api/users/organizations/${editingOrg}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrganizations(
        organizations.map((org) =>
          org._id === editingOrg ? { ...org, ...dataToSend } : org
        )
      );
      setEditingOrg(null);
    } catch (error) {
      console.error("Error updating organization:", error);
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    return (
      org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organizationType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="table-container">
      <h1 className="dashboard-title">ORGANIZATION MANAGEMENT</h1>
      <p className="dashboard-subtitle">Track and manage all your organizations</p>
      <div className="dashboard-controls">
  <div className="search-bar-container">
    <FaSearch className="search-icon" />
    <input
      type="text"
      className="search-bar"
      placeholder="Search organizations..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
</div>
      <div className="results-count">
        <span>{filteredOrganizations.length}</span> organizations found
      </div>
      {loading ? (
        <p className="loading-message">Loading organizations...</p>
      ) : (
        <div className="card-grid-container">
          {filteredOrganizations.map((organization) => (
            <div key={organization._id} className="org-card">
              <div className="org-card-header">
                {organization.logo ? (
                  <img
                    src={organization.logo}
                    alt="Organization Logo"
                    className="org-card-logo"
                  />
                ) : (
                  <div className="org-card-no-logo">No Logo</div>
                )}
                <div>
                  <div className="org-card-title">{organization.organizationName}</div>
                  <div className="org-card-email">{organization.email}</div>
                </div>
              </div>
              <div className="org-card-details">
                <div className="org-card-row">
                  <span className="org-card-label">Type</span>
                  <span className="org-card-value">{organization.organizationType || "Not Provided"}</span>
                </div>
                <div className="org-card-row">
                  <span className="org-card-label">Status</span>
                  <span className={getStatusBadgeClass(organization.status)}>{organization.status}</span>
                </div>
              </div>
              <div className="org-card-actions">
                <button className="btn btn-sm delete-btn" onClick={() => handleDeleteClick(organization._id)}>
                  <DeleteIcon /> <span>Delete</span>
                </button>
                <button className="btn btn-sm edit-btn" onClick={() => handleEditClick(organization)}>
                  <EditIcon /> <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit Form Modal */}
      {editingOrg && (
        <div className="modal-overlay">
          <div className="edit-form-container">
            <h2>Edit Organization</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Organization Type</label>
                <input
                  type="text"
                  name="organizationType"
                  value={editFormData.organizationType}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
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
              
              {/* Password Fields */}
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={editFormData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                />
                {passwordError && (
                  <p className="error-message" style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
                    {passwordError}
                  </p>
                )}
                <p className="password-note" style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                  Note: Leave password fields blank if you don't want to change the password.
                </p>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn cancel-btn" onClick={() => setEditingOrg(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn update-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
          <div className="modal-overlay">
            <div className="delete-confirmation-modal">
              <h3>Confirm Deletion</h3>
              <p>This organization will be moved to trash and automatically deleted after 30 days.</p>
              <p>You can restore it from the trash bin during this period.</p>
              {deleteError && <p className="error-message">{deleteError}</p>}
              <div className="modal-actions">
                <button className="btn cancel-delete-btn" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="btn confirm-delete-btn" onClick={confirmDelete}>
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default SuperAdminUsers;