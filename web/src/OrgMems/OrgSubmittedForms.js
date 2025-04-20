import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './OrgSubmittedForms.css';

const OrgSubmittedForms = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const token = localStorage.getItem("token");
                const storedUser = localStorage.getItem("user");
                const parsedUser = storedUser ? JSON.parse(storedUser) : null;
                const userEmail = parsedUser?.email;

                if (!token || !userEmail) {
                    setError("Authentication failed! Please log in again.");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`https://studevent-server.vercel.app/api/forms/by-email/${userEmail}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setForms(data);
            } catch (error) {
                console.error("Error fetching forms:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, []);

    const getEventTitle = (form) => {
        if (form.source === 'localOff') {
            return `Local Off-Campus: ${form.nameOfHei || 'Untitled'}`;
        }
        return form.eventTitle || form.nameOfRso || 'Untitled Event';
    };

    const getFormType = (form) => {
        if (form.source === 'localOff') {
            return form.formPhase === 'BEFORE' 
                ? 'Local Off-Campus (BEFORE)' 
                : 'Local Off-Campus (AFTER)';
        }
        return form.formType || 'N/A';
    };

    const getFormStatus = (form) => {
        if (form.source === 'localOff') {
            return form.status || 'Pending';
        }
        return form.finalStatus || 'Pending';
    };

    const isFormEditable = (form) => {
        // For Local Off-Campus forms
        if (form.source === 'localOff') {
            return form.status === 'draft' || form.status === 'submitted';
        }
        
        // For regular forms
        if (!form.reviewStages || form.currentStep === undefined) return false;
        const deanStepIndex = form.reviewStages.findIndex(step => step.role === 'Dean');
        return deanStepIndex === -1 || form.currentStep < deanStepIndex;
    };

    const isFormDeletable = (form) => {
        // For Local Off-Campus forms
        if (form.source === 'localOff') {
            return form.status === 'draft' || form.status === 'submitted';
        }
        
        // For regular forms
        return (form.finalStatus?.trim().toLowerCase() === "pending" && 
                isFormEditable(form));
    };

    const getFilteredForms = () => {
        const filtered = forms.filter(form => {
            const status = getFormStatus(form).toLowerCase();
            switch (filter) {
                case "pending":
                    return status === "pending" || status === "submitted";
                case "approved":
                    return status === "approved";
                default:
                    return true;
            }
        });

        // Sort by submission date (newest first)
        return filtered.sort((a, b) => {
            const dateA = a.submittedAt || a.applicationDate;
            const dateB = b.submittedAt || b.applicationDate;
            return new Date(dateB) - new Date(dateA);
        });
    };

    const handleFilterClick = (filterType) => {
        setFilter(filterType);
    };

    const handleRowClick = (form) => {
        if (form.source === 'localOff') {
            navigate(`/local-off-campus-view/${form._id}`);
        } else {
            navigate(`/orgTrackerViewer/${form._id}`);
        }
    };

    const handleEditClick = (e, form) => {
        e.stopPropagation();
        if (form.source === 'localOff') {
            navigate(`/edit-local-off-campus/${form._id}`, {
                state: { formData: form }
            });
        } else {
            const formDataForEdit = {
                ...form,
                ...(form.eventStartDate && { 
                    eventStartDate: new Date(form.eventStartDate).toISOString() 
                }),
                ...(form.eventEndDate && { 
                    eventEndDate: new Date(form.eventEndDate).toISOString() 
                }),
                ...(form.applicationDate && { 
                    applicationDate: new Date(form.applicationDate).toISOString().split('T')[0] 
                })
            };
            const editRoute = form.formType === 'Budget' 
                ? `/edit-budget/${form._id}`
                : `/edit-form/${form._id}`;
            navigate(editRoute, { 
                state: { 
                    formData: formDataForEdit,
                    from: 'submitted-forms' 
                } 
            });
        }
    };

    const handleDeleteClick = (e, formId) => {
        e.stopPropagation();
        const form = forms.find(f => f._id === formId);
        if (form) {
            setFormToDelete(form);
            setShowDeleteModal(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!formToDelete) return;
        
        setIsDeleting(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication token not found. Please log in again.");
            }

            // Determine the correct endpoint based on form type
            const endpoint = formToDelete.source === 'localOff'
                ? `https://studevent-server.vercel.app/api/local-off-campus/${formToDelete._id}`
                : `https://studevent-server.vercel.app/api/forms/${formToDelete._id}`;

            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const responseData = await response.json();
        
            if (!response.ok) {
                throw new Error(responseData.message || 
                `Failed to delete form (Status: ${response.status})`);
            }
        
            // Success case:
            setForms(forms.filter(form => form._id !== formToDelete._id));
            setShowDeleteModal(false);
            setFormToDelete(null);
            
            // Set success message
            setError("Form deleted successfully!");
            
            // Auto-hide success message after delay
            setTimeout(() => setError(null), 3000);
        
        } catch (error) {
            console.error("Error deleting form:", error);
            setError(error.message || "Failed to delete form. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setFormToDelete(null);
        setError(null);
    };

    const getSubmissionDate = (form) => {
        const date = form.submittedAt || form.applicationDate;
        return date ? new Date(date).toLocaleDateString() : 'No Date';
    };

    const renderTableRow = (form) => (
        <tr key={form._id} onClick={() => handleRowClick(form)}>
            <td>{getFormType(form)}</td>
            <td>{getEventTitle(form)}</td>
            <td>
                <span className={`status-badge ${getFormStatus(form).toLowerCase()}`}>
                    {getFormStatus(form)}
                </span>
            </td>
            <td>{getSubmissionDate(form)}</td>
            <td>
                <div className="action-buttons">
                    {isFormEditable(form) && (
                        <button 
                            className="edit-button"
                            onClick={(e) => handleEditClick(e, form)}
                        >
                            Edit
                        </button>
                    )}
                    {isFormDeletable(form) && (
                        <button 
                            className="delete-button"
                            onClick={(e) => handleDeleteClick(e, form._id)}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="org-submitted-forms-container">
            <h2>My Submitted Forms</h2>
            {error && (
                <p className={`status-message ${error.includes("success") ? "success" : "error"}`}>
                    {error}
                </p>
            )}

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your forms...</p>
                </div>
            ) : (
                <>
                    <div className="filter-buttons">
                        <button
                            className={`filter-button ${filter === "all" ? "active" : ""}`}
                            onClick={() => handleFilterClick("all")}
                        >
                            All Forms
                        </button>
                        <button
                            className={`filter-button ${filter === "pending" ? "active" : ""}`}
                            onClick={() => handleFilterClick("pending")}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-button ${filter === "approved" ? "active" : ""}`}
                            onClick={() => handleFilterClick("approved")}
                        >
                            Approved
                        </button>
                    </div>

                    <div className="table-wrapper">
                        {forms.length === 0 ? (
                            <p className="no-forms-message">No submitted forms found.</p>
                        ) : (
                            <table className="forms-table">
                                <thead>
                                    <tr>
                                        <th>Form Type</th>
                                        <th>Event Title</th>
                                        <th>Status</th>
                                        <th>Submitted Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredForms().map(renderTableRow)}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="modal-overlay">
                            <div className="delete-modal">
                                <h3>Confirm Deletion</h3>
                                <p>Are you sure you want to delete the "{getEventTitle(formToDelete)}" proposal? This action cannot be undone.</p>
                                <p>This will also remove any associated calendar events.</p>
                                <div className="modal-buttons">
                                    <button 
                                        className="cancel-button"
                                        onClick={handleCancelDelete}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="confirm-delete-button"
                                        onClick={handleConfirmDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrgSubmittedForms;