import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OrgSubmittedForms = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Authentication token is missing! Please log in again.");
                    setLoading(false);
                    return;
                }
    
                const response = await fetch("https://studevent-server.vercel.app/api/forms/my-organization", {
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
    

    return (
        <div className="org-forms-container">
            <h2>My Submitted Forms</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error-message">Error: {error}</p>
            ) : forms.length === 0 ? (
                <p>No submitted forms found.</p>
            ) : (
                <ul>
                    {forms.map((form) => (
                        <li key={form._id} className="form-item">
                            <h4>{form.eventTitle}</h4>
                            <p>Status: <strong>{form.finalStatus || "Pending"}</strong></p>
                            <p>Submitted on: {form.applicationDate ? new Date(form.applicationDate).toLocaleDateString() : "No Date"}</p>
                            <button onClick={() => navigate(`/formdetails/${form._id}`)}>View Details</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OrgSubmittedForms;
