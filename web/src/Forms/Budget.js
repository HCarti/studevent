import React, { useState, useEffect } from "react";
import './Budget.css';
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useNavigate } from "react-router-dom";

const Budget = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!formId;
  const [loading, setLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    nameOfRso: "",
    eventTitle: "",
    grandTotal: 0
  });
  const [rows, setRows] = useState([{ 
    quantity: "", 
    unit: "", 
    description: "", 
    unitCost: "", 
    totalCost: "" 
  }]);
  const [formSent, setFormSent] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);

  // Notification component
  const Notification = ({ message }) => (
    <div className="notification">
      {message}
    </div>
  );

  // Fetch form data in edit mode
  useEffect(() => {
    const fetchFormData = async () => {
      if (!isEditMode) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://studevent-server.vercel.app/api/forms/${formId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error('Failed to fetch form');
        
        const data = await response.json();
        
        setFormData({
          nameOfRso: data.nameOfRso || data.formData?.nameOfRso || "",
          eventTitle: data.eventTitle || data.formData?.eventTitle || "",
          grandTotal: data.grandTotal || data.formData?.grandTotal || 0
        });
        
        setRows(data.items || data.formData?.items || [{ 
          quantity: "", unit: "", description: "", unitCost: "", totalCost: "" 
        }]);
      } catch (error) {
        console.error('Error fetching form:', error);
        alert('Failed to load form data');
        navigate('/submitted-forms');
      } finally {
        setLoading(false);
      }
    };

    // Pre-fill user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setFormData(prev => ({
        ...prev,
        nameOfRso: userData.role === 'Organization' ? userData.organizationName || "" : "",
      }));
    }

    fetchFormData();
  }, [formId, isEditMode, navigate]);

  // Row management functions
  const addRow = () => {
    setRows([...rows, { 
      quantity: "", 
      unit: "", 
      description: "", 
      unitCost: "", 
      totalCost: "" 
    }]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const newRows = [...rows];
      newRows.splice(index, 1);
      setRows(newRows);
      calculateGrandTotal(newRows);
    }
  };

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
    
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = parseFloat(newRows[index].quantity) || 0;
      const unitCost = parseFloat(newRows[index].unitCost) || 0;
      newRows[index].totalCost = (quantity * unitCost).toFixed(2);
    }
    
    setRows(newRows);
    calculateGrandTotal(newRows);
  };

  const calculateGrandTotal = (rowsArray) => {
    const total = rowsArray.reduce((sum, row) => {
      return sum + (parseFloat(row.totalCost) || 0);
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      grandTotal: total.toFixed(2)
    }));
  };

  const renderRowInputs = () => {
    return rows.map((row, index) => (
      <div key={index} className="budget-row">
        <input
          type="number"
          value={row.quantity}
          onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
          placeholder="Qty"
          min="0"
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
          min="0"
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

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to submit the form');
      return;
    }
  
    // Validate required fields
    if (!formData.nameOfRso.trim()) {
      alert("Name of RSO is required");
      return;
    }
  
    const validRows = rows.filter(row => row.quantity && row.unitCost);
    if (validRows.length === 0) {
      alert("Please add at least one valid budget item");
      return;
    }
  
    // Prepare the payload with both structures for compatibility
    const payload = {
      formType: 'Budget',
      nameOfRso: formData.nameOfRso.trim(),
      eventTitle: formData.eventTitle.trim() || 'Budget Proposal',
      items: validRows.map(row => ({
        quantity: Number(row.quantity),
        unit: row.unit.trim(),
        description: row.description.trim(),
        unitCost: Number(row.unitCost),
        totalCost: Number(row.totalCost)
      })),
      grandTotal: Number(formData.grandTotal),
      // Nested structure for backend compatibility
      formData: {
        nameOfRso: formData.nameOfRso.trim(),
        eventTitle: formData.eventTitle.trim() || 'Budget Proposal',
        items: validRows.map(row => ({
          quantity: Number(row.quantity),
          unit: row.unit.trim(),
          description: row.description.trim(),
          unitCost: Number(row.unitCost),
          totalCost: Number(row.totalCost)
        })),
        grandTotal: Number(formData.grandTotal)
      }
    };
  
    try {
      const url = isEditMode 
        ? `https://studevent-server.vercel.app/api/forms/${formId}`
        : 'https://studevent-server.vercel.app/api/forms';
      
      const method = isEditMode ? 'PUT' : 'POST';
  
      console.log("Submitting payload:", payload); // Debug log
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Submission successful:", result); // Debug log
  
      setFormSent(true);
      setNotificationVisible(true);
      
      setTimeout(() => {
        setNotificationVisible(false);
        navigate('/submitted-forms');
      }, 3000);
  
      if (!isEditMode) {
        setFormData({ nameOfRso: "", eventTitle: "", grandTotal: 0 });
        setRows([{ quantity: "", unit: "", description: "", unitCost: "", totalCost: "" }]);
      }
  
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'An error occurred while submitting the form.');
    }
  };

  if (loading) {
    return <div className="budget-form">Loading form data...</div>;
  }

  return (
    <div className="budget-form">
      <h1>Budget Proposal</h1>
      {notificationVisible && (
        <Notification message={`Form ${isEditMode ? 'updated' : 'submitted'} successfully`} />
      )}
      
      <div>
        <label>Name of RSO:</label>
        <input 
          type="text" 
          name="nameOfRso" 
          value={formData.nameOfRso} 
          onChange={handleChange} 
          required
        />
      </div>

      <div>
        <label>Event Title:</label>
        <input 
          type="text" 
          name="eventTitle" 
          value={formData.eventTitle} 
          onChange={handleChange} 
          placeholder="Optional"
        />
      </div>

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

      <div className="grand-total">
        <label>Grand Total:</label>
        <input 
          type="number" 
          value={formData.grandTotal} 
          readOnly 
        />
      </div>

      <button type="button" onClick={handleSubmit} disabled={loading}>
        {isEditMode ? 'Update Budget' : 'Submit Budget'}
      </button>
    </div>
  );
};

export default Budget;