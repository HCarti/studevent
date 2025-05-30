import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './AdminFormView.css';

const AdminFormView = () => {
  const [submittedForms, setSubmittedForms] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmittedForms = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from localStorage
        if (!token) {
          throw new Error("Token is missing!"); 
        }
  
        const response = await fetch("https://studevent-server.vercel.app/api/forms/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Send token in Authorization header
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, message: ${await response.text()}`);
        }
  
        const data = await response.json();
        console.log("Fetched data:", data);
  
        if (Array.isArray(data)) {
          setSubmittedForms(data);
        } else {
          console.error("Expected an array but received:", data);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
        setError(error.message);
      }
    };
  
    fetchSubmittedForms();
  }, []);
  

  const handleRedirectToProgressTracker = (form) => {
    navigate(`/progtrack/${form._id}`, { state: { form } }); 
  };

  return (
    <div className="admin-form-view">

      <div className="form-list">
        <h2>Forms List</h2>
        {error && <p className="error-message">{error}</p>}
        {(submittedForms) && submittedForms.length === 0 ? (
          <p>No forms have been submitted yet.</p>
        ) : (
          <ul>
            {submittedForms.map((form) => (
              <li key={form._id} style={{ listStyleType: 'none' }}>
                <button
                  className="admin-button"
                  onClick={() => handleRedirectToProgressTracker(form)}
                  style={{
                    padding: '10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'block',
                    width: '60%',
                    marginBottom: '10px',
                    textAlign: 'left'
                  }}
                >
                  {/* Check if organizationName is defined before accessing */}
                  {form.studentOrganization ? form.studentOrganization.organizationName : 'Unknown Organization'} - {form.eventTitle} ({new Date(form.applicationDate).toLocaleDateString()})
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminFormView;
