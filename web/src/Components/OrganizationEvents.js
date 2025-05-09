import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ClipLoader } from 'react-spinners';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './OrganizationEvents.css';

const OrganizationEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [blockedDates, setBlockedDates] = useState([]);
  const calendarRef = React.useRef(null);

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
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Format event data for FullCalendar - using simpler format that works better
  const formatEventsForFullCalendar = event => {
    // Determine event color based on type
    const backgroundColor = event.formType === 'Activity' ? '#5cb85c' : '#f0ad4e';
    const borderColor = event.formType === 'Activity' ? '#4cae4c' : '#eea236';
    const title =
      event.formType === 'Project' ? event.projectTitle : event.eventTitle || event.title;

    // Calculate duration for display
    const duration = calculateDuration(event.startDate, event.endDate);
    const displayTitle = `${title} (${duration})`;

    // For multi-day events
    if (duration !== '1 day') {
      return {
        id: event._id,
        title: displayTitle,
        start: event.startDate,
        end: moment(event.endDate).add(1, 'days').format('YYYY-MM-DD'), // Add 1 day to end date for proper display
        backgroundColor,
        borderColor,
        textColor: 'white',
        extendedProps: {
          description: event.formType === 'Project' ? event.projectDescription : event.description,
          location: event.location || 'TBA',
          organization: event.organization?.organizationName || 'N/A',
          formType: event.formType,
          duration: duration
        }
      };
    }
    // For single-day events
    else {
      return {
        id: event._id,
        title: displayTitle,
        date: event.startDate, // Use date property for single-day events
        backgroundColor,
        borderColor,
        textColor: 'white',
        extendedProps: {
          description: event.formType === 'Project' ? event.projectDescription : event.description,
          location: event.location || 'TBA',
          organization: event.organization?.organizationName || 'N/A',
          formType: event.formType,
          duration: duration
        }
      };
    }
  };

const fetchBlockedDates = async () => {
  try {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    const response = await axios.get(
      'https://studevent-server.vercel.app/api/calendar/blocked-dates',
      authHeaders
    );

    if (response.data && response.data.length > 0) {
      const formattedBlockedDates = response.data.map(date => ({
        start: moment(date).format('YYYY-MM-DD'), // Ensure proper formatting
        display: 'background',
        backgroundColor: '#ffcccc', // Solid light red
        borderColor: '#ff9999',
        className: 'blocked-date',
        allDay: true,
        overlap: false,
        id: `blocked-${date}` // Add unique ID
      }));
      console.log('Formatted blocked dates:', formattedBlockedDates);
      setBlockedDates(formattedBlockedDates);
    }
  } catch (err) {
    console.error('Error fetching blocked dates:', err);
  }
};

