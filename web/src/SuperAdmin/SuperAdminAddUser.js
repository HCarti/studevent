import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SuperAdminAddUser.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SuperAdminAddUser = () => {
    const [formData, setFormData] = useState({
        role: 'Admin',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        faculty: '',
        organization: '',
        organizationType: '',
        organizationName: '',
        presidentName: '',
        deanForOrganization: ''
    });

    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [signature, setSignature] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [presidentSignature, setPresidentSignature] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [academicOrganizations, setAcademicOrganizations] = useState([]);
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false
      });

    const faculties = ['Adviser', 'Dean', 'Academic Services', 'Academic Director', 'Executive Director'];
    const typeorganizations = [
        'Recognized Student Organization - Special Interest',
        'Recognized Student Organization - Academic',
        'College Student Council',
        'Student Government',
        'Independent Constitutional Commissions',
    ];

    const toggleShowPassword = (field) => {
        setShowPassword(prev => ({
          ...prev,
          [field]: !prev[field]
        }));
      };
      

    // Fetch organizations when component mounts
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://studevent-server.vercel.app/api/users/organizations', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setOrganizations(response.data);
            } catch (error) {
                console.error('Error fetching organizations:', error);
            }
        };

        fetchOrganizations();
    }, []);

    // Fetch academic organizations when component mounts
    useEffect(() => {
        const fetchAcademicOrganizations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://studevent-server.vercel.app/api/users/organizations/academic', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setAcademicOrganizations(response.data);
            } catch (error) {
                console.error('Error fetching academic organizations:', error);
            }
        };

        fetchAcademicOrganizations();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ''
            });
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setValidationErrors({
                    ...validationErrors,
                    logo: 'Logo file size should be less than 2MB'
                });
                return;
            }
            setLogo(file);
            setValidationErrors({
                ...validationErrors,
                logo: ''
            });
        }
    };

    const handleSignatureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                setValidationErrors({
                    ...validationErrors,
                    [e.target.name]: 'Signature file size should be less than 1MB'
                });
                return;
            }
            if (file.type === 'image/png' || file.type === 'image/jpeg') {
                if (e.target.name === 'presidentSignature') {
                    setPresidentSignature(file);
                } else {
                    setSignature(file);
                }
                setValidationErrors({
                    ...validationErrors,
                    [e.target.name]: ''
                });
            } else {
                setValidationErrors({
                    ...validationErrors,
                    [e.target.name]: 'Please upload a valid PNG or JPEG file for the signature.'
                });
                if (e.target.name === 'presidentSignature') {
                    setPresidentSignature(null);
                } else {
                    setSignature(null);
                }
            }
        }
    };

    const validateForm = () => {
        const { role, firstName, lastName, email, password, confirmPassword, faculty, organization, organizationType, organizationName, presidentName, deanForOrganization } = formData;
        let errors = {};
        let isValid = true;

        // Role-specific validations
        if (role === 'Admin' || role === 'Authority' || role === 'SuperAdmin') {
            if (!firstName.trim()) {
                isValid = false;
                errors.firstName = 'First Name is required';
            } else if (firstName.length < 2) {
                isValid = false;
                errors.firstName = 'First Name must be at least 2 characters';
            }

            if (!lastName.trim()) {
                isValid = false;
                errors.lastName = 'Last Name is required';
            } else if (lastName.length < 2) {
                isValid = false;
                errors.lastName = 'Last Name must be at least 2 characters';
            }
        }

        if (role === 'Organization') {
            if (!organizationType) {
                isValid = false;
                errors.organizationType = 'Please select an Organization Type';
            }
            if (!organizationName.trim()) {
                isValid = false;
                errors.organizationName = 'Organization Name is required';
            } else if (organizationName.length < 3) {
                isValid = false;
                errors.organizationName = 'Organization Name must be at least 3 characters';
            }
            if (!presidentName.trim()) {
                isValid = false;
                errors.presidentName = 'President Name is required';
            } else if (presidentName.length < 2) {
                isValid = false;
                errors.presidentName = 'President Name must be at least 2 characters';
            }
            if (!presidentSignature) {
                isValid = false;
                errors.presidentSignature = 'President signature is required';
            }
        } else if (role === 'Admin' || role === 'Authority') {
            if (!signature) {
                isValid = false;
                errors.signature = 'Signature is required';
            }
        }

        if (role === 'Authority') {
            if (!faculty) {
                isValid = false;
                errors.faculty = 'Please select a Faculty role';
            }
            if (faculty === 'Dean' && !deanForOrganization) {
                isValid = false;
                errors.deanForOrganization = 'Please select an Academic Organization for Dean';
            }
            if (faculty === 'Adviser' && !organization) {
                isValid = false;
                errors.organization = 'Please select an Organization for Adviser';
            }
        }

        // Email validation
        if (!email.trim()) {
            isValid = false;
            errors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            isValid = false;
            errors.email = 'Please enter a valid email address (e.g., user@example.com)';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            isValid = false;
            errors.email = 'Email domain is incomplete (e.g., should end with .com, .org, etc.)';
        }

        // Password validation
        if (!password) {
            isValid = false;
            errors.password = 'Password is required';
        } else if (password.length < 8) {
            isValid = false;
            errors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(password)) {
            isValid = false;
            errors.password = 'Password must contain at least one uppercase letter (A-Z)';
        } else if (!/[a-z]/.test(password)) {
            isValid = false;
            errors.password = 'Password must contain at least one lowercase letter (a-z)';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            isValid = false;
            errors.password = 'Password must contain at least one special character (!@#$%^&*)';
        }

        if (!confirmPassword) {
            isValid = false;
            errors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            isValid = false;
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!logo) {
            isValid = false;
            errors.logo = 'Organization logo is required';
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setValidationErrors({});

        if (!validateForm()) {
            // Scroll to the first error if validation fails
            const firstErrorField = Object.keys(validationErrors)[0];
            if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token missing. Please login again.');
                return;
            }

            const data = new FormData();
            // Add common fields
            data.append('role', formData.role);
            data.append('email', formData.email);
            data.append('password', formData.password);
            if (logo) data.append('logo', logo);

            // Role-specific fields
            if (['Admin', 'Authority', 'SuperAdmin'].includes(formData.role)) {
                data.append('firstName', formData.firstName);
                data.append('lastName', formData.lastName);
            }

            if (formData.role === 'Authority') {
                data.append('faculty', formData.faculty);

                if (formData.faculty === 'Adviser') {
                    data.append('organization', formData.organization);
                }

                if (formData.faculty === 'Dean') {
                    data.append('deanForOrganization', formData.deanForOrganization);
                }

                if (signature) data.append('signature', signature);
            }

            if (formData.role === 'Organization') {
                data.append('organizationType', formData.organizationType);
                data.append('organizationName', formData.organizationName);
                data.append('presidentName', formData.presidentName);
                if (presidentSignature) data.append('presidentSignature', presidentSignature);
            }

            const endpoint = formData.role === 'SuperAdmin'
                ? 'https://studevent-server.vercel.app/api/users/superadmin'
                : 'https://studevent-server.vercel.app/api/users';

            const response = await axios.post(endpoint, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            setSuccess('User added successfully!');
            // Reset form
            setFormData({
                role: 'Admin',
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                faculty: '',
                organization: '',
                organizationType: '',
                organizationName: '',
                presidentName: '',
                deanForOrganization: ''
            });
            setLogo(null);
            setSignature(null);
            setPresidentSignature(null);
        } catch (error) {
            console.error('Submission error:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    localStorage.removeItem('token');
                    setError('Your session has expired. Please login again.');
                } else {
                    setError(error.response.data.message || 'Error adding user. Please try again.');
                }
            } else {
                setError('Network error. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="saau-container">
            <h2 className="saau-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Add New User
            </h2>

            {error && (
                <div className="saau-alert saau-alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}
            {success && (
                <div className="saau-alert saau-alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="saau-form">
                <div className="saau-form-section">
                    <div className="saau-image-upload">
                        <div className="saau-image-preview">
                            {logo ? (
                                <img src={URL.createObjectURL(logo)} alt="Logo Preview" />
                            ) : (
                                <span className="saau-image-placeholder">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    Upload Organization Logo
                                </span>
                            )}
                        </div>
                        <label className="saau-upload-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Upload Logo
                            <input 
                                type="file" 
                                name="logo" 
                                accept="image/*" 
                                onChange={handleLogoChange} 
                                className={validationErrors.logo ? 'saau-field-error' : ''}
                            />
                        </label>
                        {validationErrors.logo && (
                            <div className="saau-error-message">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {validationErrors.logo}
                            </div>
                        )}
                    </div>

                    {/* After the saau-image-upload div, add this conditional rendering */}
                        {formData.role === 'Organization' ? (
                        <div className="saau-field-group">
                            <label htmlFor="presidentSignature" className="saau-field-label">
                            President Signature (PNG/JPEG) <span className="saau-field-required">*</span>
                            </label>
                            <input
                            type="file"
                            name="presidentSignature"
                            accept="image/png, image/jpeg"
                            onChange={handleSignatureChange}
                            className={`saau-field-input ${validationErrors.presidentSignature ? 'saau-field-error' : ''}`}
                            />
                            {validationErrors.presidentSignature && (
                            <div className="saau-error-message">
                                <i className="fas fa-exclamation-circle"></i> {validationErrors.presidentSignature}
                            </div>
                            )}
                        </div>
                        ) : (
                        formData.role !== 'SuperAdmin' && (
                            <div className="saau-field-group">
                            <label htmlFor="signature" className="saau-field-label">
                                Signature (PNG/JPEG) <span className="saau-field-required">*</span>
                            </label>
                            <input
                                type="file"
                                name="signature"
                                accept="image/png, image/jpeg"
                                onChange={handleSignatureChange}
                                className={`saau-field-input ${validationErrors.signature ? 'saau-field-error' : ''}`}
                            />
                            {validationErrors.signature && (
                                <div className="saau-error-message">
                                <i className="fas fa-exclamation-circle"></i> {validationErrors.signature}
                                </div>
                            )}
                            </div>
                        )
                        )}

                    <div className="saau-form-fields">
                        <div className="saau-field-group">
                            <label htmlFor="role" className="saau-field-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                Role <span className="saau-field-required">*</span>
                            </label>
                            <select 
                                name="role" 
                                value={formData.role} 
                                onChange={handleChange}
                                className={`saau-field-select ${validationErrors.role ? 'saau-field-error' : ''}`}
                            >
                                <option value="Admin">Admin</option>
                                <option value="SuperAdmin">Super Admin</option>
                                <option value="Authority">Authority</option>
                                <option value="Organization">Organization</option>
                            </select>
                        </div>

                        {(formData.role === 'Admin' || formData.role === 'Authority' || formData.role === 'SuperAdmin') && (
                            <>
                                <div className="saau-field-group">
                                    <label htmlFor="firstName" className="saau-field-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        First Name <span className="saau-field-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter first name"
                                        className={`saau-field-input ${validationErrors.firstName ? 'saau-field-error' : ''}`}
                                    />
                                    {validationErrors.firstName && (
                                        <div className="saau-error-message">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            {validationErrors.firstName}
                                        </div>
                                    )}
                                </div>

                                <div className="saau-field-group">
                                    <label htmlFor="lastName" className="saau-field-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        Last Name <span className="saau-field-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter last name"
                                        className={`saau-field-input ${validationErrors.lastName ? 'saau-field-error' : ''}`}
                                    />
                                    {validationErrors.lastName && (
                                        <div className="saau-error-message">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            {validationErrors.lastName}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {formData.role === 'Organization' && (
                            <div className="saau-field-group">
                                <label htmlFor="presidentName" className="saau-field-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    President Name <span className="saau-field-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="presidentName"
                                    value={formData.presidentName}
                                    onChange={handleChange}
                                    placeholder="Enter president's name"
                                    className={`saau-field-input ${validationErrors.presidentName ? 'saau-field-error' : ''}`}
                                />
                                {validationErrors.presidentName && (
                                    <div className="saau-error-message">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                        {validationErrors.presidentName}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="saau-field-group">
                            <label htmlFor="email" className="saau-field-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                Email <span className="saau-field-required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                className={`saau-field-input ${validationErrors.email ? 'saau-field-error' : ''}`}
                            />
                            {validationErrors.email && (
                                <div className="saau-error-message">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    {validationErrors.email}
                                </div>
                            )}
                        </div>

                        {formData.role === 'Authority' && (
                            <>
                                <div className="saau-field-group">
                                    <label htmlFor="faculty" className="saau-field-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                        Faculty and School Admin <span className="saau-field-required">*</span>
                                    </label>
                                    <select 
                                        name="faculty" 
                                        value={formData.faculty} 
                                        onChange={handleChange}
                                        className={`saau-field-select ${validationErrors.faculty ? 'saau-field-error' : ''}`}
                                    >
                                        <option value="">Select Role</option>
                                        {faculties.map((faculty, index) => (
                                            <option key={index} value={faculty}>{faculty}</option>
                                        ))}
                                    </select>
                                    {validationErrors.faculty && (
                                        <div className="saau-error-message">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            {validationErrors.faculty}
                                        </div>
                                    )}
                                </div>

                                {formData.faculty === 'Adviser' && (
                                    <div className="saau-field-group">
                                        <label htmlFor="organization" className="saau-field-label">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                                <line x1="9" y1="21" x2="9" y2="9"></line>
                                            </svg>
                                            Organization <span className="saau-field-required">*</span>
                                        </label>
                                        <select
                                            name="organization"
                                            value={formData.organization}
                                            onChange={handleChange}
                                            className={`saau-field-select ${validationErrors.organization ? 'saau-field-error' : ''}`}
                                        >
                                            <option value="">Select Organization</option>
                                            {organizations.map((org) => (
                                                <option key={org._id} value={org.organizationName}>
                                                    {org.organizationName}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors.organization && (
                                            <div className="saau-error-message">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                </svg>
                                                {validationErrors.organization}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formData.faculty === 'Dean' && (
                                    <div className="saau-field-group">
                                        <label htmlFor="deanForOrganization" className="saau-field-label">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                                <line x1="9" y1="21" x2="9" y2="9"></line>
                                            </svg>
                                            Academic Organization <span className="saau-field-required">*</span>
                                        </label>
                                        <select
                                            name="deanForOrganization"
                                            value={formData.deanForOrganization}
                                            onChange={handleChange}
                                            className={`saau-field-select ${validationErrors.deanForOrganization ? 'saau-field-error' : ''}`}
                                        >
                                            <option value="">Select Academic Organization</option>
                                            {academicOrganizations.map((org) => (
                                                <option key={org._id} value={org.organizationName}>
                                                    {org.organizationName}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors.deanForOrganization && (
                                            <div className="saau-error-message">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                </svg>
                                                {validationErrors.deanForOrganization}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {formData.role === 'Organization' && (
                            <>
                                <div className="saau-field-group">
                                    <label htmlFor="organizationName" className="saau-field-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="3" y1="9" x2="21" y2="9"></line>
                                            <line x1="9" y1="21" x2="9" y2="9"></line>
                                        </svg>
                                        Organization Name <span className="saau-field-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        placeholder="Enter organization name"
                                        className={`saau-field-input ${validationErrors.organizationName ? 'saau-field-error' : ''}`}
                                    />
                                    {validationErrors.organizationName && (
                                        <div className="saau-error-message">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            {validationErrors.organizationName}
                                        </div>
                                    )}
                                </div>

                                <div className="saau-field-group">
                                    <label htmlFor="organizationType" className="saau-field-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="3" y1="9" x2="21" y2="9"></line>
                                            <line x1="9" y1="21" x2="9" y2="9"></line>
                                        </svg>
                                        Organization Type <span className="saau-field-required">*</span>
                                    </label>
                                    <select
                                        name="organizationType"
                                        value={formData.organizationType}
                                        onChange={handleChange}
                                        className={`saau-field-select ${validationErrors.organizationType ? 'saau-field-error' : ''}`}
                                    >
                                        <option value="">Select Organization Type</option>
                                        {typeorganizations.map((type, index) => (
                                            <option key={index} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {validationErrors.organizationType && (
                                        <div className="saau-error-message">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            {validationErrors.organizationType}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="saau-field-group">
                            <label htmlFor="password" className="saau-field-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Password <span className="saau-field-required">*</span>
                            </label>
                            <div className="saau-password-input-container">
                                <input
                                    type={showPassword.password ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className={`saau-field-input ${validationErrors.password ? 'saau-field-error' : ''}`}
                                />
                                <button
                                    type="button"
                                    className="saau-password-toggle"
                                    onClick={() => toggleShowPassword('password')}
                                    aria-label={showPassword.password ? "Hide password" : "Show password"}
                                >
                                    {showPassword.password ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <div className="saau-error-message">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    {validationErrors.password}
                                </div>
                            )}
                            <div className="saau-password-requirements">
                                Password must contain:
                                <ul className="saau-password-list">
                                    <li className={formData.password.length >= 8 ? 'valid' : ''}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {formData.password.length >= 8 ? (
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            ) : (
                                                <circle cx="12" cy="12" r="10"></circle>
                                            )}
                                        </svg>
                                        At least 8 characters
                                    </li>
                                    <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {/[A-Z]/.test(formData.password) ? (
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            ) : (
                                                <circle cx="12" cy="12" r="10"></circle>
                                            )}
                                        </svg>
                                        One uppercase letter
                                    </li>
                                    <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {/[a-z]/.test(formData.password) ? (
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            ) : (
                                                <circle cx="12" cy="12" r="10"></circle>
                                            )}
                                        </svg>
                                        One lowercase letter
                                    </li>
                                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? (
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            ) : (
                                                <circle cx="12" cy="12" r="10"></circle>
                                            )}
                                        </svg>
                                        One special character
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="saau-field-group">
                            <label htmlFor="confirmPassword" className="saau-field-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Confirm Password <span className="saau-field-required">*</span>
                            </label>
                            <div className="saau-password-input-container">
                                <input
                                    type={showPassword.confirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className={`saau-field-input ${validationErrors.confirmPassword ? 'saau-field-error' : ''}`}
                                />
                                <button
                                    type="button"
                                    className="saau-password-toggle"
                                    onClick={() => toggleShowPassword('confirmPassword')}
                                    aria-label={showPassword.confirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {validationErrors.confirmPassword && (
                                <div className="saau-error-message">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    {validationErrors.confirmPassword}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button type="submit" className="saau-submit-btn" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="saau-spinner"></span>
                            Adding User...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            Add User
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SuperAdminAddUser;