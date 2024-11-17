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

  useEffect(() => {
    fetchEvents();
    fetchForms();
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
        title: form.title || 'Submitted Form', // Use a default title if not available
        start: moment(form.startDate).toDate(),
        end: moment(form.endDate || form.startDate).toDate(), // Use the same date if `endDate` is not provided
      }));
      setEvents(prevEvents => [...prevEvents, ...formEvents]);
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
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
                onNavigate={(date) => setSelectedDate(date)}
              />
            </div>
          </div>
        </div>q
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
