import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminUsers.css";

const SuperAdminUsers = () => {
  const [organizations, setOrganizations] = useState([]);
  const [editingOrg, setEditingOrg] = useState(null); // State to track editing org
  const [editFormData, setEditFormData] = useState({}); // State to store edit form data
  const [loading, setLoading] = useState(true); // Loading state for data fetching

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        const response = await axios.get(
          "https://studevent-server.vercel.app/api/users/organizations",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request
            },
          }
        );
        console.log("API Response:", response.data);
        setOrganizations(response.data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };    

    fetchOrganizations();
  }, []);

  const deleteUser = async (userId) => {
    try {
      await axios.delete(
        `https://studevent-server.vercel.app/api/users/${userId}`
      );
      setOrganizations(organizations.filter((user) => user._id !== userId)); // Update the UI by removing the user
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditClick = (organization) => {
    setEditingOrg(organization._id); // Set the currently editing org ID
    setEditFormData({
      email: organization.email,
      organizationType: organization.organizationType || "", // Default to empty string if undefined
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
      await axios.put(
        `https://studevent-server.vercel.app/api/users/${editingOrg}`,
        editFormData
      );
      setOrganizations(
        organizations.map((org) =>
          org._id === editingOrg ? { ...org, ...editFormData } : org
        )
      );
      setEditingOrg(null); // Close the edit form
    } catch (error) {
      console.error("Error updating organization:", error);
    }
  };

  return (
    <div className="table-container">
      <h2>Organizations List</h2>
      {loading ? (
        <p>Loading organizations...</p>
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
                        src={organization.logo} // Use the full blob URL stored in the database
                        alt="Organization Logo"
                        width="50"
                        height="50"
                      />
                    ) : (
                      "No Logo"
                    )}
                  </td>

                  <td>{organization.organizationName}</td>
                  <td>{organization.email}</td>
                  <td>
                    {organization.organizationType !== undefined
                      ? organization.organizationType
                      : "Not Provided"}
                  </td>
                  <td>{organization.status}</td>
                  <td>
                    <button onClick={() => deleteUser(organization._id)}>
                      Delete
                    </button>
                    <button onClick={() => handleEditClick(organization)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Edit form modal or section */}
      {editingOrg && (
        <div className="edit-form-container">
          <h2>Edit Organization</h2>
          <form onSubmit={handleEditSubmit}>
            <input
              type="email"
              name="email"
              value={editFormData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
            <input
              type="text"
              name="organizationType"
              value={editFormData.organizationType}
              onChange={handleInputChange}
              placeholder="Organization Type"
            />
            <select
              name="status"
              value={editFormData.status}
              onChange={handleInputChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditingOrg(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsers;
