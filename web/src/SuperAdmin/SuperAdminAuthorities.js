import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SuperAdminAuthorities.css';

const SuperAdminAuthorities = () => {
    const [authorities, setAuthorities] = useState([]);
    const [editingAuth, setEditingAuth] = useState(null); // State to track editing authority
    const [editFormData, setEditFormData] = useState({}); // State to store edit form data

    useEffect(() => {
        const fetchAuthorities = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/users');
                const filteredAuthorities = response.data.filter(user => user.role === 'Authority');
                setAuthorities(filteredAuthorities);
            } catch (error) {
                console.error('Error fetching authorities:', error);
            }
        };

        fetchAuthorities();
    }, []);

    const deleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:8000/api/users/${userId}`);
            setAuthorities(authorities.filter((user) => user._id !== userId)); // Update the UI by removing the user
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEditClick = (authority) => {
        setEditingAuth(authority._id); // Set the currently editing authority ID
        setEditFormData({
            firstName: authority.firstName,
            lastName: authority.lastName,
            email: authority.email,
            faculty: authority.faculty,
            status: authority.status,
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
            await axios.put(`http://localhost:8000/api/users/${editingAuth}`, editFormData);
            setAuthorities(authorities.map((auth) =>
                auth._id === editingAuth ? { ...auth, ...editFormData } : auth
            ));
            setEditingAuth(null); // Close the edit form
        } catch (error) {
            console.error('Error updating authority:', error);
        }
    };

    return (
        <div className="table-container">
            <h2>Authorities List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Picture</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Faculty</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {authorities.map((authority) => (
                        <tr key={authority._id}>
                            <td>
                                {authority.logo ? (
                                    <img
                                        src={`http://localhost:8000/uploads/${authority.logo}`}
                                        alt="Authority Logo"
                                        width="50"
                                        height="50"
                                    />
                                ) : (
                                    'No Logo'
                                )}
                            </td>
                            <td>{authority.firstName} {authority.lastName}</td>
                            <td>{authority.email}</td>
                            <td>{authority.faculty}</td>
                            <td>{authority.status}</td>
                            <td>
                                <button onClick={() => deleteUser(authority._id)}>Delete</button>
                                <button onClick={() => handleEditClick(authority)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit form modal or section */}
            {editingAuth && (
                <div className="edit-form-container">
                    <h2>Edit Authority</h2>
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
                        <button type="button" onClick={() => setEditingAuth(null)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SuperAdminAuthorities;
