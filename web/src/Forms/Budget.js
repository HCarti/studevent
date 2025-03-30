import React, {useState, useEffect} from "react";
import './Budget.css';
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";


const Budget  = () => {
  const { formId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = !!formId;
  const [loading, setLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    nameOfRso: "",
    eventTitle: "",
    grandTotal: 0 // Will calculate from row totals
  });

  useEffect(() => {
    const fetchFormData = async () => {
      if (!isEditMode) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://studevent-server.vercel.app/api/forms/${formId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch form');
        
        const data = await response.json();
        
        setFormData({
          nameOfRso: data.nameOfRso,
          eventTitle: data.eventTitle,
          grandTotal: data.grandTotal
        });
        
        setRows(data.items || []);
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
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to submit the form');
        return;
      }
    
      // Validate required fields
      if (!formData.nameOfRso) {
        alert("Name of RSO is required");
        return;
      }
    
      const validRows = rows.filter(row => row.quantity && row.unitCost);
      if (validRows.length === 0) {
        alert("Please add at least one valid budget item");
        return;
      }
    
      // Prepare budgetData
      const budgetData = {
        formType: 'Budget',
        nameOfRso: formData.nameOfRso,
        eventTitle: formData.eventTitle || 'Budget Proposal',
        items: validRows.map(row => ({
          quantity: Number(row.quantity),
          unit: row.unit,
          description: row.description,
          unitCost: Number(row.unitCost),
          totalCost: Number(row.totalCost)
        })),
        grandTotal: Number(formData.grandTotal)
      };
    
      console.log("Submitting:", budgetData);
    
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
          body: JSON.stringify(budgetData),
        });
    
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `Server responded with status ${response.status}`
          );
        }
    
        const result = await response.json();
        console.log("Full response:", result);
        
        setFormSent(true);
        setNotificationVisible(true);
        
        setTimeout(() => {
          setNotificationVisible(false);
          navigate('/submitted-forms');
        }, 3000);
    
      } catch (error) {
        console.error('Submission error:', error);
        alert(`Error: ${error.message}\nCheck console for details.`);
      }
    };


 return (
    <div className="budget-form">
      <h1>Budget Proposal</h1>
      {notificationVisible && (
  <Notification message={`Form ${isEditMode ? 'updated' : 'submitted'} successfully`} />
)}
      {/* Main form fields */}
      <div>
        <label>Name of RSO:</label>
        <input 
          type="text" 
          name="nameOfRso" 
          value={formData.nameOfRso} 
          onChange={handleChange} 
          readOnly
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
  {isEditMode ? 'Update Budget' : 'Submit Budget'}
</button>
    </div>
  );
};

export default Budget; 
