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
    const [searchQuery, setSearchQuery] = useState("");

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
          
              // Fetch all forms in parallel with better error handling
              const [regularFormsRes, localOffRes] = await Promise.all([
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
          
              // Handle regular forms response
              let regularForms = [];
              if (regularFormsRes.ok) {
                regularForms = await regularFormsRes.json();
              } else {
                console.error("Failed to fetch regular forms:", regularFormsRes.status);
              }
          
              // Handle local off-campus forms response
              let localOffForms = [];
              if (localOffRes.ok) {
                const localOffData = await localOffRes.json();
                localOffForms = (localOffData.data || localOffData).map(form => ({
                  ...form,
                  _id: form._id,
                  formType: "LocalOffCampus",
                  finalStatus: form.status || 'submitted',
                  applicationDate: form.submittedAt,
                  eventTitle: form.formPhase === 'BEFORE' 
                    ? ` ${form.nameOfHei || 'Untitled'}`
                    : `After Report: ${form.nameOfHei || 'Untitled'}`,
                  isLocalOffCampus: true,
                  formPhase: form.formPhase // Include formPhase explicitly
                }));
              } else {
                console.error("Failed to fetch local off-campus forms:", localOffRes.status);
              }
          
              setAllForms([...regularForms, ...localOffForms]);
            } catch (error) {
              console.error("Error fetching forms:", error);
              setError("Failed to load forms. Please try again later.");
            } finally {
              setLoading(false);
            }
          };

        fetchForms();
    }, []);

    const isFormEditable = (form) => {
        const status = form.finalStatus?.toLowerCase() || form.status?.toLowerCase();
        
        // 1. First check - always allow editing if form was declined
        if (status === 'declined') {
            return true;
        }
        
        // 2. Local Off-Campus forms keep their existing logic
        if (form.formType === 'LocalOffCampus' || form.isLocalOffCampus) {
            if (form.formPhase === 'AFTER') return status !== 'approved';
            if (form.formPhase === 'BEFORE') {
                return status === 'approved' || status === 'submitted' || 
                       status === 'pending' || status === 'draft';
            }
            return false;
        }
        
        // 3. For regular forms, only allow editing if still at adviser step
        if (form.tracker?.steps?.length > 0) {
            const firstStep = form.tracker.steps[0];
            return form.tracker.currentStep === firstStep.stepName && 
                   firstStep.status === 'pending';
        }
        
        // 4. Fallback for older forms without tracker
        if (form.reviewStages) {
            const firstStepIndex = 0; // Adviser is always first step
            return form.currentStep <= firstStepIndex;
        }
        
        // 5. Final fallback
        return status === 'draft' || status === 'pending' || status === 'submitted';
    };
    const isFormDeletable = (form) => {
        if (form.formType === 'LocalOffCampus') {
            return form.formPhase === 'BEFORE' && 
                   (form.status === 'submitted' || form.status === 'pending' || form.status === 'draft');
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
                    return status === 'pending' || status === 'submitted' || status === 'draft';
                case "approved":
                    return status === 'approved';
                default:
                    return true;
            }
        }).filter(form => {
            const title = form.eventTitle || form.projectTitle || (form.formType === 'LocalOffCampus' ? form.nameOfHei : 'Untitled Event');
            return title.toLowerCase().includes(searchQuery.toLowerCase());
        });
    };

    const handleCardClick = (form) => {
        navigate(`/orgTrackerViewer/${form._id}`, { 
            state: { 
                formType: form.formType,
                formPhase: form.formPhase,
                form: form
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

    // In OrgSubmittedForms.js
    const handleEditClick = (e, form) => {
        e.stopPropagation();
        
        if (form.formType === 'LocalOffCampus' || form.isLocalOffCampus) {
            if (form.formPhase === 'AFTER') {
                // Edit existing AFTER report
                navigate('/localoffcampus', { 
                    state: { 
                        editAfterForm: true,
                        formData: form,
                        beforeFormId: form.eventId
                    } 
                });
            } else if (form.status === 'approved') {
                // Start new AFTER report for approved BEFORE form
                navigate('/localoffcampus', { 
                    state: { 
                        startAfterForm: true,  // Changed from editAfterForm
                        beforeFormId: form._id
                    } 
                });
            } else {
                // Edit BEFORE form
                navigate('/localoffcampus', { 
                    state: { 
                        editBeforeForm: true,
                        formData: form 
                    } 
                });
            }
        } else {
            // Original edit logic for other forms
            navigate(`/edit-form/${form._id}`, { state: { formData: form } });
        }
    };

    const getStatusBadgeClass = (form) => {
        const status = form.finalStatus?.toLowerCase() || form.status?.toLowerCase();
      
        if (form.formType === 'LocalOffCampus') {
          switch(status) {
            case 'approved': return 'approved';
            case 'rejected':
            case 'declined': return 'rejected';
            case 'draft': return 'draft';
            case 'submitted':
            case 'pending': 
            default: return 'pending';
          }
        }
        if (!status) return 'pending';
        if (status === 'approved') return 'approved';
        if (status === 'declined' || status === 'rejected') return 'rejected';
        if (status === 'draft') return 'draft';
        return 'pending';
    };
    
    const formatFormType = (form) => {
        if (!form) return 'Unknown Form Type';
        
        // Handle LocalOffCampus forms first
        if (form.formType === 'LocalOffCampus' || form.isLocalOffCampus) {
            return form.formPhase === 'BEFORE' 
                ? 'Local Off-Campus Before Report' 
                : 'Local Off-Campus After Report';
        }
        
        // Handle all other form types
        const rawFormType = form.formType || '';
        switch(rawFormType.toLowerCase()) {
            case 'activity':
                return 'Activity Proposal';
            case 'project':
                return 'Project Proposal';
            case 'budget':
                return 'Budget Proposal';
            default:
                return rawFormType || 'Form';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No Date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    <div className="search-and-filter">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search forms..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
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
                    </div>

                    <div className="card-grid-wrapper">
                {getFilteredForms().length === 0 ? (
                    <p className="no-forms-message">No submitted forms found.</p>
                ) : (
                    <div className="card-grid">
                        {getFilteredForms().map((form) => (
                            <div 
                                className="form-card" 
                                key={form._id}
                                onClick={() => handleCardClick(form)}
                                style={{ cursor: 'pointer' }} // Add pointer cursor to indicate clickability
                            >
                                <div className="form-card-header">
                                    <span className="form-type">{formatFormType(form)}</span>
                                    <span className={`status-badge ${getStatusBadgeClass(form)}`}>
                                        {form.finalStatus || form.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="form-card-title">
                                    {form.eventTitle || form.projectTitle || (form.formType === 'LocalOffCampus' ? form.nameOfHei : 'Untitled Event')}
                                </div>
                                <div className="form-card-info">
                                    <div>
                                        <span className="form-card-label">Submitted:</span>
                                        <span>{formatDate(form.applicationDate || form.submittedAt)}</span>
                                    </div>
                                </div>
                                <div className="form-card-actions" onClick={(e) => e.stopPropagation()}>
                                    {isFormEditable(form) && (
                                        <button 
                                            className="edit-button"
                                            onClick={(e) => handleEditClick(e, form)}
                                        >
                                            {form.formType === 'LocalOffCampus' && 
                                            form.formPhase === 'BEFORE' && 
                                            (form.status === 'approved' || form.finalStatus === 'approved')
                                                ? 'Complete AFTER'
                                                : 'Edit'}
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
                            </div>
                        ))}
                    </div>
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