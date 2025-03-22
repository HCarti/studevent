import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './EventTrackerList.css';

const EventTrackerList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize as true
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token is missing! Please log in again.");
          setLoading(false); // Stop loading
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
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
  
        const data = await response.json();
        if (Array.isArray(data)) {
          setForms([...data]);
        } else {
          setError("Unexpected data format from server.");
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
        setError(error.message);
      } finally {
        setLoading(false); // Stop loading whether successful or not
      }
    };
  
    fetchForms();
  }, []);

  const handleRedirectToProgressTracker = (form) => {
    navigate(`/progtrack/${form._id}`, { state: { form } });
  };

  return (
    <div className="event-tracker-container">
  <h2>Event Form Tracker</h2>
  {error && <p className="event-tracker-error">{error}</p>}

  {/* Loading Spinner */}
  {loading && (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading events...</p>
    </div>
  )}

  {/* Filters and Table */}
  {!loading && (
    <>
      <div className="event-tracker-filters">
        <button className="filter-button active">All Events</button>
        <button className="filter-button">Pending</button>
        <button className="filter-button">Approved</button>
        <button className="filter-button">Rejected</button>
      </div>

      <div className="event-tracker-table-wrapper">
        <table className="event-tracker-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Event Title</th>
              <th>Status</th>
              <th>Application Date</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr
                key={form._id}
                className={`event-tracker-row ${form.finalStatus?.trim().toLowerCase()}`}
                onClick={() => handleRedirectToProgressTracker(form)}
              >
                <td>{form.studentOrganization?.organizationName || 'Unknown Organization'}</td>
                <td>{form.eventTitle}</td>
                <td>
                  <span className={`status-badge ${form.finalStatus?.trim().toLowerCase()}`}>
                    {form.finalStatus || "No Status"}
                  </span>
                </td>
                <td>{form.applicationDate ? new Date(form.applicationDate).toLocaleDateString() : "No Date"}</td>
                <td>Today</td>  
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>
  );
};

export default EventTrackerList;