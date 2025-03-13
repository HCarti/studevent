import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './FormDetails.css';

const   FormDetails = () => {
  const { formId } = useParams(); // Assuming the route includes a formId parameter
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Fetching form with ID:", formId);


  useEffect(() => {
    const fetchFormData = async () => {
      if (formId) {
        try {
          const token = localStorage.getItem('token'); // Retrieve token from localStorage
    
          const response = await axios.get(
            `https://studevent-server.vercel.app/api/forms/${formId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Send token in the request
              },
            }
          );
    
          setFormData(response.data);
        } catch (err) {
          console.error(err);
          setError('Failed to load form data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFormData();
  }, [formId]);

  if (loading) return <p>Loading form details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="form-details-container">
      <h1>Form Details</h1>
      {formData ? (
        <div>
          <h2>Event Title: {formData.eventTitle || 'Not specified'}</h2>

          <label>Event Title:</label>
          <input type="text" value={formData.eventTitle || 'Not specified'} readOnly />
          
          <label>Application Date:</label>
          <input type="text" value={new Date(formData.applicationDate).toLocaleDateString()} readOnly />
          
          <label>Event Location:</label>
          <input type="text" value={formData.eventLocation} readOnly />
          
          <label>Contact Person:</label>
          <input type="text" value={formData.contactPerson} readOnly />
          
          <label>Contact Number:</label>
          <input type="text" value={formData.contactNo} readOnly />
          
          <label>Email Address:</label>
          <input type="text" value={formData.emailAddress} readOnly />
          
          <label>Event Type:</label>
          <input type="text" value={formData.eventType || 'Not specified'} readOnly />
          
          <label>Venue Address:</label>
          <input type="text" value={formData.venueAddress} readOnly />
          
          <label>Event Start Date:</label>
          <input type="text" value={new Date(formData.eventStartDate).toLocaleDateString()} readOnly />
          
          <label>Event End Date:</label>
          <input type="text" value={new Date(formData.eventEndDate).toLocaleDateString()} readOnly />
          
          <label>Organizer:</label>
          <input type="text" value={formData.organizer} readOnly />
          
          <label>Budget Amount:</label>
          <input type="text" value={formData.budgetAmount} readOnly />
          
          <label>Budget From:</label>
          <input type="text" value={formData.budgetFrom} readOnly />
          
          <label>Core Values Integration:</label>
          <input type="text" value={formData.coreValuesIntegration} readOnly />
          
          <label>Objectives:</label>
          <input type="text" value={formData.objectives} readOnly />
          
          <label>Marketing Collaterals:</label>
          <input type="text" value={formData.marketingCollaterals} readOnly />
          
          <label>Press Release:</label>
          <input type="text" value={formData.pressRelease} readOnly />
          
          <label>Other Information:</label>
          <input type="text" value={formData.others} readOnly />
          
          {/* Additional fields */}
          <label>Event Facilities:</label>
          <input type="text" value={formData.eventFacilities} readOnly />
          
          <label>Holding Area:</label>
          <input type="text" value={formData.holdingArea} readOnly />
          
          <label>Toilets:</label>
          <input type="text" value={formData.toilets} readOnly />
          
          <label>Transportation and Parking:</label>
          <input type="text" value={formData.transportationandParking} readOnly />
          
          <label>More Details:</label>
          <input type="text" value={formData.more} readOnly />
          
          <label>Licenses Required:</label>
          <input type="text" value={formData.licensesRequired} readOnly />
          
          <label>House Keeping:</label>
          <input type="text" value={formData.houseKeeping} readOnly />
          
          <label>Waste Management:</label>
          <input type="text" value={formData.wasteManagement} readOnly />
          
          <label>Event Management Head:</label>
          <input type="text" value={formData.eventManagementHead} readOnly />
          
          <label>Event Committees and Members:</label>
          <input type="text" value={formData.eventCommitteesandMembers} readOnly />
          
          <label>Health:</label>
          <input type="text" value={formData.health} readOnly />
          
          <label>Safety of Attendees:</label>
          <input type="text" value={formData.safetyAttendees} readOnly />
          
          <label>Emergency First Aid:</label>
          <input type="text" value={formData.emergencyFirstAid} readOnly />
          
          <label>Fire Safety:</label>
          <input type="text" value={formData.fireSafety} readOnly />
          
          <label>Weather Considerations:</label>
          <input type="text" value={formData.weather} readOnly />
        </div>
      ) : (
        <p>No data found for this form.</p>
      )}
    </div>
  );
};

export default FormDetails;
