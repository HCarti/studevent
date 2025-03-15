import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OrgSubmittedForms = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Retrieve organizationId from localStorage
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const _id = parsedUser?.studentOrganization; // Use studentOrganization, not _id

    useEffect(() => {
        if (!_id) {
            setLoading(false);
            return;
        }

        const fetchForms = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`https://studevent-server.vercel.app/api/forms/organization/${_id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error("Error fetching forms");

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
    }, [_id]);

    return (
        <div className="org-forms-container">
            <h2>My Submitted Forms</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : forms.length === 0 ? (
                <p>No submitted forms found.</p>
            ) : (
                <ul>
                    {forms.map((form) => (
                        <li key={form._id} className="form-item">
                            <h4>{form.title}</h4>
                            <p>Status: <strong>{form.status}</strong></p>
                            <p>Submitted on: {new Date(form.submissionDate).toLocaleDateString()}</p>
                            <button onClick={() => navigate(`/formdetails/${form._id}`)}>View Details</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OrgSubmittedForms;
