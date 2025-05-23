import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './EventTrackerList.css';

const EventTrackerList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view events");
          setLoading(false);
          return;
        }

        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData) throw new Error("User data not found");
        
        setUserRole(userData.role);

        const response = await fetch("https://studevent-server.vercel.app/api/forms/all", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to load events: ${response.status}`);
        
        let formsData = await response.json();
        
        if (!Array.isArray(formsData)) throw new Error("Invalid data format");

        // Verify and enhance form data with tracker info
        formsData = formsData.map(form => ({
          ...form,
          currentStep: form.currentStep || "N/A",
          currentAuthority: form.currentAuthority || "N/A",
          // Add additional tracker data if needed
          trackerSteps: form.trackerData || []
        }));

        setForms(formsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const handleViewDetails = (form) => {
    navigate(`/progtrack/${form._id}`, { 
      state: { 
        form,
        // Pass additional tracker info to details page
        currentStep: form.currentStep,
        currentAuthority: form.currentAuthority,
        trackerSteps: form.trackerSteps
      } 
    });
  };

  const getFilteredForms = () => {
    const status = (form) => (form.finalStatus || "").trim().toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return forms.filter(form => {
      const matchesFilter = filter === "all" || status(form) === filter;
      const matchesSearch = searchQuery === "" || 
        getEventTitle(form).toLowerCase().includes(searchLower) ||
        getOrganizationName(form).toLowerCase().includes(searchLower) ||
        form.formType.toLowerCase().includes(searchLower);
      
      return matchesFilter && matchesSearch;
    });
  };

  const getOrganizationName = (form) => {
    if (form.formType === 'LocalOffCampus') return form.nameOfHei || form.organizationName || 'Local Event';
    if (form.formType === 'Budget') return form.nameOfRso;
    if (form.formType === 'Project') {
      return form.studentOrganization?.organizationName || 
             form.emailAddress || 
             'Unknown Project';
    }
    return form.studentOrganization?.organizationName || 
           form.emailAddress || 
           'Unknown Organization';
  };

    const getCurrentStepDisplay = (form) => {
    if (userRole === 'Admin') {
      return `Current Step: ${form.currentStep}`;
    }
    return `Current Step: ${form.currentStep}`;
  };

  const getEventTitle = (form) => {
    if (form.formType === 'LocalOffCampus') return `Local Event (${form.formPhase})`;
    if (form.formType === 'Project') return form.projectTitle;
    return form.eventTitle || 'Untitled Event';
  };

  const getStatusVariant = (status) => {
    switch ((status || "").trim().toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'declined': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="modern-event-tracker">
      <header className="tracker-header">
        <div className="header-content">
          <h1>Event Dashboard</h1>
          <p className="subtitle">Track and manage all your events</p>
        </div>
      </header>

      <main className="tracker-content">
        {error && (
          <div className="alert-message error">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5"></circle>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="1.5"></line>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="1.5"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your events...</p>
          </div>
        ) : (
          <div className="tracker-body">
            <div className="controls-section">
              <div className="controls-row">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="filter-buttons-container">
                <div className="filter-buttons-scroll">
                  {["all", "pending", "approved", "declined"].map((filterType) => (
                    <button
                      key={filterType}
                      className={`filter-btn ${filter === filterType ? 'active' : ''}`}
                      onClick={() => setFilter(filterType)}
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="results-count">
                <span className="count">{getFilteredForms().length}</span>
                <span>events found</span>
              </div>
            </div>

             <div className="events-container">
              {getFilteredForms().length > 0 ? (
                getFilteredForms().map((form) => (
                  <div 
                    key={form._id} 
                    className="event-card"
                    onClick={() => handleViewDetails(form)}
                  >
                    <div className="card-top">
                      <div className="event-info">
                        <h3 className="event-title">{getEventTitle(form)}</h3>
                        <span className={`status-badge ${getStatusVariant(form.finalStatus)}`}>
                          {form.finalStatus || "No Status"}
                        </span>
                      </div>
                      <span className="organization">{getOrganizationName(form)}</span>
                    </div>
                    
                    <div className="card-middle">
                      <div className="info-item">
                        <span className="label">Type</span>
                        <span className="value">{form.formType}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Date</span>
                        <span className="value">
                          {form.applicationDate ? 
                            new Date(form.applicationDate).toLocaleDateString() : 
                            'Not specified'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-bottom">
                      <span className="progress">
                        {getCurrentStepDisplay(form)}
                      </span>
                      <button className="view-btn">
                        View Details
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3>No events matching your criteria</h3>
                  <p>Try adjusting your filters or create a new event</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EventTrackerList;  