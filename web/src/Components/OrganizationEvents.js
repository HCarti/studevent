import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch calendar events from backend
  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current month's start and end dates for range query
      const startOfMonth = moment().startOf('month').toISOString();
      const endOfMonth = moment().endOf('month').toISOString();
      
      const response = await axios.get(
        'https://studevent-server.vercel.app/api/calendar/events/range', 
        {
          params: { start: startOfMonth, end: endOfMonth }
        }
      );
      
      const formattedEvents = response.data.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        description: event.description,
        location: event.location,
        organization: event.organization?.organizationName || 'N/A',
        type: event.formType,
        duration: calculateDuration(event.startDate, event.endDate),
        allDay: true // Assuming these are all-day events
      }));
      
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load calendar events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate event duration
  const calculateDuration = (start, end) => {
    const duration = moment(end).diff(moment(start), 'days') + 1;
    return duration === 1 ? '1 day' : `${duration} days`;
  };

  // Handle month change to fetch new events
  const handleNavigate = (newDate) => {
    setSelectedDate(newDate);
    fetchCalendarEventsForMonth(newDate);
  };

  // Fetch events for specific month
  const fetchCalendarEventsForMonth = async (date) => {
    try {
      const startOfMonth = moment(date).startOf('month').toISOString();
      const endOfMonth = moment(date).endOf('month').toISOString();
      
      const response = await axios.get(
        'https://studevent-server.vercel.app/api/calendar/events/range', 
        {
          params: { start: startOfMonth, end: endOfMonth }
        }
      );
      
      const formattedEvents = response.data.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
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
      setError('Failed to load calendar events for this month.');
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  // Handle date selection
  const handleSelectSlot = (slotInfo) => {
    const date = slotInfo.start;
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
  };

  // Custom event renderer with type indicator
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
        <span>{event.organization}</span>
        {event.duration !== '1 day' && <span>{event.duration}</span>}
      </div>
    </div>
  );

  return (
    <div className="wrap">
      <h1>EVENT CALENDAR</h1>
      
      {loading && <div className="loading-message">Loading calendar events...</div>}
      {error && <div className="error-message">{error}</div>}

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
              onSelectEvent={(event) => alert(`${event.title}\n${event.description}`)}
              onNavigate={handleNavigate}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent
              }}
            />
          </div>
        </div>

        <div className="event-details">
          <h2>{moment(selectedDate).format('MMMM D, YYYY')} - Event Details</h2>
          {selectedEvents.length > 0 ? (
            <ul className="event-list">
              {selectedEvents.map((event, index) => (
                <li key={index} className={`event-item ${event.type.toLowerCase()}`}>
                  <h3>{event.title}</h3>
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