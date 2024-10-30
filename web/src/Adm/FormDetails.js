import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FormDetails = () => {
  const { formId } = useParams(); // Assuming the route includes a formId parameter
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Form ID:", formId);
    const fetchFormData = async () => {
      if (formId) {
        try {
          const response = await axios.get(`/api/forms/${formId}`);
          setFormData(response.data);
        } catch (err) {
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
    <div>
      <h1>Form Details</h1>
      {formData ? (
        <div>
          <h2>Event Title: {formData.eventTitle}</h2>
          <p>Application Date: {new Date(formData.applicationDate).toLocaleDateString()}</p>
          <p>Event Location: {formData.eventLocation}</p>
          <p>Contact Person: {formData.contactPerson}</p>
          <p>Contact Number: {formData.contactNo}</p>
          <p>Email Address: {formData.emailAddress}</p>
          <p>Event Type: {formData.eventType}</p>
          <p>Venue Address: {formData.venueAddress}</p>
          <p>Event Start Date: {new Date(formData.eventStartDate).toLocaleDateString()}</p>
          <p>Event End Date: {new Date(formData.eventEndDate).toLocaleDateString()}</p>
          <p>Organizer: {formData.organizer}</p>
          <p>Budget Amount: {formData.budgetAmount}</p>
          <p>Budget From: {formData.budgetFrom}</p>
          <p>Core Values Integration: {formData.coreValuesIntegration}</p>
          <p>Objectives: {formData.objectives}</p>
          <p>Marketing Collaterals: {formData.marketingCollaterals}</p>
          <p>Press Release: {formData.pressRelease}</p>
          <p>Other Information: {formData.others}</p>
          {/* Additional fields */}
          <p>Event Facilities: {formData.eventFacilities}</p>
          <p>Holding Area: {formData.holdingArea}</p>
          <p>Toilets: {formData.toilets}</p>
          <p>Transportation and Parking: {formData.transportationandParking}</p>
          <p>More Details: {formData.more}</p>
          <p>Licenses Required: {formData.licensesRequired}</p>
          <p>House Keeping: {formData.houseKeeping}</p>
          <p>Waste Management: {formData.wasteManagement}</p>
          <p>Event Management Head: {formData.eventManagementHead}</p>
          <p>Event Committees and Members: {formData.eventCommitteesandMembers}</p>
          <p>Health: {formData.health}</p>
          <p>Safety of Attendees: {formData.safetyAttendees}</p>
          <p>Emergency First Aid: {formData.emergencyFirstAid}</p>
          <p>Fire Safety: {formData.fireSafety}</p>
          <p>Weather Considerations: {formData.weather}</p>
        </div>
      ) : (
        <p>No data found for this form.</p>
      )}
    </div>
  );
};

export default FormDetails;
