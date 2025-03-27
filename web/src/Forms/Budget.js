import React, {useState, useEffect} from "react";
import axios from 'axios';
import './Budget.css';
import moment from 'moment';
import { FaCheck } from 'react-icons/fa'; // Import check icon from react-icons
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from "@react-pdf/renderer";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NU_logo from "../Images/NU_logo.png";
import { useNavigate } from 'react-router-dom';
import { MdOutlineContactPage } from "react-icons/md";

const Budget  = () => {
  const [formData, setFormData] = useState({
    nameOfRso: "",
    eventTitle: "",
    grandTotal: 0 // Will calculate from row totals
  });

  const [rows, setRows] = useState([
    { 
      quantity: "", 
      unit: "", 
      description: "", 
      unitCost: "", 
      totalCost: "" 
    }
  ]);

   // Add a new row
   const addRow = () => {
    setRows([...rows, { 
      quantity: "", 
      unit: "", 
      description: "", 
      unitCost: "", 
      totalCost: "" 
    }]);
  };

  // Remove a row
  const removeRow = (index) => {
    if (rows.length > 1) {
      const newRows = [...rows];
      newRows.splice(index, 1);
      setRows(newRows);
      calculateGrandTotal(newRows);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false); // State to control notification visibility

  const Notification = ({ message }) => (
    <div className="notification">
      {message}
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    
    // Calculate row total if quantity or unitCost changes
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = parseFloat(newRows[index].quantity) || 0;
      const unitCost = parseFloat(newRows[index].unitCost) || 0;
      newRows[index].totalCost = (quantity * unitCost).toFixed(2);
    }
    
    setRows(newRows);
    calculateGrandTotal(newRows);
  };

  // Calculate grand total from all rows
  const calculateGrandTotal = (rowsArray) => {
    const total = rowsArray.reduce((sum, row) => {
      return sum + (parseFloat(row.totalCost) || 0);
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      grandTotal: total.toFixed(2)
    }));
  };
  
  // Render row inputs
  const renderRowInputs = () => {
    return rows.map((row, index) => (
      <div key={index} className="budget-row">
        <input
          type="number"
          value={row.quantity}
          onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
          placeholder="Qty"
        />
        
        <input
          type="text"
          value={row.unit}
          onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
          placeholder="Unit"
        />
        
        <input
          type="text"
          value={row.description}
          onChange={(e) => handleRowChange(index, 'description', e.target.value)}
          placeholder="Description"
        />
        
        <input
          type="number"
          step="0.01"
          value={row.unitCost}
          onChange={(e) => handleRowChange(index, 'unitCost', e.target.value)}
          placeholder="Unit Cost"
        />
        
        <input
          type="number"
          step="0.01"
          value={row.totalCost}
          readOnly
          placeholder="Total"
        />
        
        <button type="button" onClick={() => removeRow(index)}>
          Remove
        </button>
      </div>
    ));
  };

   // Fetch the logged-in user's organization name on component mount
    // Pre-fill `quantity` with `organizationName` if logged in user is an organization
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setFormData(prevData => ({
          ...prevData,
          nameOfRso: userData.role === 'Organization' ? userData.organizationName || "" : "",
        }));
      }
    }, []);
    
    

    const handleSubmit = async () => {
      const budgetData = {
        formType: 'Budget',
        nameOfRso: formData.nameOfRso,
        eventTitle: formData.eventTitle,
        items: rows,
        grandTotal: formData.grandTotal
      };

    const eventStart = moment(formData.eventStartDate);
    const eventEnd = moment(formData.eventEndDate);

    if (!eventStart.isValid() || !eventEnd.isValid()) {
      alert("Invalid event start or end date.");
      return;
    }

    if (eventEnd.isBefore(eventStart)) {
      alert("End date must be after the start date.");
      return;
    }

    const token = localStorage.getItem('token'); // Ensure you have previously set this during login

    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    console.log('Token:', token); // Check if token is defined


    // Convert fields to expected data types for the backend schema
    const eventData = {
      ...formData,
      nameOfRso: formData.nameOfRso,
      eventTitle: formData.eventTitle,
      quantity: formData.quantity, // Ensure this field is properly formatted as an ObjectId or handled by the backend
      description: formData.description,
      unitCost: Number(formData.unitCost), // Ensure it's converted to a number if necessary
      totalCost: formData.totalCost,
    };
    

    try {
      const response = await fetch('https://studevent-server.vercel.app/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Uncomment if needed
        },
        body: JSON.stringify(eventData),
      });
    
      if (!response.ok) {
        // Check if the response is JSON before trying to parse it
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || 'Submission failed'}`);
        } else {
          const text = await response.text();
          alert(`Error: ${text}`);
        }
        return;
      }
    
      const result = await response.json();
    
      if (result._id) {
        setEventId(result._id);
      }
      setFormSent(true);

      setFormSent(true); // Mark form as submitted
      setNotificationVisible(true); // Show notification
      setTimeout(() => {
        setNotificationVisible(false); // Hide notification after 3 seconds
      }, 3000);
    
      // Reset form data
      setFormData({
        nameOfRso: "",
        eventTitle: "",
        quantity: "",
        unit:"",
        description: "",
        unitCost: "",
        totalCost: "",
      });
    
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    }
  };    

 return (
    <div className="budget-form">
      <h1>Budget Proposal</h1>
      {notificationVisible && <Notification message="Form submitted successfully" />}
      {/* Main form fields */}
      <div>
        <label>Name of RSO:</label>
        <input 
          type="text" 
          name="nameOfRso" 
          value={formData.nameOfRso} 
          onChange={handleChange} 
        />
      </div>

      {/* Budget items table */}
      <div className="budget-items">
        <div className="budget-header">
          <span>Quantity</span>
          <span>Unit</span>
          <span>Description</span>
          <span>Unit Cost</span>
          <span>Total</span>
          <span>Action</span>
        </div>
        
        {renderRowInputs()}
        
        <button type="button" onClick={addRow}>
          Add Row
        </button>
      </div>

      {/* Grand total */}
      <div className="grand-total">
        <label>Grand Total:</label>
        <input 
          type="number" 
          value={formData.grandTotal} 
          readOnly 
        />
      </div>

      <button type="button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default Budget; 
