import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './OrgSubmittedForms.css';

const OrgSubmittedForms = () => {
    const navigate = useNavigate();
    const [allForms, setAllForms] = useState([]);
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
                const user = JSON.parse(localStorage.getItem("user"));
                
                if (!token || !user?._id) {
                    setError("Authentication failed! Please log in again.");
                    setLoading(false);
                    return;
                }

                // Fetch all form types in parallel
                const [formsRes, localOffRes] = await Promise.all([
                    fetch(`https://studevent-server.vercel.app/api/forms/by-email/${user.email}`, {
                        headers: { 
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }),
                    fetch(`https://studevent-server.vercel.app/api/local-off-campus/by-user/${user._id}`, {
                        headers: { 
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                ]);

                if (!formsRes.ok || !localOffRes.ok) {
                    throw new Error(`Failed to fetch forms: ${formsRes.statusText || localOffRes.statusText}`);
                }

                const formsData = await formsRes.json();
                const localOffData = await localOffRes.json();

                // Transform Local Off-Campus forms to match the expected structure
                const transformedLocalOffForms = (localOffData.data || localOffData).map(form => ({
                    ...form,
                    _id: form._id,
                    formType: "LocalOffCampus",
                    finalStatus: form.status || 'submitted',
                    applicationDate: form.submittedAt,
                    eventTitle: form.formPhase === 'BEFORE' 
                        ? `Local Off-Campus: ${form.nameOfHei || 'Untitled'}`
                        : `After Report: ${form.nameOfHei || 'Untitled'}`,
                    isLocalOffCampus: true // Add marker for easier identification
                }));

                setAllForms([
                    ...(Array.isArray(formsData) ? formsData : []),
                    ...transformedLocalOffForms
                ]);
            } catch (error) {
                console.error("Error fetching forms:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, []);

    const isFormEditable = (form) => {
        if (form.formType === 'LocalOffCampus') {
            return form.formPhase === 'BEFORE' && 
                   (form.status === 'submitted' || form.status === 'pending');
        }
        
        // Original logic for other forms
        if (!form.reviewStages || form.currentStep === undefined) return false;
        const deanStepIndex = form.reviewStages.findIndex(step => step.role === 'Dean');
        return deanStepIndex === -1 || form.currentStep < deanStepIndex;
    };

    const isFormDeletable = (form) => {
        if (form.formType === 'LocalOffCampus') {
            return form.formPhase === 'BEFORE' && 
                   (form.status === 'submitted' || form.status === 'pending');
        }
        
        // Original logic for other forms
        return (form.finalStatus?.toLowerCase() === "pending" || 
                form.status?.toLowerCase() === "pending") && 
               isFormEditable(form);
    };

    const getFilteredForms = () => {
        return allForms.filter(form => {
            const status = form.finalStatus?.toLowerCase() || form.status?.toLowerCase();
            switch (filter) {
                case "pending":
                    return status === 'pending' || status === 'submitted';
                case "approved":
                    return status === 'approved';
                default:
                    return true;
            }
        });
    };

    const handleFilterClick = (filterType) => {
        setFilter(filterType);
    };

    const handleDeleteClick = (e, formId, formType) => {
        e.stopPropagation();
        const form = allForms.find(f => f._id === formId);
        if (form) {
            setFormToDelete({ ...form, formType });
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

            const endpoint = formToDelete.formType === 'LocalOffCampus'
                ? `https://studevent-server.vercel.app/api/local-off-campus/${formToDelete._id}`
                : `https://studevent-server.vercel.app/api/forms/${formToDelete._id}`;

            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete form (Status: ${response.status})`);
            }

            setAllForms(allForms.filter(form => form._id !== formToDelete._id));
            setShowDeleteModal(false);
            setFormToDelete(null);
            setError("Form deleted successfully!");
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

    const getStatusBadgeClass = (status) => {
        if (!status) return 'pending';
        status = status.toLowerCase();
        if (status === 'approved') return 'approved';
        if (status === 'declined' || status === 'rejected') return 'rejected';
        return 'pending';
    };

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
                        {allForms.length === 0 ? (
                            <p className="no-forms-message">No submitted forms found.</p>
                        ) : (
                            <table className="forms-table">
                                <thead>
                                    <tr>
                                        <th>Form Type</th>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Submitted Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredForms().map((form) => (
                                        <tr 
                                            key={form._id}
                                            onClick={() => navigate(
                                                form.formType === 'LocalOffCampus'
                                                    ? `/local-off-campus/${form._id}`
                                                    : `/orgTrackerViewer/${form._id}`
                                            )}
                                        >
                                            <td>
                                                {form.formType === 'LocalOffCampus'
                                                    ? `Local Off-Campus (${form.formPhase})`
                                                    : form.formType || 'N/A'}
                                            </td>
                                            <td>
                                                {form.eventTitle || 
                                                 form.projectTitle || 
                                                 (form.formType === 'LocalOffCampus' 
                                                  ? form.nameOfHei 
                                                  : 'Untitled Event')}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadgeClass(form.finalStatus || form.status)}`}>
                                                    {form.finalStatus || form.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                {form.applicationDate || form.submittedAt
                                                    ? new Date(form.applicationDate || form.submittedAt).toLocaleDateString()
                                                    : 'No Date'}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {isFormEditable(form) && (
                                                        <button 
                                                            className="edit-button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(
                                                                    form.formType === 'LocalOffCampus'
                                                                        ? `/edit-local-off-campus/${form._id}`
                                                                        : `/edit-form/${form._id}`,
                                                                    { state: { formData: form } }
                                                                );
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {isFormDeletable(form) && (
                                                        <button 
                                                            className="delete-button"
                                                            onClick={(e) => handleDeleteClick(e, form._id, form.formType)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {showDeleteModal && (
                        <div className="modal-overlay">
                            <div className="delete-modal">
                                <h3>Confirm Deletion</h3>
                                <p>
                                    Are you sure you want to delete this {formToDelete?.formType === 'LocalOffCampus'
                                        ? 'Local Off-Campus form'
                                        : 'form'}? This action cannot be undone.
                                </p>
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