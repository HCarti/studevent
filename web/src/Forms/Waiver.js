import React, { useState } from 'react';
import './Aap.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function Waiver() {
  const [formData, setFormData] = useState({
    eventlocation: '',
    eventtitle: '',
    venueaddress: '',
    typeofevent: '',
    orientationDate: '',
    startDate: '',
    organizer: '',
    coreValuesIntegration: '',
    objectives: '',
    communicationsAndPromotions: '',
    facilitiesConsiderations: '',
    eventManagementHead: '',
    eventCommittees: '',
    health: '',
    safetyattendees: '',
    emergencyfirstaid: '',
    firesafety: '',
    weather: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePDF();
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Adding text for each form field
    doc.setFontSize(12);
    doc.text('Activity Application Form', 10, 10);
    doc.text(`Event Location: ${formData.eventlocation}`, 10, 20);
    doc.text(`Event Title: ${formData.eventtitle}`, 10, 30);
    doc.text(`Venue Address: ${formData.venueaddress}`, 10, 40);
    doc.text(`Type of Event: ${formData.typeofevent}`, 10, 50);
    doc.text(`Event Date: ${formData.orientationDate}`, 10, 60);
    doc.text(`Event Time: ${formData.startDate}`, 10, 70);
    doc.text(`Organizer: ${formData.organizer}`, 10, 80);
    doc.text(`Core Values Integration: ${formData.coreValuesIntegration}`, 10, 90);
    doc.text(`Objectives: ${formData.objectives}`, 10, 100);
    doc.text(`Communications And Promotions: ${formData.communicationsAndPromotions}`, 10, 110);
    doc.text(`Facilities Considerations: ${formData.facilitiesConsiderations}`, 10, 120);
    doc.text(`Event Management Head: ${formData.eventManagementHead}`, 10, 130);
    doc.text(`Event committees & members: ${formData.eventCommittees}`, 10, 150);
    doc.text(`Health: ${formData.health}`, 10, 170);
    doc.text(`Safety of Attendees: ${formData.safetyattendees}`, 10, 190);
    doc.text(`Emergency First Aid: ${formData.emergencyfirstaid}`, 10, 210);
    doc.text(`Fire Safety: ${formData.firesafety}`, 10, 230);
    doc.text(`Weather: ${formData.weather}`, 10, 250);

    doc.save('Activity_Application_Form.pdf');
  };

  return (
    <form className="onboarding-form" onSubmit={handleSubmit}>
      <h1 style={{ textAlign: 'center', color: '#0055a2' }}>Activity Application Form</h1>
      <div className="section">
        <h2 className="section-header">Event Details</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Event Title<span className="required">*</span></label>
            <input type="text" name="eventtitle" value={formData.eventtitle} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Event Location</label>
            <select name="eventlocation" value={formData.eventlocation} onChange={handleChange}>
              <option value=""></option>
              <option value="ON CAMPUS">ON CAMPUS</option>
              <option value="OFF CAMPUS">OFF CAMPUS</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Venue Address<span className="required">*</span></label>
            <input type="text" name="venueaddress" value={formData.venueaddress} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Type of Event</label>
            <select name="typeofevent" value={formData.typeofevent} onChange={handleChange}>
              <option value=""></option>
              <option value="Student Organizations Activity">Student Organizations Activity</option>
              <option value="Special Event">Special Event</option>
              <option value="University/School Activity">University/School Activity</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Event Date</label>
            <input type="date" name="orientationDate" value={formData.orientationDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Event Time<span className="required">*</span></label>
            <input type="time" name="startDate" value={formData.startDate} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Organizer<span className="required">*</span></label>
            <textarea name="organizer" value={formData.organizer} onChange={handleChange} rows="4" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Core Values Integration<span className="required">*</span></label>
            <textarea name="coreValuesIntegration" value={formData.coreValuesIntegration} onChange={handleChange} rows="4" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Objectives<span className="required">*</span></label>
            <textarea name="objectives" value={formData.objectives} onChange={handleChange} rows="4" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Communications And Promotions Required<span className="required">*</span></label>
            <textarea name="communicationsAndPromotions" value={formData.communicationsAndPromotions} onChange={handleChange} rows="4" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Facilities Considerations<span className="required">*</span></label>
            <textarea name="facilitiesConsiderations" value={formData.facilitiesConsiderations} onChange={handleChange} rows="4" />
          </div>
        </div>
      </div>
      <div className="section">
        <h2 className="section-header">Event Management Team</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Event Management Head<span className="required">*</span></label>
            <textarea name="eventManagementHead" value={formData.eventManagementHead} onChange={handleChange} rows="4" />
          </div>
          <div className="form-group">
            <label>Event committees & members<span className="required">*</span></label>
            <textarea name="eventCommittees" value={formData.eventCommittees} onChange={handleChange} rows="4" />
          </div>
        </div>
      </div>
      <div className="section">
        <h2 className="section-header">Risk Assessments</h2>
        <div className="form-row">
        <div className="form-group">
            <label>Health<span className="required">*</span></label>
            <textarea name="health" value={formData.health} onChange={handleChange} rows="4" style={{height:'50px'}} />
          </div>
        </div>
        <div className="form-row">
        <div className="form-group">
            <label>Safety of Attendees<span className="required">*</span></label>
            <textarea name="safetyattendees" value={formData.safetyattendees} onChange={handleChange} rows="4" style={{height:'50px'}}/>
          </div>
        </div>
        <div className="form-row">
        <div className="form-group">
            <label>Emergency First Aid<span className="required">*</span></label>
            <textarea name="emergencyfirstaid" value={formData.emergencyfirstaid} onChange={handleChange} rows="4" style={{height:'50px'}}/>
          </div>
        </div>
        <div className="form-row">
        <div className="form-group">
            <label>Fire Safety<span className="required">*</span></label>
            <textarea name="firesafety" value={formData.firesafety} onChange={handleChange} rows="4" style={{height:'50px'}}/>
          </div>
        </div>
        <div className="form-row">
        <div className="form-group">
            <label>Weather<span className="required">*</span></label>
            <textarea name="weather" value={formData.weather} onChange={handleChange} rows="4" style={{height:'50px'}}/>
          </div>
        </div>
      </div>
      <button type="submit">Save</button>
    </form>
  );
}

export default Waiver;
