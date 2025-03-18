import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './OrgSubmittedForms.css';

const OrgSubmittedForms = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const token = localStorage.getItem("token");
                const storedUser = localStorage.getItem("user");
                const parsedUser = storedUser ? JSON.parse(storedUser) : null;
                const userEmail = parsedUser?.email;

                if (!token || !userEmail) {
                    console.error("❌ Authentication failed! Missing token or user email.");
                    setError("Authentication failed! Please log in again.");
                    setLoading(false);
                    return;
                }

                console.log("🟢 Fetching forms submitted by:", userEmail);

                const response = await fetch(`https://studevent-server.vercel.app/api/forms/by-email/${userEmail}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                console.log("🔄 API Response Status:", response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("✅ Fetched Forms:", data);

                setForms(data);
            } catch (error) {
                console.error("🔥 Error fetching forms:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, []);

    return (
        <div className="org-forms-body">
        <div className="org-submitted-forms">
            <h2>My Submitted Forms</h2>
                        {loading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                </div>
            ) : error ? (
                <p className="error-message">Error: {error}</p>
            ) : forms.length === 0 ? (
                <p className="no-forms-text">No submitted forms found.</p>
            ) : (
                <ul className="form-list">
                 {forms.map((form) => (
                        <li 
                            key={form._id} 
                            className="form-card"
                            onClick={() => navigate(`/orgTrackerViewer/${form._id}`)} // Redirect to OrgTrackerViewer
                        >
                            <h4 className="event-title">{form.eventTitle}</h4>
                            <p>Status: 
                                <strong className={`status-indicator ${form.finalStatus?.toLowerCase() || "pending"}`}>
                                    {form.finalStatus || "Pending"}
                                </strong>
                            </p>
                            <p>Submitted on: {form.applicationDate ? new Date(form.applicationDate).toLocaleDateString() : "No Date"}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </div>
    );
};

export default OrgSubmittedForms;
