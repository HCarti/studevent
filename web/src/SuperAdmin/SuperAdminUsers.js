import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminUsers.css";

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

const SuperAdminUsers = () => {
  const [organizations, setOrganizations] = useState([]);
  const [editingOrg, setEditingOrg] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

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
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://studevent-server.vercel.app/api/users/organizations/${editingOrg}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrganizations(
        organizations.map((org) =>
          org._id === editingOrg ? { ...org, ...editFormData } : org
        )
      );
      setEditingOrg(null);
    } catch (error) {
      console.error("Error updating organization:", error);
    }
  };

  return (
    <div className="table-container">
      <h2>Organizations Management</h2>
      
      {loading ? (
        <p className="loading-message">Loading organizations...</p>
      ) : (
        <>
          {/* Desktop Table */}
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Organization</th>
                <th>Email</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((organization) => (
                <tr key={organization._id}>
                  <td>
                    {organization.logo ? (
                      <img
                        src={organization.logo}
                        alt="Organization Logo"
                        className="org-logo"
                      />
                    ) : (
                      <div className="no-logo">No Logo</div>
                    )}
                  </td>
                  <td>{organization.organizationName}</td>
                  <td>{organization.email}</td>
                  <td>
                    {organization.organizationType || "Not Provided"}
                  </td>
                  <td>
                    <span className={`status-badge status-${organization.status.toLowerCase()}`}>
                      {organization.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm delete-btn"
                        onClick={() => handleDeleteClick(organization._id)}
                      >
                        <DeleteIcon /> 
                        <span>Delete</span>
                      </button>
                      <button 
                        className="btn btn-sm edit-btn"
                        onClick={() => handleEditClick(organization)}
                      >
                        <EditIcon /> 
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="mobile-cards-container">
            {organizations.map((organization) => (
              <div key={`mobile-${organization._id}`} className="mobile-card">
                <div className="mobile-card-header">
                  {organization.logo ? (
                    <img 
                      src={organization.logo} 
                      alt="Organization Logo" 
                      className="mobile-card-logo" 
                    />
                  ) : (
                    <div className="mobile-card-no-logo">No Logo</div>
                  )}
                  <div>
                    <div className="mobile-card-title">{organization.organizationName}</div>
                    <div className="mobile-card-email">{organization.email}</div>
                  </div>
                </div>
                
                <div className="mobile-card-details">
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Organization Type</span>
                    <span className="mobile-card-value">
                      {organization.organizationType || "Not Provided"}
                    </span>
                  </div>
                  
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Status</span>
                    <span className={`mobile-card-value status-badge status-${organization.status.toLowerCase()}`}>
                      {organization.status}
                    </span>
                  </div>
                </div>
                
                <div className="mobile-card-actions">
                  <button 
                    className="btn btn-sm delete-btn"
                    onClick={() => handleDeleteClick(organization._id)}
                  >
                    <DeleteIcon /> 
                    <span>Delete</span>
                  </button>
                  <button 
                    className="btn btn-sm edit-btn"
                    onClick={() => handleEditClick(organization)}
                  >
                    <EditIcon /> 
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
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
              <div className="form-actions">
                <button type="button" 
                  className="btn cancel-btn"
                  onClick={() => setEditingOrg(null)}
                >
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
            <p>Are you sure you want to delete this organization permanently?</p>
            <p className="warning-text">This action cannot be undone.</p>
            
            {deleteError && (
              <p className="error-message">{deleteError}</p>
            )}
            
            <div className="modal-actions">
              <button 
                className="btn cancel-delete-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="btn confirm-delete-btn"
                onClick={confirmDelete}
              >
                Delete Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsers;