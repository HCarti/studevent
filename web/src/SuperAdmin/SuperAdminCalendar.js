import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './SuperAdminCalendar.css';

const SuperAdminCalendar = () => {
  // Existing states from OrganizationEvents
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const calendarRef = React.useRef(null);
  
  // New states for blocked dates
  const [blockedDates, setBlockedDates] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockDescription, setBlockDescription] = useState('');
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null
  });

  // Get auth headers (same as OrganizationEvents)
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

  // Format blocked dates for FullCalendar
  const formatBlockedDates = (block) => {
    return {
      id: block._id,
      title: block.title || 'Blocked Date',
      start: block.startDate,
      end: block.endDate ? moment(block.endDate).add(1, 'days').format('YYYY-MM-DD') : null,
      backgroundColor: '#dc3545',
      borderColor: '#bd2130',
      textColor: 'white',
      extendedProps: {
        description: block.description,
        isBlocked: true
      },
      display: 'background'
    };
  };

  // Format event data for FullCalendar
  const formatEventsForFullCalendar = (event) => {
    const backgroundColor = event.formType === 'Activity' ? '#5cb85c' : '#f0ad4e';
    const borderColor = event.formType === 'Activity' ? '#4cae4c' : '#eea236';
    const title = event.formType === 'Project' ? event.projectTitle : event.eventTitle || event.title;
    const duration = calculateDuration(event.startDate, event.endDate);
    const displayTitle = `${title} (${duration})`;

    if (duration !== '1 day') {
      return {
        id: event._id,
        title: displayTitle,
        start: event.startDate,
        end: moment(event.endDate).add(1, 'days').format('YYYY-MM-DD'),
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
    } else {
      return {
        id: event._id,
        title: displayTitle,
        date: event.startDate,
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

      if (!response.data || response.data.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const formattedEvents = response.data.map(formatEventsForFullCalendar);
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

  // Fetch blocked dates from backend
  const fetchBlockedDates = async () => {
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders) return;

      const response = await axios.get(
        'https://studevent-server.vercel.app/api/calendar/blocked-dates',
        authHeaders
      );

      const formattedBlocks = response.data.map(formatBlockedDates);
      setBlockedDates(formattedBlocks);
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
      setError('Failed to load blocked dates');
    }
  };

  // Handle date selection for blocking
  const handleDateSelect = (selectInfo) => {
    // Ensure end date is after start date
    let endDate = selectInfo.end || selectInfo.start;
    if (endDate < selectInfo.start) {
      endDate = selectInfo.start;
    }
  
    setSelectedRange({
      start: selectInfo.start,
      end: endDate
    });
    setShowBlockModal(true);
  };

  // Handle date click
  const handleDateClick = (arg) => {
    const clickedDate = new Date(arg.date);
    setSelectedDate(clickedDate);

    const clickedDateClean = moment(clickedDate).startOf('day');
    const filteredEvents = events.filter(event => {
      const eventStart = event.date
        ? moment(event.date).startOf('day')
        : moment(event.start).startOf('day');
      const eventEnd = event.end ? moment(event.end).startOf('day') : eventStart;

      return clickedDateClean.isBetween(eventStart, eventEnd, 'day', '[]');
    });

    setSelectedEvents(filteredEvents);
  };

  // Handle event click
  const handleEventClick = (arg) => {
    const event = arg.event;
    const eventDate = new Date(event.start);
    setSelectedDate(eventDate);

    const eventDateClean = moment(eventDate).startOf('day');
    const sameDay = events.filter(e => {
      const eStart = e.date ? moment(e.date).startOf('day') : moment(e.start).startOf('day');
      const eEnd = e.end ? moment(e.end).startOf('day') : eStart;

      return eventDateClean.isBetween(eStart, eEnd, 'day', '[]');
    });

    const uniqueEvents = Array.from(new Set([event.toPlainObject(), ...sameDay].map(e => e.id)))
      .map(id => events.find(e => e.id === id))
      .filter(e => e !== undefined);

    setSelectedEvents(uniqueEvents);
  };

  // Handle view change
  const handleDatesSet = (calendarInfo) => {
    const { start, end } = calendarInfo.view;
    if (!start || !end) return;
    fetchCalendarEventsForRange(start, end);
  };

  // Fetch events for specific date range
  const fetchCalendarEventsForRange = async (start, end) => {
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders) return;

      const startDate = moment(start).startOf('month').toISOString();
      const endDate = moment(end).endOf('month').toISOString();

      const response = await axios.get(
        'https://studevent-server.vercel.app/api/calendar/events/range',
        {
          params: { start: startDate, end: endDate },
          ...authHeaders
        }
      );

      if (!response.data || response.data.length === 0) {
        setEvents([]);
        return;
      }

      const formattedEvents = response.data.map(formatEventsForFullCalendar);
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

  // Custom rendering for events
  const renderEventContent = (eventInfo) => {
    return (
      <div className="fc-event-main-frame">
        <div className="fc-event-title-container">
          <div className="fc-event-title">{eventInfo.event.title}</div>
        </div>
      </div>
    );
  };

  // Submit blocked dates to backend
// Submit blocked dates to backend
const handleBlockSubmit = async () => {
    try {
      // Get user info
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (!parsedUser || !parsedUser._id) {
        setError('User information not found. Please log in again.');
        return;
      }
  
      // Normalize dates to start of day
      const normalizeDate = (date) => {
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0);
        return d;
      };
  
      const start = normalizeDate(selectedRange.start);
      const end = selectedRange.end ? normalizeDate(selectedRange.end) : null;
  
      // Validate dates
      if (end && end < start) {
        setError('End date cannot be before start date');
        return;
      }
  
      const authHeaders = getAuthHeaders();
      if (!authHeaders) return;
  
      const blockData = {
        title: blockTitle,
        description: blockDescription,
        startDate: start.toISOString(),
        endDate: end ? end.toISOString() : undefined,
        createdBy: parsedUser._id
      };
  
      const response = await axios.post(
        'https://studevent-server.vercel.app/api/calendar/block-dates',
        blockData,
        authHeaders
      );
  
      if (response.data) {
        await fetchBlockedDates();
        setShowBlockModal(false);
        setBlockTitle('');
        setBlockDescription('');
        setError(null);
      }
    } catch (err) {
      console.error('Error blocking dates:', err);
      setError(err.response?.data?.error || 'Failed to block dates');
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
    fetchBlockedDates();
  }, []);

  // Combine regular events with blocked dates
  const calendarEvents = [...events, ...blockedDates];

  return (
    <div className="superadmin-calendar-container">
      <h1 className="calendar-title">SUPERADMIN CALENDAR - DATE MANAGEMENT</h1>

      {loading && (
        <div className="loader-overlay">
          <div className="loader-container">
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
              events={calendarEvents}
              selectable={true}
              select={handleDateSelect}
              eventContent={renderEventContent}
              displayEventTime={false}
              eventDisplay="block"
              dayMaxEventRows={3}
              dayMaxEvents={false}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              height="600px"
            />
          </div>
        </div>

        {/* Block Dates Modal */}
        {showBlockModal && (
          <div className="super-modal-overlay">
            <div className="super-modal-container">
              <div className="super-modal-header">
                <h2>Block Dates</h2>
                <button onClick={() => setShowBlockModal(false)}>×</button>
              </div>
              <div className="super-modal-body">
                <div className="super-form-group">
                  <label>Date Range</label>
                  <input
                    type="text"
                    readOnly
                    value={
                      selectedRange.start && selectedRange.end
                        ? `${moment(selectedRange.start).format('MMM D, YYYY')} - ${moment(selectedRange.end).format('MMM D, YYYY')}`
                        : moment(selectedRange.start).format('MMM D, YYYY')
                    }
                  />
                </div>
                <div className="super-form-group">
                  <label>Title/Reason</label>
                  <input
                    type="text"
                    placeholder="E.g., School Holidays, Maintenance"
                    value={blockTitle}
                    onChange={(e) => setBlockTitle(e.target.value)}
                  />
                </div>
                <div className="super-form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Additional details about why these dates are blocked"
                    value={blockDescription}
                    onChange={(e) => setBlockDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="super-modal-footer">
                <button className="secondary-button" onClick={() => setShowBlockModal(false)}>
                  Cancel
                </button>
                <button className="primary-button" onClick={handleBlockSubmit}>
                  Block Dates
                </button>
              </div>
            </div>
          </div>
        )}

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

export default SuperAdminCalendar;