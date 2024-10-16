import React, { useEffect, useState } from "react";
import './AdminFormView.css';

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
    <div className="admin-form-view">
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

          {/* Read-only form with inputs */}
          <form>
            <label>Event Location:</label>
            <input type="text" value={selectedForm.eventLocation} readOnly />

            <label>Date Of Application:</label>
            <input type="text" value={selectedForm.applicationDate} readOnly />

            <label>Student Organization:</label>
            <input type="text" value={selectedForm.studentOrganization} readOnly />

            <label>Contact Person:</label>
            <input type="text" value={selectedForm.contactPerson} readOnly />

            <label>Contact No:</label>
            <input type="text" value={selectedForm.contactNo} readOnly />

            <label>Email Address:</label>
            <input type="text" value={selectedForm.emailAddress} readOnly />

            <label>Event Title:</label>
            <input type="text" value={selectedForm.eventTitle} readOnly />

            <label>Type of Event:</label>
            <input type="text" value={selectedForm.eventType} readOnly />

            <label>Venue Address:</label>
            <input type="text" value={selectedForm.venueAddress} readOnly />

            <label>Event Date:</label>
            <input type="text" value={selectedForm.eventDate} readOnly />

            <label>Event Time:</label>
            <input type="text" value={selectedForm.objectives} readOnly />

            <label>Organizer:</label>
            <input type="text" value={selectedForm.organizer} readOnly />

            <label>Event Budget Amount:</label>
            <input type="text" value={selectedForm.budgetAmount} readOnly />

            <label>Event Budget From:</label>
            <input type="text" value={selectedForm.budgetFrom} readOnly />

            <label>Core Values Integration:</label>
            <input type="text" value={selectedForm.coreValuesIntegration} readOnly />

            <label>Objectives:</label>
            <input type="text" value={selectedForm.objectives} readOnly />

            {/* Add more fields as necessary in the same format */}
            <label>Marketing Collaterals:</label>
            <input type="text" value={selectedForm.marketingCollaterals} readOnly />

            <label>Press Release:</label>
            <input type="text" value={selectedForm.pressRelease} readOnly />

            <label>Others:</label>
            <input type="text" value={selectedForm.others} readOnly />

            <label>Event Facilities:</label>
            <input type="text" value={selectedForm.eventFacilities} readOnly />

            <label>Holding Area:</label>
            <input type="text" value={selectedForm.holdingArea} readOnly />

            <label>Toilets:</label>
            <input type="text" value={selectedForm.toilets} readOnly />

            <label>Transportation & Parking:</label>
            <input type="text" value={selectedForm.transportationandParking} readOnly />

            <label>Licenses Required:</label>
            <input type="text" value={selectedForm.licensesRequired} readOnly />

            <label>Housekeeping:</label>
            <input type="text" value={selectedForm.houseKeeping} readOnly />

            <label>Waste Management:</label>
            <input type="text" value={selectedForm.wasteMangement} readOnly />

            <label>Event Management Head:</label>
            <input type="text" value={selectedForm.eventManagementHead} readOnly />

            <label>Event Committees & Members:</label>
            <input type="text" value={selectedForm.eventCommitteesandMembers} readOnly />

            <label>Health:</label>
            <input type="text" value={selectedForm.health} readOnly />

            <label>Safety Of Attendees:</label>
            <input type="text" value={selectedForm.safetyAttendees} readOnly />

            <label>Emergency/First Aid:</label>
            <input type="text" value={selectedForm.emergencyFirstAid} readOnly />

            <label>Fire Safety:</label>
            <input type="text" value={selectedForm.fireSafety} readOnly />

            <label>Weather:</label>
            <input type="text" value={selectedForm.weather} readOnly />
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminFormView;
