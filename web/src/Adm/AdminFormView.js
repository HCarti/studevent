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
                  className="admin-button"
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
          <form classname="">
            <label className="admin-label">Event Location:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.eventLocation} readOnly />

            <label className="admin-label">Date Of Application:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.applicationDate} readOnly />

            <label className="admin-label">Student Organization:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.studentOrganization} readOnly />

            <label className="admin-label">Contact Person:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.contactPerson} readOnly />

            <label className="admin-label">Contact No:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.contactNo} readOnly />

            <label className="admin-label">Email Address:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.emailAddress} readOnly />

            <label className="admin-label">Event Title:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.eventTitle} readOnly />

            <label className="admin-label">Type of Event:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.eventType} readOnly />

            <label className="admin-label">Venue Address:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.venueAddress} readOnly />

            <label className="admin-label">Event Date:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.eventDate} readOnly />

            <label className="admin-label">Event Time:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.objectives} readOnly />

            <label className="admin-label">Organizer:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.organizer} readOnly />

            <label className="admin-label">Event Budget Amount:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.budgetAmount} readOnly />

            <label className="admin-label">Event Budget From:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.budgetFrom} readOnly />

            <label className="admin-label">Core Values Integration:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.coreValuesIntegration} readOnly />

            <label className="admin-label">Objectives:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.objectives} readOnly />

            {/* Add more fields as necessary in the same format */}
            <label className="admin-label">Marketing Collaterals:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.marketingCollaterals} readOnly />

            <label className="admin-label">Press Release:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.pressRelease} readOnly />

            <label className="admin-label">Others:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.others} readOnly />

            <label className="admin-label">Event Facilities:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.eventFacilities} readOnly />

            <label className="admin-label">Holding Area:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.holdingArea} readOnly />

            <label className="admin-label">Toilets:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.toilets} readOnly />

            <label className="admin-label">Transportation & Parking:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.transportationandParking} readOnly />

            <label className="admin-label">Licenses Required:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.licensesRequired} readOnly />

            <label className="admin-label">Housekeeping:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.houseKeeping} readOnly />

            <label className="admin-label">Waste Management:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.wasteMangement} readOnly />

            <label className="admin-label">Event Management Head:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.eventManagementHead} readOnly />

            <label className="admin-label">Event Committees & Members:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.eventCommitteesandMembers} readOnly />

            <label className="admin-label">Health:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.health} readOnly />

            <label className="admin-label">Safety Of Attendees:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.safetyAttendees} readOnly />

            <label className="admin-label">Emergency/First Aid:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.emergencyFirstAid} readOnly />

            <label className="admin-label">Fire Safety:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.fireSafety} readOnly />

            <label className="admin-label">Weather:</label>
            <input className="inputtypeadmin" type="text" value={selectedForm.weather} readOnly />
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminFormView;
