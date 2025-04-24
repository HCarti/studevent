import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './EventTrackerList.css';

const EventTrackerList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [organizations, setOrganizations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token is missing! Please log in again.");
          setLoading(false);
          return;
        }

        // First fetch all organizations to map emails to organization names
        const orgsResponse = await fetch("https://studevent-server.vercel.app/api/users/organizations", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (orgsResponse.ok) {
          const orgsData = await orgsResponse.json();
          const orgsMap = {};
          orgsData.forEach(org => {
            orgsMap[org.email] = org.organizationName;
          });
          setOrganizations(orgsMap);
        }

        // Then fetch forms as before
        const formsResponse = await fetch("https://studevent-server.vercel.app/api/forms/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!formsResponse.ok) {
          const errorText = await formsResponse.text();
          throw new Error(`HTTP error! Status: ${formsResponse.status}, Message: ${errorText}`);
        }

        const formsData = await formsResponse.json();
        if (!Array.isArray(formsData)) {
          throw new Error("Unexpected data format from server.");
        }

        const formsWithCurrentStep = await Promise.all(
          formsData.map(async (form) => {
            const trackerResponse = await fetch(
              `https://studevent-server.vercel.app/api/tracker/${form._id}`,
              {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!trackerResponse.ok) {
              console.error(`Error fetching tracker data for form ${form._id}`);
              return { ...form, currentStep: "N/A" };
            }

            const trackerData = await trackerResponse.json();
            return { ...form, currentStep: trackerData.currentStep || "N/A" };
          })
        );

        setForms(formsWithCurrentStep);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRedirectToProgressTracker = (form) => {
    navigate(`/progtrack/${form._id}`, { state: { form } });
  };

  const getFilteredForms = () => {
    return forms.filter((form) => {
      const status = form.finalStatus || form.status || '';
      const normalizedStatus = status.trim().toLowerCase();
      
      switch (filter) {
        case "pending": return normalizedStatus === "pending";
        case "approved": return normalizedStatus === "approved";
        case "declined": return normalizedStatus === "declined";
        default: return true;
      }
    });
  };

  const handleFilterClick = (filterType) => {
    setFilter(filterType);
  };

  // Helper function to get organization name
  const getOrganizationName = (form) => {
    if (form.formType === 'Budget') return form.nameOfRso;
    if (form.formType === 'Project') return organizations[form.emailAddress] || 'Unknown Organization';
    return form.studentOrganization?.organizationName || organizations[form.emailAddress] || 'Unknown Organization';
  };

  // Helper function to get event/project title
  const getEventTitle = (form) => {
    if (form.formType === 'Project') return form.projectTitle;
    return form.eventTitle;
  };

  return (
    <div className="event-tracker-container">
      <h2>Event Form Tracker</h2>
      {error && <p className="event-tracker-error">{error}</p>}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="event-tracker-filters">
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => handleFilterClick("all")}
            >
              All Events
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

          <div className="event-tracker-table-wrapper">
            <table className="event-tracker-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Form Type</th>
                  <th>Event Title</th>
                  <th>Status</th>
                  <th>Application Date</th>
                  <th>Current Step</th>
                </tr>
              </thead>
              <tbody>
          {getFilteredForms().map((form) => (
            <tr
              key={form._id}
              className={`event-tracker-row ${form.finalStatus?.trim().toLowerCase()}`}
              onClick={() => handleRedirectToProgressTracker(form)}
            >
              <td>{getOrganizationName(form)}</td>
              <td>{form.formType}</td>
              <td>{getEventTitle(form)}</td>
              <td>
                <span className={`status-badge ${form.finalStatus?.trim().toLowerCase()}`}>
                  {form.finalStatus || "No Status"}
                </span>
              </td>
              <td>{form.applicationDate ? new Date(form.applicationDate).toLocaleDateString() : "No Date"}</td>
              <td>{form.currentStep}</td>
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