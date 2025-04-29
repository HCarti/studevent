import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminUsers.css";

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
      <h2>Organizations List</h2>
      {loading ? (
        <p className="loading-message">Loading organizations...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Organization</th>
                <th>Email</th>
                <th>Organization Type</th>
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
                  <td>{organization.emailAddress}</td>
                  <td>
                    {organization.organizationType || "Not Provided"}
                  </td>
                  <td className={`status-${organization.status.toLowerCase()}`}>
                    {organization.status}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteClick(organization._id)}
                      >
                        Delete
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditClick(organization)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <button type="submit" className="update-btn">
                  Update
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setEditingOrg(null)}
                >
                  Cancel
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
                className="confirm-delete-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button 
                className="cancel-delete-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsers;