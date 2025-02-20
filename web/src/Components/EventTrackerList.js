import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventTrackerList.css';

const EventTrackerList = ({ currentUser }) => {
  const [eventForms, setEventForms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventForms = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. Please log in.");
          return;
        }
  
        const response = await fetch('https://studevent-server.vercel.app/api/tracker', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
  
        console.log("Raw response:", response);
  
        if (!response.ok) {
          console.error(`Error ${response.status}:`, await response.text()); // Log raw response
          return;
        }
  
        const data = await response.json();
        setEventForms(data);
      } catch (error) {
        console.error("Error fetching event forms:", error);
      }
    };
  
    fetchEventForms();
  }, []);
  
  

  const handleViewProgress = (form) => {
    navigate('/progress-tracker', { state: { form } });
  };

  return (
    <div className="event-tracker-list">
      <h2>Event Proposal List</h2>

      <div className="event-tracker-sections">
        <div className="event-section">
          <h3>Pending</h3>
          {eventForms.filter(f => f.status === 'pending').map(form => (
            <div key={form._id} className="event-item">
              <p>{form.title}</p>
              <button onClick={() => handleViewProgress(form)}>Review</button>
            </div>
          ))}
        </div>

        <div className="event-section">
          <h3>Approved</h3>
          {eventForms.filter(f => f.status === 'approved').map(form => (
            <div key={form._id} className="event-item approved">
              <p>{form.title}</p>
            </div>
          ))}
        </div>

        <div className="event-section">
          <h3>Declined</h3>
          {eventForms.filter(f => f.status === 'declined').map(form => (
            <div key={form._id} className="event-item declined">
              <p>{form.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventTrackerList;
