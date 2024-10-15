import React, { useEffect, useState } from "react";

const AdminFormView = () => {
  const [submittedForms, setSubmittedForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);

  // Fetch the submitted forms when the component loads
  useEffect(() => {
    const fetchSubmittedForms = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/forms/submitted");
        const data = await response.json();
        setSubmittedForms(data);
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };
    fetchSubmittedForms();
  }, []);

  const handleFormSelect = (form) => {
    setSelectedForm(form);
  };

  return (
    <div className="admin-view">
      <h1>Submitted Forms</h1>
      
      <div className="form-list">
        <h2>Forms List</h2>
        {submittedForms.length === 0 ? (
          <p>No forms have been submitted yet.</p>
        ) : (
          <ul>
  {submittedForms.map((form, index) => (
    <li key={index} style={{ listStyleType: 'none' }}>
      <button
        onClick={() => handleFormSelect(form)}
        style={{ 
          padding: '10px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'block', 
          width: '50%', 
          marginBottom: '10px',
          textAlign: 'left'
        }}
      >
        {form.studentOrganization} - {form.eventTitle} ({form.applicationDate})
      </button>
    </li>
  ))}
</ul>

        )}
      </div>

      {selectedForm && (
        <div className="form-details">
          <h2>Form Details</h2>
          <p><strong>Student Organization:</strong> {selectedForm.studentOrganization}</p>
          <p><strong>Contact Person:</strong> {selectedForm.contactPerson}</p>
          <p><strong>Contact No:</strong> {selectedForm.contactNo}</p>
          <p><strong>Email Address:</strong> {selectedForm.emailAddress}</p>
          <p><strong>Event Title:</strong> {selectedForm.eventTitle}</p>
          <p><strong>Event Date:</strong> {selectedForm.eventDate}</p>
          <p><strong>Event Location:</strong> {selectedForm.eventLocation}</p>
          <p><strong>Type of Event:</strong> {selectedForm.eventType}</p>
          <p><strong>Venue Address:</strong> {selectedForm.venueAddress}</p>
          <p><strong>Event Date:</strong> {selectedForm.eventDate}</p>
          <p><strong>Event Time:</strong> {selectedForm.objectives}</p>
          <p><strong>Organizer:</strong> {selectedForm.orgnanizer}</p>
          <p><strong>Event Budget Amount:</strong> {selectedForm.budgetAmount}</p>
          <p><strong>Event Budget From:</strong> {selectedForm.budgetFrom}</p>
          <p><strong>Core Values Integration:</strong> {selectedForm.coreValuesIntegration}</p>
          <p><strong>Objectives:</strong> {selectedForm.objectives}</p>
          <p><strong>Marketing Collaterals:</strong> {selectedForm.objectives}</p>
          <p><strong>Press Release:</strong> {selectedForm.objectives}</p>
          <p><strong>Others:</strong> {selectedForm.objectives}</p>
          <p><strong>Event Facilities:</strong> {selectedForm.objectives}</p>
          <p><strong>Holding Area:</strong> {selectedForm.objectives}</p>
          <p><strong>Toilets:</strong> {selectedForm.objectives}</p>
          <p><strong>Transportation & Parking:</strong> {selectedForm.objectives}</p>
          <p><strong>Others:</strong> {selectedForm.objectives}</p>
          <p><strong>Licences Required:</strong> {selectedForm.objectives}</p>
          <p><strong>HouseKeeping:</strong> {selectedForm.objectives}</p>
          <p><strong>Waste Management:</strong> {selectedForm.objectives}</p>
          <p><strong>Event Management Head:</strong> {selectedForm.objectives}</p>
          <p><strong>Event Committees & Members:</strong> {selectedForm.objectives}</p>
          <p><strong>Health:</strong> {selectedForm.objectives}</p>
          <p><strong>Safety Of Attendees:</strong> {selectedForm.objectives}</p>
          <p><strong>Emergency/ First Aid:</strong> {selectedForm.objectives}</p>
          <p><strong>Fire Safety:</strong> {selectedForm.objectives}</p>
          <p><strong>Weather:</strong> {selectedForm.objectives}</p>
          {/* Add more fields as necessary */}
        </div>
      )}
    </div>
  );
};

export default AdminFormView;
