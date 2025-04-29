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
            <h2 className="saau-title">Add New User</h2>

            {error && <div className="saau-alert saau-alert-error">{error}</div>}
            {success && <div className="saau-alert saau-alert-success">{success}</div>}

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="saau-form">
                <div className="saau-form-section">
                    <div className="saau-image-upload">
                        <div className="saau-image-preview">
                            {logo ? (
                                <img src={URL.createObjectURL(logo)} alt="Logo Preview" />
                            ) : (
                                <span className="saau-image-placeholder">Upload Logo</span>
                            )}
                        </div>
                        <label className="saau-upload-btn">
                            Upload Image
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
                                <i className="fas fa-exclamation-circle"></i> {validationErrors.logo}
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
                            <label htmlFor="role" className="saau-field-label">Role</label>
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
                                        First Name <span className="saau-field-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`saau-field-input ${validationErrors.firstName ? 'saau-field-error' : ''}`}
                                    />
                                    {validationErrors.firstName && (
                                        <div className="saau-error-message">
                                            <i className="fas fa-exclamation-circle"></i> {validationErrors.firstName}
                                        </div>
                                    )}
                                </div>

                                <div className="saau-field-group">
                                    <label htmlFor="lastName" className="saau-field-label">
                                        Last Name <span className="saau-field-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={`saau-field-input ${validationErrors.lastName ? 'saau-field-error' : ''}`}
                                    />
                                    {validationErrors.lastName && (
                                        <div className="saau-error-message">
                                            <i className="fas fa-exclamation-circle"></i> {validationErrors.lastName}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {formData.role === 'Organization' && (
                            <div className="saau-field-group">
                                <label htmlFor="presidentName" className="saau-field-label">
                                    President Name <span className="saau-field-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="presidentName"
                                    value={formData.presidentName}
                                    onChange={handleChange}
                                    className={`saau-field-input ${validationErrors.presidentName ? 'saau-field-error' : ''}`}
                                />
                                {validationErrors.presidentName && (
                                    <div className="saau-error-message">
                                        <i className="fas fa-exclamation-circle"></i> {validationErrors.presidentName}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="saau-field-group">
                            <label htmlFor="email" className="saau-field-label">
                                Email <span className="saau-field-required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`saau-field-input ${validationErrors.email ? 'saau-field-error' : ''}`}
                            />
                            {validationErrors.email && (
                                <div className="saau-error-message">
                                    <i className="fas fa-exclamation-circle"></i> {validationErrors.email}
                                </div>
                            )}
                        </div>

                        {formData.role === 'Authority' && (
                            <>
                                <div className="saau-field-group">
                                    <label htmlFor="faculty" className="saau-field-label">Faculty and School Admin</label>
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
                                            <i className="fas fa-exclamation-circle"></i> {validationErrors.faculty}
                                        </div>
                                    )}
                                </div>

                                {formData.faculty === 'Adviser' && (
                                    <div className="saau-field-group">
                                        <label htmlFor="organization" className="saau-field-label">Organization</label>
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
                                                <i className="fas fa-exclamation-circle"></i> {validationErrors.organization}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formData.faculty === 'Dean' && (
                                    <div className="saau-field-group">
                                        <label htmlFor="deanForOrganization" className="saau-field-label">Academic Organization</label>
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
                                                <i className="fas fa-exclamation-circle"></i> {validationErrors.deanForOrganization}
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
                                        Organization Name <span className="saau-field-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        className={`saau-field-input ${validationErrors.organizationName ? 'saau-field-error' : ''}`}
                                    />
                                    {validationErrors.organizationName && (
                                        <div className="saau-error-message">
                                            <i className="fas fa-exclamation-circle"></i> {validationErrors.organizationName}
                                        </div>
                                    )}
                                </div>

                                <div className="saau-field-group">
                                    <label htmlFor="organizationType" className="saau-field-label">Organization Type</label>
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
                                            <i className="fas fa-exclamation-circle"></i> {validationErrors.organizationType}
                                        </div>
                                    )}
                                </div>

                                
                            </>
                        )}

                            <div className="saau-field-group">
                            <label htmlFor="password" className="saau-field-label">
                                Password <span className="saau-field-required">*</span>
                            </label>
                            <div className="saau-password-input-container">
                                <input
                                type={showPassword.password ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
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
                                <i className="fas fa-exclamation-circle"></i> {validationErrors.password}
                                </div>
                            )}
                            <div className="saau-password-requirements">
                                Password must contain:
                                <ul className="saau-password-list">
                                <li className={formData.password.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
                                <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>One uppercase letter</li>
                                <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>One lowercase letter</li>
                                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>One special character</li>
                                </ul>
                            </div>
                            </div>

                            <div className="saau-field-group">
                            <label htmlFor="confirmPassword" className="saau-field-label">
                                Confirm Password <span className="saau-field-required">*</span>
                            </label>
                            <div className="saau-password-input-container">
                                <input
                                type={showPassword.confirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                                <i className="fas fa-exclamation-circle"></i> {validationErrors.confirmPassword}
                                </div>
                            )}
                            </div>
                    </div>
                </div>

                <button type="submit" className="saau-submit-btn" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="saau-spinner spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Adding User...
                        </>
                    ) : (
                        'Add User'
                    )}
                </button>
            </form>
        </div>
    );
};

export default SuperAdminAddUser;