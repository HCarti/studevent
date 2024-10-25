import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminTab.css';

const AdminTab = () => {
    const [admins, setAdmins] = useState([]);
    const [editingAdmin, setEditingAdmin] = useState(null); // State to track editing admin
    const [editFormData, setEditFormData] = useState({}); // State to store edit form data

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get('https://studevent-server.vercel.app/api/users');
                const filteredAdmins = response.data.filter(user => user.role === 'Admin');
                setAdmins(filteredAdmins);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };

        fetchAdmins();
    }, []);

    const deleteUser = async (userId) => {
        try {
            await axios.delete(`https://studevent-server.vercel.app/api/users/${userId}`);
            setAdmins(admins.filter((user) => user._id !== userId)); // Update the UI by removing the user
        } catch (error) {
            console.error('Error deleting admin:', error);
        }
    };

    const handleEditClick = (admin) => {
        setEditingAdmin(admin._id); // Set the currently editing admin ID
        setEditFormData({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            faculty: admin.faculty,
            status: admin.status,
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
            await axios.put(`https://studevent-server.vercel.app/api/users/${editingAdmin}`, editFormData);
            setAdmins(admins.map((admin) =>
                admin._id === editingAdmin ? { ...admin, ...editFormData } : admin
            ));
            setEditingAdmin(null); // Close the edit form
        } catch (error) {
            console.error('Error updating admin:', error);
        }
    };

    return (
        <div className="table-container">
            <h2>Admin List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Picture</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map((admin) => (
                        <tr key={admin._id}>
                            <td>
                                {admin.logo ? (
                                    <img
                                        src={`https://studevent-server.vercel.app/uploads/${admin.logo}`}
                                        alt="Admin Logo"
                                        width="50"
                                        height="50"
                                    />
                                ) : (
                                    'No Logo'
                                )}
                            </td>
                            <td>{admin.firstName} {admin.lastName}</td>
                            <td>{admin.email}</td>
                            <td>{admin.status}</td>
                            <td>
                                <button onClick={() => deleteUser(admin._id)}>Delete</button>
                                <button onClick={() => handleEditClick(admin)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit form modal or section */}
            {editingAdmin && (
                <div className="edit-form-container">
                    <h2>Edit Admin</h2>
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
                            name="faculty"
                            value={editFormData.faculty}
                            onChange={handleInputChange}
                            placeholder="Faculty"
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
                        <button type="button" onClick={() => setEditingAdmin(null)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminTab;
