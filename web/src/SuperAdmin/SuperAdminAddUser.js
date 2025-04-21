import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SuperAdminAddUser.css';

const SuperAdminAddUser = () => {
    const [formData, setFormData] = useState({
        role: 'Admin',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        faculty: '',
        organizationId: '', // For faculty 'Adviser' - will store the organization ID
        organizationType: '', // Organization type
        organizationName: '', // Organization name
        presidentName: '', // NEW: President name for organizations
    });

    const [logo, setLogo] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [signature, setSignature] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [presidentSignature, setPresidentSignature] = useState(null);

    const faculties = ['Adviser', 'Dean', 'Academic Services', 'Academic Director', 'Executive Director'];
    const typeorganizations = [
        'Recognized Student Organization - Special Interest',
        'Recognized Student Organization - Academic',
        'College Student Council',
        'Student Govenment',
        'Independent Constitutional Commissions ',
    ];

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

    const handleSignatureChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            if (e.target.name === 'presidentSignature') {
                setPresidentSignature(file);
            } else {
                setSignature(file);
            }
            setError('');
        } else {
            setError('Please upload a valid PNG or JPEG file for the signature.');
            if (e.target.name === 'presidentSignature') {
                setPresidentSignature(null);
            } else {
                setSignature(null);
            }
        }
    };

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    'https://studevent-server.vercel.app/api/users/allorganizations', 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setOrganizations(response.data);
            } catch (error) {
                console.error('Error fetching organizations:', error);
                // Add error handling for the UI
                setError('Failed to load organizations. Please try again later.');
            }
        };
    
        fetchOrganizations();
    }, []);

    const validateForm = () => {
        const { role, firstName, lastName, email, password, confirmPassword, faculty, organizationId, organizationType, organizationName, presidentName } = formData;
        let errors = {};
        let isValid = true;
    
        // Role-specific validations
        if (role === 'Admin' || role === 'Authority' || role === 'SuperAdmin') {
            if (!firstName.trim()) {
                isValid = false;
                errors.firstName = 'First Name is required.';
            }
            if (!lastName.trim()) {
                isValid = false;
                errors.lastName = 'Last Name is required.';
            }
        }
    
        if (role === 'Organization') {
            if (!organizationType) {
                isValid = false;
                errors.organizationType = 'Organization Type is required.';
            }
            if (!organizationName) {
                isValid = false;
                errors.organizationName = 'Organization Name is required.';
            }
            if (!presidentName) {
                isValid = false;
                errors.presidentName = 'President Name is required.';
            }
            if (!presidentSignature) {
                isValid = false;
                errors.presidentSignature = 'President signature is required.';
            }
        } else if (role === 'Admin' || role === 'Authority') {
            if (!signature) {
                isValid = false;
                errors.signature = 'Signature is required.';
            }
        }
    
        // Additional validation for Adviser role
        if (role === 'Authority' && faculty === 'Adviser' && !organizationId) {
            isValid = false;
            errors.organization = 'Organization is required for Adviser role.';
        }
    
        // Common validations
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
    
        if (!logo) {
            isValid = false;
            errors.logo = 'Logo is required.';
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
          return;
        }
      
        try {
          setLoading(true);
          
          const token = localStorage.getItem('token');
          if (!token) {
            return;
          }
      
          const data = new FormData();
          // Add common fields
          data.append('role', formData.role);
          data.append('email', formData.email);
          data.append('password', formData.password);
          data.append('logo', logo);
          
          // Add role-specific fields
          if (formData.role === 'Admin' || formData.role === 'Authority' || formData.role === 'SuperAdmin') {
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
          }
      
          if (formData.role === 'Authority') {
            data.append('faculty', formData.faculty);
            // Add organizationId if faculty is Adviser
            if (formData.faculty === 'Adviser' && formData.organizationId) {
              data.append('organizationId', formData.organizationId);
            }
          }
      
          // Add Organization-specific fields
          if (formData.role === 'Organization') {
            data.append('organizationType', formData.organizationType);
            data.append('organizationName', formData.organizationName);
            data.append('presidentName', formData.presidentName);
            data.append('presidentSignature', presidentSignature);
          } else if (formData.role === 'Admin' || formData.role === 'Authority') {
            data.append('signature', signature);
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
            organizationId: '',
            organizationType: '',
            organizationName: '',
            presidentName: '',
          });
          setLogo(null);
          setSignature(null);
          setPresidentSignature(null);
        } catch (error) {
          console.error('Submission error:', error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
          } else {
            setError(error.response?.data?.message || 'Error adding user. Please try again.');
          }
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
                            <input type="file" name="logo" accept="image/*" onChange={handleLogoChange} required />
                        </label>
                    </div>

                    {formData.role === 'Organization' ? (
                    <div className="form-group">
                        <label htmlFor="presidentSignature">President Signature (PNG/JPEG) <span className="important">*</span></label>
                        <input
                            type="file"
                            name="presidentSignature"
                            accept="image/png, image/jpeg"
                            onChange={handleSignatureChange}
                            className={validationErrors.presidentSignature ? 'input-error' : ''}
                            required
                        />
                        {validationErrors.presidentSignature && (
                            <small className="error-text">{validationErrors.presidentSignature}</small>
                        )}
                    </div>
                ) : (
                    formData.role !== 'SuperAdmin' && (  // Only show signature field if not SuperAdmin
                        <div className="form-group">
                            <label htmlFor="signature">Signature (PNG/JPEG) <span className="important">*</span></label>
                            <input
                                type="file"
                                name="signature"
                                accept="image/png, image/jpeg"
                                onChange={handleSignatureChange}
                                className={validationErrors.signature ? 'input-error' : ''}
                                required={formData.role === 'Admin' || formData.role === 'Authority'}
                            />
                            {validationErrors.signature && (
                                <small className="error-text">{validationErrors.signature}</small>
                            )}
                        </div>
                    )
                )}
                    <div className="form-fields">
                        <div className="form-group">
                            <label htmlFor="role">Role:</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="SuperAdmin">Super Admin</option>
                                <option value="Admin">Admin</option>
                                <option value="Authority">Authority</option>
                                <option value="Organization">Organization</option>
                            </select>
                        </div>

                        {(formData.role === 'Admin' || formData.role === 'Authority' || formData.role === 'SuperAdmin') && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name <span className="important">*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={validationErrors.firstName ? 'input-error' : ''}
                                        required
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
                                        required
                                    />
                                    {validationErrors.lastName && <small className="error-text">{validationErrors.lastName}</small>}
                                </div>
                            </>
                        )}

                        {formData.role === 'Organization' && (
                            <div className="form-group">
                                <label htmlFor="presidentName">President Name <span className="important">*</span></label>
                                <input
                                    type="text"
                                    name="presidentName"
                                    value={formData.presidentName}
                                    onChange={handleChange}
                                    className={validationErrors.presidentName ? 'input-error' : ''}
                                />
                                {validationErrors.presidentName && <small className="error-text">{validationErrors.presidentName}</small>}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email <span className="important">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={validationErrors.email ? 'input-error' : ''}
                                required
                            />
                            {validationErrors.email && <small className="error-text">{validationErrors.email}</small>}
                        </div>

                              {formData.role === 'Authority' && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="faculty">Faculty and School Admin:</label>
                                            <select name="faculty" value={formData.faculty} onChange={handleChange}>
                                                <option value="">Select Role</option>
                                                {faculties.map((faculty, index) => (
                                                    <option key={index} value={faculty}>
                                                        {faculty}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {formData.faculty === 'Adviser' && (
                                            <div className="form-group">
                                                <label htmlFor="organizationId">Organization <span className="important">*</span></label>
                                                <select 
                                                    name="organizationId" 
                                                    value={formData.organizationId} 
                                                    onChange={handleChange}
                                                    className={validationErrors.organizationId ? 'input-error' : ''}
                                                    required
                                                >
                                                    <option value="">Select Organization</option>
                                                    {organizations.map((org) => (
                                                        <option key={org._id} value={org._id}>
                                                            {org.organizationName}
                                                        </option>
                                                    ))}
                                                </select>
                                                {validationErrors.organizationId && (
                                                    <small className="error-text">{validationErrors.organizationId}</small>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                        {formData.role === 'Organization' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="organizationName">Organization Name <span className="important">*</span></label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        className={validationErrors.organizationName ? 'input-error' : ''}
                                    />
                                    {validationErrors.organizationName && <small className="error-text">{validationErrors.organizationName}</small>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="organizationType">Organization Type:</label>
                                    <select 
                                        name="organizationType"
                                        value={formData.organizationType} 
                                        onChange={handleChange}
                                        className={validationErrors.organizationType ? 'input-error' : ''}
                                    >
                                        <option value="">Select Organization Type</option>
                                        {typeorganizations.map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.organizationType && <small className="error-text">{validationErrors.organizationType}</small>}
                                </div>
                            </>
                        )}
                        <div className="form-group">
                            <label htmlFor="password">Password <span className="important">*</span></label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={validationErrors.password ? 'input-error' : ''}
                                required
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
                                required
                            />
                            {validationErrors.confirmPassword && <small className="error-text">{validationErrors.confirmPassword}</small>}
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Adding...' : 'Add User'}
                </button>
            </form>
        </div>
    );
};

export default SuperAdminAddUser;