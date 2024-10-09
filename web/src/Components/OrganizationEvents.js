import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './OrganizationEvents.css'; // Import custom styles
import image1 from '../Images/NU_moa_event2.jpg';
import image2 from '../Images/NU_moa_event6.jpg';
import image3 from '../Images/NU_moa_event3.jpg';
import image4 from '../Images/NU_moa_event4.jpg';

const localizer = momentLocalizer(moment);

// Custom Toolbar Component
const CustomToolbar = ({ onNavigate, label }) => {
  return (
    <div className="custom-toolbar">
      <div className="toolbar-label">
        <span>{label}</span>
      </div>
      <div className="toolbar-buttons">
        <button onClick={() => onNavigate('PREV')}>Back</button>
        <button onClick={() => onNavigate('NEXT')}>Next</button>
      </div>
    </div>
  );
};

const OrganizationEvents = () => {
  const [events, setEvents] = useState([
    {
      title: 'Event',
      start: new Date(),
      end: new Date(moment().add(1, 'hour').toDate()),
    },
  ]);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleAddEvent = () => {
    setEvents([...events, { ...newEvent, start: new Date(newEvent.start), end: new Date(newEvent.end) }]);
    setNewEvent({ title: '', start: '', end: '' });
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
    setSelectedDate(new Date()); // Set to current date initially
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (action) => {
    const calendar = document.querySelector('.rbc-calendar');
    calendar.dispatchEvent(new CustomEvent('navigate', { detail: { action } }));
  };

  // Image Slider Logic
  const images1 = [
    image1, image2
    // Add more images here
  ];
  const images2 = [
    image3, image4
    // Add more images here
  ];

  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images1.length);
    }, 3000); // Slide every 3 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [images1.length]);

  return (
    <div className="wrap">
      <div className="calendar-container">
        <div className="calendar-wrapper">
          <div className="calendar-content">
            {/* Month title on top of the calendar */}
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
                toolbar={false}  // Disable the default toolbar
              />
            </div>
            {/* Add custom toolbar below the calendar */}
            <CustomToolbar
              onNavigate={handleNavigate}
            />
          </div>
        </div>
        <div className="event-details">
          <h2>{moment(selectedDate).format('MMMM D, YYYY')}</h2>
          <ul>
            {getEventsForDate(selectedDate).map((event, index) => (
              <li key={index}>
                <span>{event.title}</span>
                <span>
                  {moment(event.start).format('LT')} - {moment(event.end).format('LT')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="img-slide">
  <img
    src={images1[currentIndex]}
    alt="Event"
    className="slider-image pocket-size"
  />

<img
    src={images2[currentIndex]}
    alt="Event"
    className="slider-image pocket-size"
  />
  
</div>


    </div>
  );
};

export default OrganizationEvents;
