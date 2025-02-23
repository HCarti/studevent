import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './EventTrackerList.css';

const EventTrackerList = () => {
  const [forms, setForms] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Retrieved Token:", token); // Debugging

        if (!token) {
          setError("Authentication token is missing! Please log in again.");
          return;
        }

        const response = await fetch("https://studevent-server.vercel.app/api/forms/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("HTTP Error Response:", response.status, errorText);
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched Forms:", data); // Debugging log

        if (Array.isArray(data)) {
          setForms(data);
        } else {
          console.error("Expected an array but received:", data);
          setError("Unexpected data format from server.");
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
        setError(error.message);
      }
    };

    fetchForms();
  }, []);

  const handleRedirectToProgressTracker = (form) => {
    navigate(`/progtrack/${form._id}`, { state: { form } });
  };

  // Ensure status is properly checked
  const pendingForms = forms.filter(form => form.status?.trim().toLowerCase() === "pending");
  const approvedForms = forms.filter(form => form.status?.trim().toLowerCase() === "approved");
  const rejectedForms = forms.filter(form => form.status?.trim().toLowerCase() === "rejected");

  return (
    <div className="admin-form-view">
      <h2>Event Form Tracker</h2>
      {error && <p className="error-message">{error}</p>}

      {/* Section: Pending Forms */}
      <div className="form-section">
        <h3>Pending Forms</h3>
        {pendingForms.length === 0 ? <p>No pending forms.</p> : (
          <ul>
            {pendingForms.map((form) => (
              <li key={form._id} style={{ listStyleType: 'none' }}>
                <button
                  className="admin-button"
                  onClick={() => handleRedirectToProgressTracker(form)}
                >
                  {form.studentOrganization?.organizationName || 'Unknown Organization'}
                  - {form.eventTitle} ({form.status || "No Status"}) - 
                  ({form.applicationDate ? new Date(form.applicationDate).toLocaleDateString() : "No Date"})
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Section: Approved Forms */}
      <div className="form-section">
        <h3>Approved Forms</h3>
        {approvedForms.length === 0 ? <p>No approved forms.</p> : (
          <ul>
            {approvedForms.map((form) => (
              <li key={form._id} style={{ listStyleType: 'none' }}>
                <button
                  className="admin-button approved"
                  onClick={() => handleRedirectToProgressTracker(form)}
                >
                  {form.studentOrganization?.organizationName || 'Unknown Organization'}
                  - {form.eventTitle} ({form.applicationDate ? new Date(form.applicationDate).toLocaleDateString() : "No Date"})
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Section: Rejected Forms */}
      <div className="form-section">
        <h3>Rejected Forms</h3>
        {rejectedForms.length === 0 ? <p>No rejected forms.</p> : (
          <ul>
            {rejectedForms.map((form) => (
              <li key={form._id} style={{ listStyleType: 'none' }}>
                <button
                  className="admin-button rejected"
                  onClick={() => handleRedirectToProgressTracker(form)}
                >
                  {form.studentOrganization?.organizationName || 'Unknown Organization'}
                  - {form.eventTitle} ({form.applicationDate ? new Date(form.applicationDate).toLocaleDateString() : "No Date"})
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventTrackerList;
