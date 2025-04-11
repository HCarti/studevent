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
    formType: "Budget",
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
  const [errors, setErrors] = useState({
    nameOfRso: false,
    rows: []
  });

  // Enhanced Notification component with minimalistic design
  const Notification = ({ message, type = "success" }) => (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );

  // Error message component
  const ErrorMessage = ({ message, targetId }) => (
    <div 
      className="error-tooltip" 
      data-target={targetId}
      role="tooltip"
    >
      {message}
      <span className="error-tooltip-arrow"></span>
    </div>
  );

  // Validate a single row
  const validateRow = (row) => {
    return {
      quantity: !row.quantity || isNaN(row.quantity),
      unit: !row.unit?.trim(),
      description: !row.description?.trim(),
      unitCost: !row.unitCost || isNaN(row.unitCost)
    };
  };

  // Validate all rows
  const validateAllRows = () => {
    return rows.map(row => validateRow(row));
  };

  // Validate the entire form
  const validateForm = () => {
    const nameOfRsoError = !formData.nameOfRso?.trim();
    const rowErrors = validateAllRows();
    
    setErrors({
      nameOfRso: nameOfRsoError,
      rows: rowErrors
    });

    // Check if any row has all required fields filled
    const hasValidRows = rowErrors.some(rowError => 
      !rowError.quantity && !rowError.unit && !rowError.description && !rowError.unitCost
    );

    return !nameOfRsoError && hasValidRows;
  };

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
          formType: "Budget", // Add this line
          nameOfRso: data.nameOfRso || data.formData?.nameOfRso || "",
          eventTitle: data.eventTitle || data.formData?.eventTitle || "",
          grandTotal: data.grandTotal || data.formData?.grandTotal || 0
        });
        
        setRows(data.items || data.formData?.items || [{ 
          quantity: "", unit: "", description: "", unitCost: "", totalCost: "" 
        }]);
      } catch (error) {
        console.error('Error fetching form:', error);
        setNotificationVisible(true);
        setTimeout(() => {
          setNotificationVisible(false);
          navigate('/submitted-forms');
        }, 3000);
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
    // Add empty error object for the new row
    setErrors(prev => ({
      ...prev,
      rows: [...prev.rows, { quantity: false, unit: false, description: false, unitCost: false }]
    }));
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const newRows = [...rows];
      newRows.splice(index, 1);
      setRows(newRows);
      calculateGrandTotal(newRows);
      
      // Remove corresponding error object
      const newRowErrors = [...errors.rows];
      newRowErrors.splice(index, 1);
      setErrors(prev => ({
        ...prev,
        rows: newRowErrors
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when typing
    if (name === 'nameOfRso') {
      setErrors(prev => ({
        ...prev,
        nameOfRso: false
      }));
    }
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
    
    // Clear error when typing
    if (errors.rows[index]) {
      const newRowErrors = [...errors.rows];
      newRowErrors[index] = {
        ...newRowErrors[index],
        [field]: false
      };
      setErrors(prev => ({
        ...prev,
        rows: newRowErrors
      }));
    }
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
    return rows.map((row, index) => {
      const rowErrors = errors.rows[index] || {};
      const rowId = `row-${index}`;
      
      return (
        <div key={index} className="budget-row" id={rowId}>
          <div className="input-group">
            <input
              type="number"
              id={`quantity-${index}`}
              value={row.quantity}
              onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
              placeholder="Qty"
              min="0"
              className={rowErrors.quantity ? 'error' : ''}
            />
            {rowErrors.quantity && (
              <ErrorMessage 
                message="Quantity is required" 
                targetId={`quantity-${index}`}
              />
            )}
          </div>
          
          <div className="input-group">
            <input
              type="text"
              id={`unit-${index}`}
              value={row.unit}
              onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
              placeholder="Unit"
              className={rowErrors.unit ? 'error' : ''}
            />
            {rowErrors.unit && (
              <ErrorMessage 
                message="Unit is required" 
                targetId={`unit-${index}`}
              />
            )}
          </div>
          
          <div className="input-group">
            <input
              type="text"
              value={row.description}
              onChange={(e) => handleRowChange(index, 'description', e.target.value)}
              placeholder="Description"
              className={rowErrors.description ? 'error' : ''}
            />
            {rowErrors.description && (
              <ErrorMessage 
                message="Description is required" 
                targetId={`Description-${index}`}
              />
            )}
          </div>
          
          <div className="input-group">
            <input
              type="number"
              step="0.01"
              min="0"
              value={row.unitCost}
              onChange={(e) => handleRowChange(index, 'unitCost', e.target.value)}
              placeholder="Unit Cost"
              className={rowErrors.unitCost ? 'error' : ''}
            />
            {rowErrors.unitCost && (
              <ErrorMessage 
                message="Unit Cost is required" 
                targetId={`Unit Cost-${index}`}
              />
            )}
          </div>
          
          <div className="input-group">
            <input
              type="number"
              step="0.01"
              value={row.totalCost}
              readOnly
              placeholder="Total"
            />
          </div>
          
          <button type="button" onClick={() => removeRow(index)} className="remove-btn">
            Remove
          </button>
        </div>
      );
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setNotificationVisible(true);
      setTimeout(() => setNotificationVisible(false), 3000);
      return;
    }
  
    // Filter out empty rows (where all fields are empty)
    const validRows = rows.filter(row => 
      row.quantity || row.unit || row.description || row.unitCost
    ).map(row => ({
      quantity: Number(row.quantity),
      unit: row.unit.trim(),
      description: row.description.trim(),
      unitCost: Number(row.unitCost),
      totalCost: Number(row.totalCost || row.quantity * row.unitCost)
    }));
  
    // Prepare payload
    const payload = {
      formType: 'Budget',
      nameOfRso: formData.nameOfRso.trim(),
      eventTitle: formData.eventTitle?.trim() || 'Budget Proposal',
      items: validRows,
      grandTotal: Number(formData.grandTotal) || 
        validRows.reduce((sum, row) => sum + (row.quantity * row.unitCost), 0)
    };
  
    try {
      const url = isEditMode 
        ? `https://studevent-server.vercel.app/api/forms/${formId}`
        : 'https://studevent-server.vercel.app/api/forms';
      
      const method = isEditMode ? 'PUT' : 'POST';
  
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
        throw new Error(
          errorData.message || 
          errorData.error || 
          `Server responded with status ${response.status}`
        );
      }
  
      setFormSent(true);
      setNotificationVisible(true);
      
      setTimeout(() => {
        setNotificationVisible(false);
        if (!isEditMode) {
          navigate('/');
        }
      }, 3000);
  
      if (!isEditMode) {
        setFormData({
          nameOfRso: "",
          eventTitle: "",
          grandTotal: 0
        });
        setRows([{ 
          quantity: "", 
          unit: "", 
          description: "", 
          unitCost: "", 
          totalCost: "" 
        }]);
      }
  
    } catch (error) {
      console.error('Submission error:', error);
      setNotificationVisible(true);
      setTimeout(() => setNotificationVisible(false), 3000);
    }
  };

  return (
    <div className="budget-form">
      <h1>Budget Proposal</h1>
      {notificationVisible && (
        <Notification 
          message={formSent 
            ? `Form ${isEditMode ? 'updated' : 'submitted'} successfully` 
            : 'Please log in to submit the form'}
          type={formSent ? "success" : "error"}
        />
      )}
      
      <div className="form-group">
        <label>Name of RSO:</label>
        <div className="input-group-nameofRSO">
          <input 
            type="text" 
            name="nameOfRso" 
            value={formData.nameOfRso} 
            onChange={handleChange} 
            readOnly
            className={errors.nameOfRso ? 'error' : ''}
          />
          {errors.nameOfRso && <ErrorMessage message="This field is required" />}
        </div>
      </div>

      <div className="budget-items">
        <div className="budget-header">
          <span>Quantity</span>
          <span className="others">Unit</span>
          <span className="others">Description</span>
          <span className="others2">Unit Cost</span>
          <span className="others2">Total</span>
          <span>Action</span>
        </div>
        
        {renderRowInputs()}
        
        <button type="button" onClick={addRow} className="add-row-btn">
          Add Row
        </button>
      </div>

      <div className="form-group">
        <label>Grand Total:</label>
        <div className="input-group">
          <input 
            type="number" 
            value={formData.grandTotal} 
            readOnly 
          />
        </div>
      </div>

      <button 
        type="button" 
        onClick={handleSubmit} 
        disabled={loading}
        className="submit-btn-bdg"
      >
        {loading ? 'Processing...' : isEditMode ? 'Update Budget' : 'Submit Budget'}
      </button>
    </div>
  );
};

export default Budget;