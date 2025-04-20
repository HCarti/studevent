import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './OrganizationEvents.css';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

const localizer = momentLocalizer(moment);

const OrganizationEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get auth token and user info
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    
    if (!token || !parsedUser) {
      return null;
    }

    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch calendar events from backend
  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authHeaders = getAuthHeaders();
      if (!authHeaders) return;

      // Get current month's start and end dates for range query
      const startOfMonth = moment().startOf('month').toISOString();
      const endOfMonth = moment().endOf('month').toISOString();
      
      const response = await axios.get(
        'https://studevent-server.vercel.app/api/calendar/events/range', 
        {
          params: { start: startOfMonth, end: endOfMonth },
          ...authHeaders
        }
      );
      
      const formattedEvents = response.data.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        rawStart: event.startDate,        // Store original UTC string
        rawEnd: event.endDate, 
        description: event.description,
        location: event.location,
        organization: event.organization?.organizationName || 'N/A',
        type: event.formType,
        duration: calculateDuration(event.startDate, event.endDate),
        allDay: true
      }));
      
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load calendar events. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch events for specific month
  const fetchCalendarEventsForMonth = async (date) => {
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders) return;

      const startOfMonth = moment(date).startOf('month').toISOString();
      const endOfMonth = moment(date).endOf('month').toISOString();
      
      const response = await axios.get(
        'https://studevent-server.vercel.app/api/calendar/events/range', 
        {
          params: { start: startOfMonth, end: endOfMonth },
          ...authHeaders
        }
      );
      
      const formattedEvents = response.data.map(event => ({
        id: event._id,
        title: event.formType === 'Project' ? event.projectTitle : event.eventTitle || event.title,
        start: moment.utc(event.startDate).local().toDate(), // Convert UTC to local time
        end: moment.utc(event.endDate).local().toDate(),     // Convert UTC to local time
        description: event.formType === 'Project' ? event.projectDescription : event.description,
        location: event.location || 'TBA',
        organization: event.organization?.organizationName || 'N/A',
        type: event.formType,
        duration: calculateDuration(event.startDate, event.endDate),
        allDay: true,
        rawStart: event.startDate, // Keep original for reference
        rawEnd: event.endDate,      // Keep original for reference
        // Additional fields for display
        projectTitle: event.projectTitle,
        eventTitle: event.eventTitle,
        formType: event.formType
      }));
      
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load calendar events for this month.');
      }
    }
  };

  // Calculate event duration
// Make duration calculation timezone-aware
const calculateDuration = (start, end) => {
  const startDate = moment.utc(start).local();
  const endDate = moment.utc(end).local();
  const duration = endDate.diff(startDate, 'days') + 1;
  return duration === 1 ? '1 day' : `${duration} days`;
};

  // Handle month change to fetch new events
  const handleNavigate = (newDate) => {
    setSelectedDate(newDate);
    fetchCalendarEventsForMonth(newDate);
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  // Handle date selection
  const handleSelectSlot = (slotInfo) => {
    const clickedDate = slotInfo.start;
    setSelectedDate(clickedDate);
    
    // Convert clicked date to UTC midnight for accurate comparison
    const clickedDateUTC = moment(clickedDate).utc().startOf('day');
    
    const filteredEvents = events.filter(event => {
      // Get UTC dates from the original event data (not the converted display dates)
      const eventStartUTC = moment.utc(event.rawStart).startOf('day');
      const eventEndUTC = moment.utc(event.rawEnd).startOf('day');
      
      // Check if clicked date falls within event range
      return clickedDateUTC.isBetween(eventStartUTC, eventEndUTC, null, '[]') || 
             clickedDateUTC.isSame(eventStartUTC) || 
             clickedDateUTC.isSame(eventEndUTC);
    });
  
    setSelectedEvents(filteredEvents);
    
    // Debug output
    console.log('Date Selection Debug:', {
      clickedLocal: clickedDate,
      clickedUTC: clickedDateUTC.format(),
      matchedEvents: filteredEvents.map(e => ({
        title: e.title,
        localStart: moment(e.start).format(),
        localEnd: moment(e.end).format(),
        utcStart: e.rawStart,
        utcEnd: e.rawEnd
      }))
    });
  };
  // Custom event style based on type
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // Default blue
    
    if (event.type === 'Activity') {
      backgroundColor = '#5cb85c'; // Green
    } else if (event.type === 'Project') {
      backgroundColor = '#f0ad4e'; // Orange
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Custom event component
  const EventComponent = ({ event }) => (
    <div className="rbc-event-content">
      <strong>{event.title}</strong>
      <div className="event-meta">
        <span className="event-type-badge">{event.type}</span>
        {event.duration !== '1 day' && <span>{event.duration}</span>}
      </div>
    </div>
  );


  return (
    <div className="wrap">
      <h1>EVENT CALENDAR</h1>
      
        {loading && (
        <div className="loader-overlay">
          <div className="loader-container">
            <ClipLoader color="#1a3ab5" size={50} />
            <p>Loading calendar events...</p>
          </div>
        </div>
      )}
      {error && !error.includes('Session expired') && <div className="error-message">{error}</div>}

      <div className="calendar-container">
        <div className="calendar-wrapper">
          <div className="calendar-header">
            <span className="month-title">
              {moment(selectedDate).format('MMMM YYYY')}
            </span>
          </div>
          <div style={{ height: 500 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={['month']}
              style={{ height: '100%' }}
              selectable
              onSelectSlot={handleSelectSlot}
              onNavigate={handleNavigate}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent
              }}
            />
          </div>
        </div>

        <div className="event-details">
          <h2> {moment(selectedDate).format('dddd, MMMM D, YYYY')} - Event Details</h2>
          {selectedEvents.length > 0 ? (
            <ul className="event-list">
              {selectedEvents.map((event, index) => (
                <li key={index} className={`event-item ${event.type.toLowerCase()}`}>
                <h3>
                  {event.type === 'Project' ? (
                    <>Project: <span className="event-title">{event.projectTitle}</span></>
                  ) : (
                    <>Activity: <span className="event-title">{event.eventTitle}</span></>
                  )}
                </h3>
                <p><strong>Type:</strong> {event.type}</p>
                <p><strong>Organization:</strong> {event.organization}</p>
                <p><strong>Duration:</strong> {event.duration}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Description:</strong> {event.description}</p>
              </li>
              ))}
            </ul>
          ) : (
            <p className="no-events">No events scheduled for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationEvents;