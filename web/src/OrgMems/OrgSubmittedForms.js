import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './OrgSubmittedForms.css';

const OrgSubmittedForms = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");

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

    const isFormEditable = (form) => {
      if (!form.reviewStages || form.currentStep === undefined) return false;
      const deanStepIndex = form.reviewStages.findIndex(step => step.role === 'Dean');
      return deanStepIndex === -1 || form.currentStep < deanStepIndex;
    };

    const getFilteredForms = () => {
        switch (filter) {
            case "pending":
                return forms.filter((form) => form.finalStatus?.trim().toLowerCase() === "pending");
            case "approved":
                return forms.filter((form) => form.finalStatus?.trim().toLowerCase() === "approved");
            case "declined":
                return forms.filter((form) => form.finalStatus?.trim().toLowerCase() === "declined");
            default:
                return forms;
        }
    };

    const handleFilterClick = (filterType) => {
        setFilter(filterType);
    };

    return (
        <div className="org-submitted-forms-container">
            <h2>My Submitted Forms</h2>
            {error && <p className="error-message">{error}</p>}

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
                        <button
                            className={`filter-button ${filter === "declined" ? "active" : ""}`}
                            onClick={() => handleFilterClick("declined")}
                        >
                            Declined
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
                                    {getFilteredForms().map((form) => (
                                        <tr 
                                            key={form._id}
                                            onClick={() => navigate(`/orgTrackerViewer/${form._id}`)}
                                        >
                                            <td>{form.formType || 'N/A'}</td>
                                            <td>{form.eventTitle || 'Untitled Event'}</td>
                                            <td>
                                                <span className={`status-badge ${form.finalStatus?.toLowerCase() || 'pending'}`}>
                                                    {form.finalStatus || 'Pending'}
                                                </span>
                                            </td>
                                            <td>{form.applicationDate ? new Date(form.applicationDate).toLocaleDateString() : 'No Date'}</td>
                                            <td>
                                                {isFormEditable(form) && (
                                                    <button 
                                                        className="edit-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const formDataForEdit = {
                                                                ...form,
                                                                eventStartDate: form.eventStartDate ? new Date(form.eventStartDate).toISOString() : '',
                                                                eventEndDate: form.eventEndDate ? new Date(form.eventEndDate).toISOString() : '',
                                                                applicationDate: form.applicationDate ? new Date(form.applicationDate).toISOString().split('T')[0] : ''
                                                            };
                                                            navigate(`/edit-form/${form._id}`, { 
                                                                state: { 
                                                                    formData: formDataForEdit,
                                                                    from: 'submitted-forms' 
                                                                } 
                                                            });
                                                        }}
                                                    >
                                                        Edit Form
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default OrgSubmittedForms;