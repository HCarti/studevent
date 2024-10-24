import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Import axios for making API calls
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './OrganizationEvents.css';
import image1 from '../Images/NU_moa_event2.jpg';
import image2 from '../Images/NU_moa_event6.jpg';
import image3 from '../Images/NU_moa_event3.jpg';
import image4 from '../Images/NU_moa_event4.jpg';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';

const localizer = momentLocalizer(moment);

const OrganizationEvents = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hoveredEventId, setHoveredEventId] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); 
  const [editingEventId, setEditingEventId] = useState(null); 

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch events from the backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get('https://studevent-server.vercel.app/api/events');
      const formattedEvents = response.data.map(event => ({
        ...event,
        start: moment(event.start).toDate(),
        end: moment(event.end).toDate(),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  

  // Handle deleting an event from the backend
  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`https://studevent-server.vercel.app/api/events/${id}`);
      setEvents(events.filter(event => event._id !== id));
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event.');
    }
  };

  // Handle editing an event
  const handleEditEvent = (event) => {
    setNewEvent({
      title: event.title,
      start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      end: moment(event.end).format('YYYY-MM-DDTHH:mm')
    });
    setIsEditing(true);
    setEditingEventId(event._id);  // Use _id for MongoDB consistency
  };

  // Handle updating an event in the backend
  const handleUpdateEvent = async () => {
    try {
      const updatedEvent = {
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end
      };

      await axios.put(`https://studevent-server.vercel.app/api/events/${editingEventId}`, updatedEvent);
      setEvents(events.map(event => event._id === editingEventId ? { ...event, ...updatedEvent } : event));
      setIsEditing(false);
      setEditingEventId(null);
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event.');
    }
  };

  // Handle selecting a date on the calendar
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    dotsClass: 'slick-dots custom-dots',
    customPaging: function (i) {
      return <button className="custom-dot"></button>;
    },
    appendDots: (dots) => <ul style={{ display: 'flex', alignItems: 'center' }}>{dots.slice(0, 3)}</ul>,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const images = [image1, image2, image3, image4];

  <Calendar
  localizer={localizer}
  events={Array.isArray(events) ? events : []} // Ensures events is an array
  startAccessor="start"
  endAccessor="end"
  views={['month']}
  style={{ height: 500 }}
  selectable
  onNavigate={(date) => setSelectedDate(date)}
/>


  return (
    <div className="wrap">
      <div className="calendar-container">
        <div className="calendar-wrapper">
          <div className="calendar-header">
            <span className="month-title">{moment(selectedDate).format('MMMM YYYY')}</span>
          </div>
          <div style={{ height: 500 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={['month']}
              style={{ height: 500 }}
              selectable
              onNavigate={(date) => setSelectedDate(date)}
            />
          </div>
        </div>

        <div className="event-details">
          <h2>{moment(selectedDate).format('MMMM D, YYYY')}</h2>
          <ul>
            {events.filter(event => moment(event.start).isSame(selectedDate, 'day')).length > 0 ? (
              events.filter(event => moment(event.start).isSame(selectedDate, 'day')).map((event) => (
                <li 
                  key={event._id}  // Use _id for MongoDB objects
                  className="event-item" 
                  onMouseEnter={() => setHoveredEventId(event._id)}  // Consistent use of _id
                  onMouseLeave={() => setHoveredEventId(null)}
                >
                  <span className="event-title">{event.title}</span>
                  <span className="event-time">
                    {moment(event.start).format('LT')} - {moment(event.end).format('LT')}
                  </span>
                  <button onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                  <button onClick={() => handleEditEvent(event)}>Edit</button>
                </li>
              ))
            ) : (
              <li>No events for this day.</li>
            )}
          </ul>
        </div>

        {/* Conditionally show the form for editing an event */}
        {isEditing && (
          <div className="edit-event-form">
            <h3>Edit Event</h3>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Event Title"
            />
            <input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
            />
            <input
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
            />
            <button onClick={handleUpdateEvent}>Update Event</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}
      </div>
      {/* Image Slider Section */}
      <div className="img-slide">
        <Slider {...sliderSettings}>
          {images.map((img, index) => (
            <div key={index} className="slide">
              <img src={img} alt={`Event ${index + 1}`} className="slider-image" />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default OrganizationEvents;
