import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './OrganizationEvents.css';

const localizer = momentLocalizer(moment);

const OrganizationEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Calculate event duration
  const calculateDuration = useCallback((start, end) => {
    const duration = moment(end).diff(moment(start), 'days') + 1;
    return duration === 1 ? '1 day' : `${duration} days`;
  }, []);

  // Format event data consistently
  const formatEventData = useCallback((event) => ({
    id: event._id,
    title: event.title,
    start: new Date(event.eventStartDate),
    end: new Date(event.eventEndDate),
    description: event.description || 'No additional details available',
    location: event.location || 'TBA',
    duration: calculateDuration(event.eventStartDate, event.eventEndDate),
    type: event.formType || 'event',
    status: event.status || 'approved',
    formId: event.formId
  }), [calculateDuration]);

  // Fetch calendar data with caching
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('https://studevent-server.vercel.app/api/forms/events', {
        params: {
          lastUpdated: lastUpdated?.toISOString()
        }
      });

      if (response.data.length > 0) {
        const formattedEvents = response.data.map(formatEventData);
        setEvents(prevEvents => {
          // Merge new events with existing, updating changed ones
          const eventMap = new Map(prevEvents.map(event => [event.id, event]));
          formattedEvents.forEach(event => eventMap.set(event.id, event));
          return Array.from(eventMap.values());
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Failed to load calendar data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [formatEventData, lastUpdated]);

  // Handle date selection
  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
    const filteredEvents = events.filter(event =>
      moment(date).isBetween(
        moment(event.start).startOf('day'), 
        moment(event.end).endOf('day'), 
        null, 
        '[]'
      )
    );
    setSelectedEvents(filteredEvents);
  }, [events]);

  // Custom event renderer with status indicators
  const renderEvent = useCallback((event) => (
    <div 
      className={`event-render ${event.status}`}
      data-type={event.type}
      data-status={event.status}
    >
      <span>{event.title}</span>
      <br />
      <span className="event-meta">
        {event.duration} • {event.type}
      </span>
    </div>
  ), []);

  // Handle event click with more details
  const handleEventClick = useCallback((event) => {
    const eventDetails = `
      Title: ${event.title}
      Type: ${event.type}
      Date: ${moment(event.start).format('MMM D')} - ${moment(event.end).format('MMM D, YYYY')}
      Duration: ${event.duration}
      Location: ${event.location}
      Status: ${event.status}
      Description: ${event.description}
    `;
    alert(eventDetails);
  }, []);

  // Initial data load and setup polling
  useEffect(() => {
    fetchCalendarData();
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchCalendarData, 120000);
    return () => clearInterval(interval);
  }, [fetchCalendarData]);

  return (
    <div className="wrap">
      <h1>EVENT CALENDAR</h1>
      
      {loading && <div className="loading-message">Loading calendar data...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="calendar-controls">
        <button onClick={fetchCalendarData} disabled={loading}>
          Refresh Calendar
        </button>
        <span className="last-updated">
          Last updated: {lastUpdated ? moment(lastUpdated).format('h:mm a') : 'Never'}
        </span>
      </div>

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
              views={['month', 'agenda']}
              defaultView="month"
              style={{ height: 500 }}
              selectable
              components={{
                event: renderEvent,
              }}
              onNavigate={setSelectedDate}
              onSelectSlot={handleDateClick}
              onSelectEvent={handleEventClick}
              eventPropGetter={(event) => ({
                className: `calendar-event ${event.status} ${event.type}`,
                style: {
                  opacity: event.status === 'pending' ? 0.8 : 1,
                  borderLeft: `4px solid ${
                    event.type === 'Project' ? '#4caf50' : 
                    event.type === 'Activity' ? '#2196f3' : '#ff9800'
                  }`
                }
              })}
            />
          </div>
        </div>

        <div className="event-details">
          <h2>{moment(selectedDate).format('MMMM D, YYYY')} - Event Details</h2>
          {selectedEvents.length > 0 ? (
            <ul>
              {selectedEvents.map((event) => (
                <li key={event.id} className={`event-item ${event.status}`}>
                  <strong>{event.title}</strong>
                  <div className="event-type">{event.type}</div>
                  <div className="event-info">
                    <span className="info-label">Duration:</span> {event.duration}
                  </div>
                  <div className="event-info">
                    <span className="info-label">Location:</span> {event.location}
                  </div>
                  <div className="event-info">
                    <span className="info-label">Status:</span> 
                    <span className={`status-badge ${event.status}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="event-description">
                    {event.description}
                  </div>
                  {event.formId && (
                    <a 
                      href={`/forms/view/${event.formId}`} 
                      className="view-form-link"
                    >
                      View Form Details
                    </a>
                  )}
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