    import React, { useState } from 'react';
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
            organization: '', // For faculty 'Adviser'
            organizationType: '', // Organization type
            organizationName: '', // NEW: Organization name
        });

        const [logo, setLogo] = useState(null);
        const [loading, setLoading] = useState(false);
        const [signature, setSignature] = useState(null); // NEW: Signature state
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');
        const [validationErrors, setValidationErrors] = useState({});

        const faculties = ['Adviser', 'Dean', 'Academic Services', 'Academic Director', 'Executive Director'];
        const typeorganizations = [
            'Recognized Student Organization - Special Interest',
            'Recognized Student Organization - Academic',
            'College Student Council'
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

         // NEW: Handle signature upload
    const handleSignatureChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'image/png') {
            setSignature(file);
            setError('');
        } else {
            setError('Please upload a valid PNG file for the signature.');
            setSignature(null);
        }
    };

        const validateForm = () => {
            const { firstName, lastName, email, password, confirmPassword, role, organizationType, organizationName } = formData;
            let errors = {};
            let isValid = true;

            console.log('Form Data:', formData);

            if (role === 'Admin' || role === 'Authority') {
                if (!firstName.trim()) {
                    isValid = false;
                    errors.firstName = 'First Name is required.';
                }
                if (!lastName.trim()) {
                    isValid = false;
                    errors.lastName = 'Last Name is required.';
                }
            }

            if (role !== 'Organization') {
                if (!firstName) {
                    isValid = false;
                    errors.firstName = 'First Name is required.';
                }
                if (!lastName) {
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
                    errors.organizationName = 'Organization Name is required.'; // Add validation for organization name
                }
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

                    // NEW: Validate signature for roles that require it
            if ((role === 'Admin' || role === 'Authority') && !signature) {
                isValid = false;
                errors.signature = 'Signature is required.';
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
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('logo', logo);

        if (formData.role === 'Authority') {
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('faculty', formData.faculty);
        } else if (formData.role === 'Admin') {
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
        }else if (formData.role === 'Organization') {
            data.append('organizationType', formData.organizationType); 
            data.append('organizationName', formData.organizationName); // Include organization name in submission
        }

         // NEW: Append signature if required
         if ((formData.role === 'Admin' || formData.role === 'Authority') && signature) {
            data.append('signature', signature);
        }

        // Debugging: Check FormData content
        for (let pair of data.entries()) {
            console.log(pair[0], pair[1]);
        }

        try {
            setLoading(true);
            const response = await axios.post('https://studevent-server.vercel.app/api/users', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('User added successfully!');
            setFormData({
                role: 'Admin',
                firstName: '',
                lastName: '',
                email: '',
                faculty: '',
                organization: '',
                organizationType: '',
                organizationName: '', // Reset field
                password: '',
                confirmPassword: '',
            });
            setLogo(null);
            setSignature(null); // NEW: Reset signature
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

                        {/* NEW: Signature Upload Field */}
                    {(formData.role === 'Admin' || formData.role === 'Authority') && (
                        <div className="form-group">
                            <label htmlFor="signature">Signature (PNG) <span className="important">*</span></label>
                            <input
                                type="file"
                                name="signature"
                                accept="image/png"
                                onChange={handleSignatureChange}
                                className={validationErrors.signature ? 'input-error' : ''}
                            />
                            {validationErrors.signature && <small className="error-text">{validationErrors.signature}</small>}
                        </div>
                    )}

                        <div className="form-fields">
                            <div className="form-group">
                                <label htmlFor="role">Role:</label>
                                <select name="role" value={formData.role} onChange={handleChange}>
                                    <option value="Admin">Admin</option>
                                    <option value="Authority">Authority</option>
                                    <option value="Organization">Organization</option>
                                </select>
                            </div>

                            {formData.role !== 'Organization' && (
                                    <>
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
                                    </>
                                )}


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
                                            <label htmlFor="organization">Type of Organizations:</label>
                                            <select name="organization" value={formData.organization} onChange={handleChange}>
                                                <option value="">Select Organization</option>
                                                {typeorganizations.map((organization, index) => (
                                                    <option key={index} value={organization}>
                                                        {organization}
                                                    </option>
                                                ))}
                                            </select>
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
