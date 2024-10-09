import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './OrganizationEvents.css'; // Import custom styles
import image1 from '../Images/NU_moa_event2.jpg';
import image2 from '../Images/NU_moa_event6.jpg';
import image3 from '../Images/NU_moa_event3.jpg';
import image4 from '../Images/NU_moa_event4.jpg';
import Slider from 'react-slick'; // Import react-slick for the carousel
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';

const localizer = momentLocalizer(moment);

// Custom Toolbar Component
const CustomToolbar = ({ onNavigate, label }) => {
  return (
    <div className="custom-toolbar">
      <div className="toolbar-label">
        <span>{label}</span>
      </div>
      <div className="toolbar-buttons">
        <button onClick={() => onNavigate('PREV')} className="toolbar-button">
          &#8592; Previous
        </button>
        <button onClick={() => onNavigate('NEXT')} className="toolbar-button">
          Next &#8594;
        </button>
      </div>
    </div>
  );
};

const OrganizationEvents = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Sample Event',
      start: new Date(),
      end: new Date(moment().add(1, 'hour').toDate()),
    },
  ]);

  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hoveredEventId, setHoveredEventId] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); // Track if editing mode is on
  const [editingEventId, setEditingEventId] = useState(null); // Store the event being edited

  const generateUniqueId = () => Date.now() + Math.random();

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      if (isEditing) {
        // Update existing event
        setEvents(events.map(event => 
          event.id === editingEventId ? { ...event, ...newEvent } : event
        ));
        setIsEditing(false); // Exit editing mode
        setEditingEventId(null); // Clear editing event ID
      } else {
        const id = generateUniqueId();
        setEvents([
          ...events,
          { 
            id, 
            ...newEvent, 
            start: new Date(newEvent.start), 
            end: new Date(newEvent.end) 
          }
        ]);
      }
      setNewEvent({ title: '', start: '', end: '' });
    }
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const handleEditEvent = (event) => {
    setNewEvent({
      title: event.title,
      start: moment(event.start).format('YYYY-MM-DDTHH:mm'), // Format for input fields
      end: moment(event.end).format('YYYY-MM-DDTHH:mm')
    });
    setIsEditing(true); // Enable editing mode
    setEditingEventId(event.id); // Store the ID of the event being edited
  };

  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        moment(event.start).isSame(date, 'day') ||
        moment(event.end).isSame(date, 'day') ||
        (moment(event.start).isBefore(date) && moment(event.end).isAfter(date))
    );
  };

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (action) => {
    const calendar = document.querySelector('.rbc-calendar');
    calendar.dispatchEvent(new CustomEvent('navigate', { detail: { action } }));
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
  };

  const images = [image1, image2, image3, image4];

  return (
    <div className="wrap">
      <div className="calendar-container">
        {/* Calendar on the Left */}
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
              onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
              selectable
              toolbar={false}  
              onNavigate={(date) => setSelectedDate(date)}
              eventPropGetter={(event) => {
                if (event.id === hoveredEventId) {
                  return { style: { backgroundColor: '#ff5722', color: 'white' } };
                }
                return {};
              }}
            />
          </div>
          <CustomToolbar onNavigate={handleNavigate} />
        </div>

        {/* Event Details on the Right */}
        <div className="event-details">
          <h2>{moment(selectedDate).format('MMMM D, YYYY')}</h2>
          <ul>
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event) => (
                <li 
                  key={event.id} 
                  className="event-item" 
                  onMouseEnter={() => setHoveredEventId(event.id)}
                  onMouseLeave={() => setHoveredEventId(null)}
                >
                  <span className="event-title">{event.title}</span>
                  <span className="event-time">
                    {moment(event.start).format('LT')} - {moment(event.end).format('LT')}
                  </span>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)} 
                    style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => handleEditEvent(event)} 
                    style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </li>
              ))
            ) : (
              <li className="no-events">No events for this day.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Add/Edit Event Form - Now placed above the slider */}
      <div className="add-event-form">
  <h3>{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
  
  {/* Event Title Input */}
  <input
    type="text"
    placeholder="Event Title"
    value={newEvent.title}
    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
  />

  {/* Start Date & Time Input with Label */}
  <label>Start Date & Time</label>
  <input
    type="datetime-local"
    value={newEvent.start}
    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
  />

  {/* End Date & Time Input with Label */}
  <label>End Date & Time</label>
  <input
    type="datetime-local"
    value={newEvent.end}
    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
  />

  {/* Add/Update Event Button */}
  <button onClick={handleAddEvent}>
    {isEditing ? 'Update Event' : 'Add Event'}
  </button>
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
