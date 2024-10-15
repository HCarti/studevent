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
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
        }
    };

    const validateForm = () => {
        const { firstName, lastName, email, password, confirmPassword } = formData;
        let errors = {};
        let isValid = true;

        if (!firstName) {
            isValid = false;
            errors.firstName = 'First Name is required.';
        }
        if (!lastName) {
            isValid = false;
            errors.lastName = 'Last Name is required.';
        }
        if (!email) {
            isValid = false;
            errors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            isValid = false;
            errors.email = 'Enter a valid email address.';
        }
        if (!password) {
            isValid = false;
            errors.password = 'Password is required.';
        } else if (password.length < 6) {
            isValid = false;
            errors.password = 'Password must be at least 6 characters.';
        }
        if (!confirmPassword) {
            isValid = false;
            errors.confirmPassword = 'Confirm Password is required.';
        } else if (password !== confirmPassword) {
            isValid = false;
            errors.confirmPassword = 'Passwords do not match.';
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setValidationErrors({});

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
        <div className="form-container">
            <h2 className="form-title">Add New User</h2>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-body">
                    <div className="profile-image-section">
                        <div className="profile-image">
                            {logo ? (
                                <img src={URL.createObjectURL(logo)} alt="Logo Preview" />
                            ) : (
                                <span className="placeholder-logo">Upload Logo</span>
                            )}
                        </div>
                        <label className="upload-btn">
                            Upload Image
                            <input type="file" name="logo" accept="image/*" onChange={handleLogoChange} />
                        </label>
                    </div>

                    <div className="form-fields">
                        <div className="form-group">
                            <label htmlFor="role">Role:</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="Authority">Authority</option>
                                <option value="Organization">Organization</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">First Name <span className="important">*</span></label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={validationErrors.firstName ? 'input-error' : ''}
                            />
                            {validationErrors.firstName && <small className="error-text">{validationErrors.firstName}</small>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name <span className="important">*</span></label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={validationErrors.lastName ? 'input-error' : ''}
                            />
                            {validationErrors.lastName && <small className="error-text">{validationErrors.lastName}</small>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email <span className="important">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={validationErrors.email ? 'input-error' : ''}
                            />
                            {validationErrors.email && <small className="error-text">{validationErrors.email}</small>}
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
                            <label htmlFor="password">Password <span className="important">*</span></label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={validationErrors.password ? 'input-error' : ''}
                            />
                            {validationErrors.password && <small className="error-text">{validationErrors.password}</small>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password <span className="important">*</span></label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={validationErrors.confirmPassword ? 'input-error' : ''}
                            />
                            {validationErrors.confirmPassword && <small className="error-text">{validationErrors.confirmPassword}</small>}
                        </div>

                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Adding User...' : 'Add User'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SuperAdminAddUser;
