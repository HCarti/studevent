import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminUsers.css";
import { FaSearch, FaTrashRestore } from "react-icons/fa";

const TrashBinIcon = () => (
  <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const RestoreIcon = () => (
  <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const getStatusBadgeClass = (status) => {
  if (!status) return "status-badge";
  const s = status.toLowerCase();
  if (s === "active") return "status-badge status-active";
  if (s === "inactive") return "status-badge status-inactive";
  if (s === "pending") return "status-badge status-pending";
  if (s === "declined") return "status-badge status-declined";
  return "status-badge";
};

const TrashBin = () => {
  const [deletedOrganizations, setDeletedOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [restoreError, setRestoreError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDeletedOrganizations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          "https://studevent-server.vercel.app/api/users/organizations/deleted",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDeletedOrganizations(response.data);
      } catch (error) {
        console.error("Error fetching deleted organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedOrganizations();
  }, []);

  const handlePermanentDeleteClick = (orgId) => {
    setOrgToDelete(orgId);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const confirmPermanentDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://studevent-server.vercel.app/api/users/permanent/${orgToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDeletedOrganizations(deletedOrganizations.filter(org => org._id !== orgToDelete));
      setShowDeleteModal(false);
      setOrgToDelete(null);
    } catch (error) {
      console.error("Error permanently deleting organization:", error);
      setDeleteError("Failed to permanently delete organization. Please try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOrgToDelete(null);
    setDeleteError(null);
  };

  const handleRestoreClick = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://studevent-server.vercel.app/api/users/restore/${orgId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDeletedOrganizations(deletedOrganizations.filter(org => org._id !== orgId));
      setRestoreError(null);
    } catch (error) {
      console.error("Error restoring organization:", error);
      setRestoreError("Failed to restore organization. Please try again.");
    }
  };

  const filteredOrganizations = deletedOrganizations.filter((org) => {
    return (
      org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organizationType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDeletedDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="table-container">
      <h1 className="dashboard-title">TRASH BIN</h1>
      <p className="dashboard-subtitle">Organizations will be automatically deleted after 30 days</p>
      
      <div className="dashboard-controls">
        <div className="search-bar-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-bar"
            placeholder="Search deleted organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="results-count">
        <span>{filteredOrganizations.length}</span> deleted organizations found
      </div>
      
      {restoreError && (
        <div className="alert alert-error">
          {restoreError}
        </div>
      )}
      
      {loading ? (
        <p className="loading-message">Loading deleted organizations...</p>
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
                <div className="org-card-row">
                  <span className="org-card-label">Deleted On</span>
                  <span className="org-card-value">{formatDeletedDate(organization.deletedAt)}</span>
                </div>
              </div>
              
              <div className="org-card-actions">
                <button 
                  className="btn btn-sm delete-btn" 
                  onClick={() => handlePermanentDeleteClick(organization._id)}
                >
                  <TrashBinIcon /> <span>Delete Permanently</span>
                </button>
                <button 
                  className="btn btn-sm restore-btn" 
                  onClick={() => handleRestoreClick(organization._id)}
                >
                  <RestoreIcon /> <span>Restore</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Permanent Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <h3>Confirm Permanent Deletion</h3>
            <p>Are you sure you want to permanently delete this organization?</p>
            <p className="warning-text">This action cannot be undone and all data will be lost.</p>
            {deleteError && <p className="error-message">{deleteError}</p>}
            <div className="modal-actions">
              <button className="btn cancel-delete-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn confirm-delete-btn" onClick={confirmPermanentDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashBin;