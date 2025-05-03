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
  const [view, setView] = useState('month');
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
        Authorization: `Bearer ${token}`,
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
        title: event.formType === 'Project' ? event.projectTitle : event.eventTitle || event.title,
        start: moment.utc(event.startDate).local().toDate(),
        end: moment.utc(event.endDate).local().toDate(),
        description: event.formType === 'Project' ? event.projectDescription : event.description,
        location: event.location || 'TBA',
        organization: event.organization?.organizationName || 'N/A',
        type: event.formType,
        duration: calculateDuration(event.startDate, event.endDate),
        allDay: true,
        rawStart: event.startDate,
        rawEnd: event.endDate,
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
        setError('Failed to load calendar events. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch events for specific month
  const fetchCalendarEventsForMonth = async date => {
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
        start: moment.utc(event.startDate).local().toDate(),
        end: moment.utc(event.endDate).local().toDate(),
        description: event.formType === 'Project' ? event.projectDescription : event.description,
        location: event.location || 'TBA',
        organization: event.organization?.organizationName || 'N/A',
        type: event.formType,
        duration: calculateDuration(event.startDate, event.endDate),
        allDay: true,
        rawStart: event.startDate,
        rawEnd: event.endDate,
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
  const calculateDuration = (start, end) => {
    const startDate = moment.utc(start).local().startOf('day');
    const endDate = moment.utc(end).local().startOf('day');
    const duration = endDate.diff(startDate, 'days') + 1;
    return duration === 1 ? '1 day' : `${duration} days`;
  };

  // Handle month change to fetch new events
  const handleNavigate = newDate => {
    setSelectedDate(newDate);
    fetchCalendarEventsForMonth(newDate);
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  // Handle date selection
  const handleSelectSlot = slotInfo => {
    const clickedDate = new Date(slotInfo.start);
    setSelectedDate(clickedDate);

    const clickedDateClean = moment(clickedDate).startOf('day');
    const filteredEvents = events.filter(event => {
      const eventStart = moment(event.start).startOf('day');
      const eventEnd = moment(event.end).startOf('day');
      return clickedDateClean.isBetween(eventStart, eventEnd, 'day', '[]');
    });

    setSelectedEvents(filteredEvents);
  };

  // Handle event selection
  const handleSelectEvent = event => {
    const eventDate = new Date(event.start);
    setSelectedDate(eventDate);

    const eventDateClean = moment(eventDate).startOf('day');
    const sameDay = events.filter(e => {
      const eStart = moment(e.start).startOf('day');
      const eEnd = moment(e.end).startOf('day');
      return eventDateClean.isBetween(eStart, eEnd, 'day', '[]');
    });

    const uniqueEvents = new Set([event, ...sameDay]);
    const filteredEvents = [...uniqueEvents];
    setSelectedEvents(filteredEvents);
  };

  // Handle view change
  const handleViewChange = newView => {
    setView(newView);
  };

  // Custom event style based on type
  const eventStyleGetter = event => {
    let backgroundColor = '#3174ad';
    let borderColor = '#1a3ab5';

    if (event.type === 'Activity') {
      backgroundColor = '#5cb85c';
      borderColor = '#4cae4c';
    } else if (event.type === 'Project') {
      backgroundColor = '#f0ad4e';
      borderColor = '#eea236';
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '0.85rem',
        padding: '2px 4px'
      }
    };
  };

  // Custom day cell wrapper to improve touch areas
  const DayCellWrapper = props => {
    const { children, value } = props;
    return (
      <div
        className="custom-day-cell"
        style={{
          height: '100%',
          minHeight: '80px',
          position: 'relative'
        }}
      >
        {children}
      </div>
    );
  };

  // Custom event component with better sizing
  const EventComponent = ({ event }) => (
    <div className="rbc-event-content" style={{ padding: '2px', overflow: 'hidden' }}>
      <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {event.title}
      </strong>
      <div className="event-meta">
        <span className="event-type-badge">{event.type}</span>
        {event.duration !== '1 day' && <span>{event.duration}</span>}
      </div>
    </div>
  );

  // Custom toolbar with better responsive design
  const CustomToolbar = toolbar => {
    return (
      <div className="rbc-toolbar">
        <span className="rbc-toolbar-label">{toolbar.label}</span>
        <div className="rbc-btn-group">
          <button type="button" onClick={() => toolbar.onNavigate('PREV')}>
            Prev
          </button>
          <button type="button" onClick={() => toolbar.onNavigate('TODAY')}>
            Today
          </button>
          <button type="button" onClick={() => toolbar.onNavigate('NEXT')}>
            Next
          </button>
        </div>
      </div>
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
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={['month']}
              style={{
                height: '600px',
                width: '100%'
              }}
              selectable={true}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar,
                dateCellWrapper: DayCellWrapper
              }}
              view={view}
              defaultView="month"
              showMultiDayTimes={false}
              popup={true}
              popupOffset={10}
              dayLayoutAlgorithm="no-overlap"
              formats={{
                dateFormat: 'D',
                monthHeaderFormat: 'MMMM YYYY'
              }}
              longPressThreshold={250}
              messages={{
                showMore: total => `+${total} more`
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
                  <li key={index} className={`event-item ${event.type.toLowerCase()}`}>
                    <h3>
                      {event.type === 'Project' ? (
                        <>
                          Project: <span className="event-title">{event.projectTitle}</span>
                        </>
                      ) : (
                        <>
                          Activity: <span className="event-title">{event.eventTitle}</span>
                        </>
                      )}
                    </h3>
                    <p>
                      <strong>Type:</strong> {event.type}
                    </p>
                    <p>
                      <strong>Organization:</strong> {event.organization}
                    </p>
                    <p>
                      <strong>Duration:</strong> {event.duration}
                    </p>
                    <p>
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p>
                      <strong>Description:</strong> {event.description}
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
