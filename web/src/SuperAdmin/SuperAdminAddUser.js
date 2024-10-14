import React, { useState } from 'react';
import axios from 'axios';
import './SuperAdminAddUser.css';

const SuperAdminAddUser = () => {
    const [formData, setFormData] = useState({
        role: 'Authority',
        firstName: '',
        lastName: '',
        email: '',
        faculty: '',
        organizationType: '',
        password: '',
        confirmPassword: '',
    });

    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogoChange = (e) => {
        setLogo(e.target.files[0]);
    };

    const validateForm = () => {
        const { firstName, lastName, email, password, confirmPassword } = formData;
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError('All fields are required.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        if (!logo) {
            setError('Logo or photo is required.');
            return;
        }

        const data = new FormData();
        data.append('role', formData.role);
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('email', formData.email);
        data.append('faculty', formData.faculty);
        data.append('organizationType', formData.organizationType);
        data.append('password', formData.password);
        data.append('logo', logo);

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8000/api/users', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('User added successfully!');
            setFormData({
                role: 'Authority',
                firstName: '',
                lastName: '',
                email: '',
                faculty: '',
                organizationType: '',
                password: '',
                confirmPassword: '',
            });
            setLogo(null);
        } catch (error) {
            setError(error.response?.data?.message || 'Error adding user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-user-form">
            <h2>Add User</h2>

            {/* Display errors or success messages */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="Authority">Authority</option>
                        <option value="Organization">Organization</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                {formData.role === 'Authority' && (
                    <div className="form-group">
                        <label htmlFor="faculty">Faculty:</label>
                        <input
                            type="text"
                            name="faculty"
                            value={formData.faculty}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formData.role === 'Organization' && (
                    <div className="form-group">
                        <label htmlFor="organizationType">Organization Type:</label>
                        <input
                            type="text"
                            name="organizationType"
                            value={formData.organizationType}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="logo">Logo or Photo:</label>
                    <input type="file" name="logo" onChange={handleLogoChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Adding User...' : 'Add User'}
                </button>
            </form>
        </div>
    );
};

export default SuperAdminAddUser;
