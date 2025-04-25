import React, { useState, useEffect } from "react";
import './Budget.css';
import { useParams, useNavigate, useLocation } from "react-router-dom";

const BudgetForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!formId;
  const [loading, setLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    nameOfRso: "",
    eventTitle: "",
    grandTotal: 0,
    targetFormType: location.state?.targetFormType || null,
    targetFormId: location.state?.targetFormId || null
  });
  
  const [rows, setRows] = useState([{ 
    quantity: "", 
    unit: "", 
    description: "", 
    unitCost: "", 
    totalCost: "" 
  }]);
  const [formSent, setFormSent] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: "", type: "" });
  const [errors, setErrors] = useState({
    nameOfRso: false,
    rows: []
  });

  // Notification component
  const Notification = ({ message, type = "success" }) => (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );

  // Error message component
  const ErrorMessage = ({ message, targetId }) => (
    <div className="error-tooltip" data-target={targetId}>
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
    const eventTitleError = !formData.eventTitle?.trim();
    
    setErrors({
      nameOfRso: nameOfRsoError,
      eventTitle: eventTitleError,
      rows: rowErrors
    });

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
        const response = await fetch(`https://studevent-server.vercel.app/api/budgets/${formId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error('Failed to fetch budget');
        
        const data = await response.json();
        
        setFormData({
          ...formData,
          nameOfRso: data.nameOfRso || "",
          eventTitle: data.eventTitle || "",
          grandTotal: data.grandTotal || 0,
          targetFormType: data.formType || null,
          targetFormId: data.associatedForm || null
        });
        
        setRows(data.items || [{ 
          quantity: "", 
          unit: "", 
          description: "", 
          unitCost: "", 
          totalCost: "" 
        }]);
      } catch (error) {
        showNotification('Error fetching budget data', 'error');
        setTimeout(() => navigate('/submitted-forms'), 3000);
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

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ visible: true, message, type });
    setTimeout(() => setNotification({ visible: false, message: "", type: "" }), 3000);
  };

  // Row management functions
  const addRow = () => {
    setRows([...rows, { 
      quantity: "", 
      unit: "", 
      description: "", 
      unitCost: "", 
      totalCost: "" 
    }]);
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
          
          <button type="button" onClick={() => removeRow(index)} className="bgd-remove-btn">
            Remove
          </button>
        </div>
      );
    });
  };
  const handleSubmit = async () => {
    // Set loading state
    setLoading(true);
    
    if (!validateForm()) {
      showNotification('Please fill all required fields', 'error');
      setLoading(false);
      return;
    }
  
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
      showNotification('Please log in to submit the form', 'error');
      setLoading(false);
      return;
    }
  
    try {
      // Prepare the budget data
      const budgetData = {
        nameOfRso: formData.nameOfRso.trim(),
        eventTitle: formData.eventTitle?.trim() || 'Budget Proposal',
        items: rows.map(row => ({
          quantity: Number(row.quantity),
          unit: row.unit.trim(),
          description: row.description.trim(),
          unitCost: Number(row.unitCost),
          totalCost: Number(row.quantity * row.unitCost)
        })),
        grandTotal: rows.reduce((sum, row) => sum + (row.quantity * row.unitCost), 0),
        createdBy: user._id,
        organization: user.organizationId || user._id,
        associatedForm: formData.targetFormId || null,
        formType: formData.targetFormType || null,
        isActive: true,
        status: 'draft'
      };

      // Determine if we're submitting or saving as draft
      const isSubmission = location.pathname.includes('/submit');
      if (isSubmission) {
        budgetData.status = 'submitted';
      }
  
      const url = isEditMode 
        ? `https://studevent-server.vercel.app/api/budgets/${formId}`
        : 'https://studevent-server.vercel.app/api/budgets/submit';
  
      const method = isEditMode ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
  
      const result = await response.json();
      setFormSent(true);
      
      showNotification(
        `Budget ${isEditMode ? 'updated' : isSubmission ? 'submitted' : 'saved'} successfully`, 
        'success'
      );

      // Handle navigation - modified this section
      if (location.state?.returnPath) {
        // 1. FIRST try to load from localStorage
        let activityData = null;
        try {
          const savedData = localStorage.getItem('activityFormDraft');
          if (savedData) {
            activityData = JSON.parse(savedData);
            console.log('Loaded from localStorage:', activityData);
          }
        } catch (e) {
          console.error('Failed to parse localStorage data:', e);
        }
    
        // 2. Fall back to navigation state if needed
        if (!activityData && location.state.activityFormData) {
          activityData = location.state.activityFormData;
          console.log('Fell back to navigation state data');
        }
    
        // 3. Navigate back with the data
        setTimeout(() => {
          navigate(location.state.returnPath, {
            state: {
              selectedBudget: result,
              activityFormData: activityData,
              fromBudgetSubmission: true
            },
            replace: true
          });
    
          // 4. Clean up localStorage AFTER navigation is initiated
          localStorage.removeItem('activityFormDraft');
        }, 1500);
    }
    else if (formData.targetFormId) {
        setTimeout(() => {
          navigate(`/activity/${formData.targetFormType.toLowerCase()}/${formData.targetFormId}`);
        }, 1500);
      }
      else if (isSubmission) {
        setTimeout(() => navigate('/budgets'), 1500);
      }
  
    } catch (error) {
      console.error('Submission error:', error);
      showNotification(
        error.message || `Failed to ${isEditMode ? 'update' : 'create'} budget`, 
        'error'
      );
    } finally {
      setLoading(false);
    }
};
  
  return (
    <div className="budget-form">
      <h1>
        {formData.targetFormType 
          ? `Budget Proposal for ${formData.targetFormType}` 
          : 'Budget Proposal'}
      </h1>
      
      {notification.visible && (
        <Notification message={notification.message} type={notification.type} />
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

      <div className="form-group">
          <label>Event Title:</label>
          <div className="input-group">
            <input 
              type="text" 
              name="eventTitle"
              value={formData.eventTitle} 
              onChange={handleChange}
              placeholder="Enter event title"
              className={errors.eventTitle ? 'error' : ''}
            />
             {errors.eventTitle && <ErrorMessage message="This field is required" />}
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

      <div className="form-actions">        
        <button 
          type="button" 
          onClick={handleSubmit} 
          disabled={loading}
          className="submit-btn-bdg"
        >
          {loading ? 'Processing...' : isEditMode ? 'Update Budget' : 'Submit Budget'}
        </button>
      </div>
    </div>
  );
};

export default BudgetForm;