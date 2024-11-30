import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import Footer from '../Components/footer';

const localizer = momentLocalizer(moment);

const OrganizationEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchForms();
  }, []);

   // Calculate event duration
   const calculateDuration = (start, end) => {
    const duration = moment(end).diff(moment(start), 'days') + 1; // Inclusive of both start and end
    return duration === 1 ? '1 day' : `${duration} days`;
  };

 // Fetch events from the backend
const fetchEvents = async () => {
  try {
    const response = await axios.get('https://studevent-server.vercel.app/api/events');
    const formattedEvents = response.data.map(event => ({
      title: event.title,
      start: moment(event.eventStartDate).toDate(), // Use eventStartDate
      end: moment(event.eventEndDate).toDate(),     // Use eventEndDate
      description: event.description || 'No additional details available', // Add description
      location: event.location || 'TBA', // Add location
      duration: calculateDuration(event.eventStartDate, event.eventEndDate), // Calculate duration
    }));
    setEvents(prevEvents => [...prevEvents, ...formattedEvents]);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Fetch forms and add them as events to the calendar
const fetchForms = async () => {
  try {
    const response = await axios.get('https://studevent-server.vercel.app/api/forms/all');
    const formEvents = response.data.map(form => ({
      title: form.title,
      start: moment(form.eventStartDate).toDate(), // Use eventStartDate
      end: moment(form.eventEndDate || form.eventStartDate).toDate(), // Use eventEndDate
      description: form.description || 'No additional details available', // Add description
      location: form.location || 'TBA', // Add location
      duration: calculateDuration(form.eventStartDate, form.eventEndDate || form.eventStartDate), // Calculate duration
    }));
    setEvents(prevEvents => [...prevEvents, ...formEvents]);
  } catch (error) {
    console.error('Error fetching forms:', error);
  }
};
   // Custom render for events
  const renderEvent = (event) => (
    <div className="event-render">
      <span>{event.title}</span>
      <br />
      <span style={{ fontSize: '0.85rem', color: '#666' }}>{event.duration}</span>
    </div>
  );

 const handleDateClick = (date) => {
  setSelectedDate(date);

  // Filter events based on the selected date (ensure time differences are ignored)
  const filteredEvents = events.filter(event =>
    moment(date).isBetween(moment(event.start).startOf('day'), moment(event.end).endOf('day'), null, '[]') // Inclusive range
  );

  setSelectedEvents(filteredEvents);
};

  // Slider settings
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
    fade: true,
    cssEase: 'linear',
    dotsClass: 'slick-dots custom-dots',
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const images = [image1, image2, image3, image4];

  return (
    <React.Fragment>
      <div className="wrap">
        <h1>EVENT CALENDAR</h1>
        {/* Image Slider Section */}
        
        {/* Calendar Section */}
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
                  components={{
                    event: renderEvent, // Custom render for events
                  }}
                  onNavigate={(date) => setSelectedDate(date)}
                  onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)} // Handle date click
                  onSelectEvent={(event) => alert(`Event: ${event.title}`)} // Optional event click action
                />
              </div>
            </div>
             {/* Event Details Section */}
          <div className="event-details">
            <h2>{moment(selectedDate).format('MMMM D, YYYY')} - Event Details</h2>
            {selectedEvents.length > 0 ? (
              <ul>
                {selectedEvents.map((event, index) => (
                  <li key={index}>
                    <strong>{event.title}</strong>
                    <br />
                    <span>Duration: {event.duration}</span>
                    <br />
                    <span>Description: {event.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events for this day.</p>
            )}
          </div>
            
          </div>

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
      <Footer />
    </React.Fragment>
  );
};

export default OrganizationEvents;
