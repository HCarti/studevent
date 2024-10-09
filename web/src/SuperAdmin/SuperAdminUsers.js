import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SuperAdminUsers.css';

const SuperAdminUsers = () => {
    const [organizations, setOrganizations] = useState([]);
    const [editingOrg, setEditingOrg] = useState(null); // State to track editing org
    const [editFormData, setEditFormData] = useState({}); // State to store edit form data

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/users');
                const filteredOrganizations = response.data.filter(user => user.role === 'Organization');
                setOrganizations(filteredOrganizations);
            } catch (error) {
                console.error('Error fetching organizations:', error);
            }
        };

        fetchOrganizations();
    }, []);

    const deleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:8000/api/users/${userId}`);
            setOrganizations(organizations.filter((user) => user._id !== userId)); // Update the UI by removing the user
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEditClick = (organization) => {
        setEditingOrg(organization._id); // Set the currently editing org ID
        setEditFormData({
            firstName: organization.firstName,
            lastName: organization.lastName,
            email: organization.email,
            organizationType: organization.organizationType,
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
            await axios.put(`http://localhost:8000/api/users/${editingOrg}`, editFormData);
            setOrganizations(organizations.map((org) =>
                org._id === editingOrg ? { ...org, ...editFormData } : org
            ));
            setEditingOrg(null); // Close the edit form
        } catch (error) {
            console.error('Error updating organization:', error);
        }
    };

    return (
        <div className="table-container">
            <h2>Organizations List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Logo</th>
                        <th>Name</th>
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
                                        src={`http://localhost:8000/uploads/${organization.logo}`}
                                        alt="Organization Logo"
                                        width="50"
                                        height="50"
                                    />
                                ) : (
                                    'No Logo'
                                )}
                            </td>
                            <td>{organization.firstName} {organization.lastName}</td>
                            <td>{organization.email}</td>
                            <td>{organization.organizationType}</td>
                            <td>{organization.status}</td>
                            <td>
                                <button onClick={() => deleteUser(organization._id)}>Delete</button>
                                <button onClick={() => handleEditClick(organization)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit form modal or section */}
            {editingOrg && (
                <div className="edit-form-container">
                    <h2>Edit Organization</h2>
                    <form onSubmit={handleEditSubmit}>
                        <input
                            type="text"
                            name="firstName"
                            value={editFormData.firstName}
                            onChange={handleInputChange}
                            placeholder="First Name"
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            value={editFormData.lastName}
                            onChange={handleInputChange}
                            placeholder="Last Name"
                            required
                        />
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
                        <button type="button" onClick={() => setEditingOrg(null)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SuperAdminUsers;