useEffect(() => {
  fetchCalendarEvents();
  fetchBlockedDates();
}, []);

  // Calculate event duration
  const calculateDuration = (start, end) => {
    const startDate = moment(start).startOf('day');
    const endDate = moment(end).startOf('day');
    const duration = endDate.diff(startDate, 'days') + 1;
    return duration === 1 ? '1 day' : `${duration} days`;
  };

  // Fetch calendar events from backend
  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const authHeaders = getAuthHeaders();
      if (!authHeaders) return;

      const startOfMonth = moment().startOf('month').toISOString();
      const endOfMonth = moment().endOf('month').toISOString();

      const response = await axios.get(
        'https://studevent-server.vercel.app/api/calendar/events/range',
        {
          params: { start: startOfMonth, end: endOfMonth },
          ...authHeaders
        }
      );

      console.log('Raw events from API:', response.data);

      if (!response.data || response.data.length === 0) {
        console.log('No events returned from API');
        setEvents([]);
        setLoading(false);
        return;
      }

      // Format dates properly for FullCalendar
      const formattedEvents = response.data.map(formatEventsForFullCalendar);
      console.log('Formatted events for calendar:', formattedEvents);
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

  // Fetch events for specific date range (when view changes)
  const handleDatesSet = calendarInfo => {
    const { start, end } = calendarInfo.view;
    console.log('Date range changed:', {
      start: start ? start.toISOString() : 'undefined',
      end: end ? end.toISOString() : 'undefined'
    });

    if (!start || !end) {
      console.error('Invalid date range received from calendar view');
      return;
    }

    fetchCalendarEventsForRange(start, end);
  };

  // Fetch events for specific date range
  const fetchCalendarEventsForRange = async (start, end) => {
    try {
      // Don't show loading if just switching months - can be disruptive to user experience
      // setLoading(true);
      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        return;
      }

      // Ensure we have a full month range
      const startDate = moment(start).startOf('month').toISOString();
      const endDate = moment(end).endOf('month').toISOString();

      console.log('Fetching events for range:', { startDate, endDate });

      const response = await axios.get(
        'https://studevent-server.vercel.app/api/calendar/events/range',
        {
          params: { start: startDate, end: endDate },
          ...authHeaders
        }
      );

      console.log('Raw events from range API:', response.data);

      if (!response.data || response.data.length === 0) {
        console.log('No events returned from range API');
        setEvents([]);
        return;
      }

      // Format dates properly for FullCalendar
      const formattedEvents = response.data.map(formatEventsForFullCalendar);
      console.log('Formatted events for calendar range:', formattedEvents);
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

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  // Handle date click
  const handleDateClick = arg => {
    const clickedDate = new Date(arg.date);
    setSelectedDate(clickedDate);

    const clickedDateClean = moment(clickedDate).startOf('day');
    const filteredEvents = events.filter(event => {
      // Handle both date and start/end formats
      const eventStart = event.date
        ? moment(event.date).startOf('day')
        : moment(event.start).startOf('day');
      const eventEnd = event.end ? moment(event.end).startOf('day') : eventStart;

      return clickedDateClean.isBetween(eventStart, eventEnd, 'day', '[]');
    });

    setSelectedEvents(filteredEvents);
  };

  // Handle event click
  const handleEventClick = arg => {
    const event = arg.event;
    const eventDate = new Date(event.start);
    setSelectedDate(eventDate);

    const eventDateClean = moment(eventDate).startOf('day');
    const sameDay = events.filter(e => {
      // Handle both date and start/end formats
      const eStart = e.date ? moment(e.date).startOf('day') : moment(e.start).startOf('day');
      const eEnd = e.end ? moment(e.end).startOf('day') : eStart;

      return eventDateClean.isBetween(eStart, eEnd, 'day', '[]');
    });

    // Get unique events for the day
    const uniqueEvents = Array.from(new Set([event.toPlainObject(), ...sameDay].map(e => e.id)))
      .map(id => events.find(e => e.id === id))
      .filter(e => e !== undefined); // Filter out any undefined events

    setSelectedEvents(uniqueEvents);
  };

  // Custom rendering for events to ensure they display properly
  const renderEventContent = eventInfo => {
    return (
      <>
        <div className="fc-event-main-frame">
          <div className="fc-event-title-container">
            <div className="fc-event-title">{eventInfo.event.title}</div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="calendar-page-container">
      <h1 className="calendar-title">EVENT CALENDAR</h1>

      {loading && (
        <div className="loader-overlay">
          <div className="loader-container">
            <ClipLoader color="#1a3ab5" size={50} />
            <p>Loading calendar events...</p>
          </div>
        </div>
      )}
      {error && !error.includes('Session expired') && <div className="error-message">{error}</div>}

      <div className="calendar-content-container">
        <div className="calendar-main-wrapper">
          <div className="calendar-component-container">
<FullCalendar
  ref={calendarRef}
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  headerToolbar={{
    left: 'prev,today,next',
    center: 'title',
    right: ''
  }}
  events={[...events, ...blockedDates]}
  eventContent={renderEventContent}
  displayEventTime={false}
  eventDisplay="block"
  dayMaxEventRows={3}
  dayMaxEvents={false}
  selectable={true}
  dateClick={handleDateClick}
  eventClick={info => {
    if (info.event.display === 'background') {
      alert('This date is blocked and cannot be selected.');
      return;
    }
    handleEventClick(info);
  }}
  datesSet={handleDatesSet}
  height="600px"
  eventOrder="display"
  eventDidMount={(info) => {
    if (info.event.display === 'background') {
      info.el.style.zIndex = '1'; // Ensure background events stay behind
    }
  }}
/>
          </div>
        </div>

        <div className="calendar-details-panel">
          <h2>{moment(selectedDate).format('dddd, MMMM D, YYYY')} - Event Details</h2>
          <div className="event-details-content">
            {selectedEvents.length > 0 ? (
              <ul className="event-list">
                {selectedEvents.map((event, index) => (
                  <li
                    key={index}
                    className={`event-item ${event.extendedProps?.formType?.toLowerCase() || ''}`}
                  >
                    <h3>
                      {event.extendedProps?.formType === 'Project' ? (
                        <>
                          Project: <span className="event-title">{event.title}</span>
                        </>
                      ) : (
                        <>
                          Activity: <span className="event-title">{event.title}</span>
                        </>
                      )}
                    </h3>
                    <p>
                      <strong>Type:</strong> {event.extendedProps?.formType}
                    </p>
                    <p>
                      <strong>Organization:</strong> {event.extendedProps?.organization}
                    </p>
                    <p>
                      <strong>Duration:</strong> {event.extendedProps?.duration}
                    </p>
                    <p>
                      <strong>Location:</strong> {event.extendedProps?.location}
                    </p>
                    <p>
                      <strong>Description:</strong> {event.extendedProps?.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-events">No events scheduled for this day.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationEvents;
