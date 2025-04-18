import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './ProgressTracker.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; // Import Material-UI spinner
import { PDFDownloadLink } from '@react-pdf/renderer'; // Import PDFDownloadLink
import ActivityPdf from '../PdfForms/ActivityPdf'; // Import the PDF component
import BudgetPdf from '../PdfForms/BudgetPdf'; // Add this import
import ProjectPdf from '../PdfForms/ProjectPdf'; // Add this import

const ProgressTracker = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const form = state?.form;
    const { formId } = useParams();
    const formData = state?.form; // Access the form data
    const [formDetails, setFormDetails] = useState(null);   
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const [currentStep, setCurrentStep] = useState(0);
    const [trackerData, setTrackerData] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isApprovedChecked, setIsApprovedChecked] = useState(false);
    const [isDeclinedChecked, setIsDeclinedChecked] = useState(false);
    const [reviewSignatures, setReviewSignatures] = useState({}); // NEW: State for storing all review signatures
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    useEffect(() => {
        console.log("Retrieving user data from localStorage...");
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("Parsed user data:", parsedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
                setUser(null);
            }
        } else {
            console.warn("No user data found in localStorage.");
        }
    }, []);

    // NEW: Function to fetch review signatures
    const fetchReviewSignatures = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://studevent-server.vercel.app/api/tracker/signatures/${formId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setReviewSignatures(data);
        } catch (error) {
            console.error("Error fetching review signatures:", error);
        }
    };

    // NEW: Function to handle feedback submission
    const handleFeedbackSubmit = async () => {
      if (!feedbackText.trim()) {
          setFeedbackError('Please enter your feedback before submitting');
          return;
      }
  
      setIsSubmittingFeedback(true);
      setFeedbackError('');
  
      try {
          const token = localStorage.getItem("token");
          const response = await fetch('https://studevent-server.vercel.app/api/feedback', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                  formId,
                  feedback: feedbackText,
                  formType: formDetails?.formType || 'Activity', // Adjust based on your form type
              }),
          });
  
          if (!response.ok) {
              throw new Error('Failed to submit feedback');
          }
  
          setFeedbackSubmitted(true);
          setFeedbackText('');
      } catch (error) {
          console.error('Error submitting feedback:', error);
          setFeedbackError('Failed to submit feedback. Please try again later.');
      } finally {
          setIsSubmittingFeedback(false);
      }
  };


    useEffect(() => {
        if (!formId) return;

        const fetchTrackerData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found. Please log in again.");

                const response = await fetch(`https://studevent-server.vercel.app/api/tracker/${formId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error(`Error fetching tracker data: ${response.statusText}`);

                const data = await response.json();
                console.log("Fetched tracker data:", data);

                setTrackerData(data);
                setCurrentStep(String(data.currentStep));
            } catch (error) {
                console.error("Error fetching tracker data:", error.message);
            } finally {
                setLoading(false); // Stop loading after fetching data
            }
        };

        fetchTrackerData();
    }, [formId]);

    useEffect(() => {
        const fetchFormData = async () => {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://studevent-server.vercel.app/api/forms/${formId}`, {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            const data = await response.json();
            setFormDetails(data);

            // Fetch review signatures
            await fetchReviewSignatures();
          } catch (error) {
            console.error("Error fetching form data:", error);
          }
        };
        
        if (formId) fetchFormData();
      }, [formId]);

    // Show loading spinner while data is being fetched
    if (loading) {
        return (
            <div className="loading-spinner-container">
                <CircularProgress color="primary" size={60} /> {/* Material-UI spinner */}
                <p>Loading tracker data...</p>
            </div>
        );
    }

    // Show error message if no tracker data is found
    if (!trackerData) {
        return <p>No tracker data found.</p>;
    }

    console.log("User Data from LocalStorage:", user);
    console.log("Tracker's currentAuthority:", trackerData.currentAuthority);

    const handleEditClick = () => setIsEditing(true);

    const handleSaveClick = async () => {
        if (!trackerData || !user || !user._id || (!user.faculty && !user.role)) {
          console.error("Invalid user or tracker data.");
          return;
        }
      
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. Please log in again.");
          return;
        }
      
        if (!isApprovedChecked && !isDeclinedChecked) {
          console.error("Please select either 'Approved' or 'Declined'.");
          return;
        }
      
        const status = isApprovedChecked ? "approved" : "declined";
        const remarksText = remarks || "";
        const trackerId = trackerData?._id || formId;
      
        const stepIndex = trackerData.steps.findIndex(step =>
          step?.stepName?.trim().toLowerCase() === String(currentStep).trim().toLowerCase()
        );
      
        if (stepIndex === -1) {
          console.error("Step not found in tracker data.");
          return;
        }
      
        const step = trackerData.steps[stepIndex];
      
        console.log("Step being updated:", step);
        console.log("Status:", status);
        console.log("Remarks:", remarksText);
      
        // NEW: Include the user's signature URL
        const signature = user.signature; // Ensure this is correctly populated
      
        const requestBody = { status, remarks: remarksText, signature }; // Include signature
      
        try {
          const response = await fetch(
            `https://studevent-server.vercel.app/api/tracker/update-step/${trackerId}/${step._id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            }
          );
      
          if (!response.ok) throw new Error(await response.text());
      
          const updatedResponse = await fetch(
            `https://studevent-server.vercel.app/api/tracker/${formId}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
      
          if (!updatedResponse.ok) throw new Error(await updatedResponse.text());
      
          const updatedData = await updatedResponse.json();
          console.log("Updated tracker data:", updatedData);
          console.log("User Signature URL:", user.signature);
            console.log("Request Body:", requestBody);
      
          setTrackerData(updatedData);
          setCurrentStep(updatedData.currentStep);

          // Refresh signatures after update
          await fetchReviewSignatures();

          setIsEditing(false);
          setIsApprovedChecked(false);
          setIsDeclinedChecked(false);
          setRemarks("");
        } catch (error) {
          console.error("Error updating progress tracker:", error);
        }
      };

    const handleCheckboxChange = (checkbox) => {
        setIsApprovedChecked(checkbox === 'approved');
        setIsDeclinedChecked(checkbox === 'declined');
    };

    const handleViewForms = () => {
        navigate(`/formdetails/${formId}`, { state: { form } });
    };

    const isTrackerCompleted = trackerData.steps.every(step => step.status === 'approved');

    // Inside your ProgressTracker component, before the return statement
    const getPdfComponent = (formType) => {
      switch (formType) {
        case 'Activity':
          return ActivityPdf;
        case 'Budget':
          return BudgetPdf;
        case 'Project':
          return ProjectPdf;
        default:
          return ActivityPdf; // Default fallback
      }
    };
  
    const getPdfFileName = (formType, formDetails) => {
      switch (formType) {
        case 'Activity':
          return 'activity_proposal_form.pdf';
        case 'Budget':
          return `budget_proposal_${formDetails?.nameOfRso || ''}.pdf`;
        case 'Project':
          return `project_proposal_${formDetails?.projectTitle || ''}.pdf`;
        default:
          return 'form_document.pdf';
      }
    };

    console.log("Form Data:", formData);

    return (
        <div className='prog-box'>
        <h3 style={{ textAlign: 'center' }}>Event Proposal Tracker</h3>
        <div className="progress-content">
            <div className="progress-tracker">
                <div className="progress-bar-container">
                    {trackerData.steps.map((step, index) => (
                        <div key={index} className="step-container">
                            <div className="progress-step">
                                {step.color === 'green' ? (
                                    <CheckCircleIcon style={{ color: '#4caf50', fontSize: 24 }} />
                                ) : step.color === 'red' ? (
                                    <CheckCircleIcon style={{ color: 'red', fontSize: 24 }} />
                                ) : (
                                    <RadioButtonUncheckedIcon style={{ color: '#ffeb3b', fontSize: 24 }} />
                                )}
                            </div>
                            <div className="step-label">
                                <strong>{step.stepName}</strong>
                                {step.reviewedBy && (
                                    <div className="reviewer-info">
                                        <small>Reviewed by: {step.reviewedByRole}</small>
                                    </div>
                                )}
                                {step.timestamp && (
                                    <div className="timestamp">
                                        <small>{new Date(step.timestamp).toLocaleString()}</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {isEditing ? (
                    <div className="edit-tracker">
                        <h3 className="edit-tracker-title">EDIT TRACKER</h3>
                        <div className="edit-tracker-options">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={isApprovedChecked}
                                    onChange={() => handleCheckboxChange('approved')}
                                    disabled={isDeclinedChecked}
                                /> Reviewed and Approved
                            </label>
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={isDeclinedChecked}
                                    onChange={() => handleCheckboxChange('declined')}
                                    disabled={isApprovedChecked}
                                /> Declined
                            </label>
                        </div>
                        <textarea
                            style={{ fontFamily: 'Arial', width: '100%' }}
                            placeholder='Remarks'
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                        <Button variant="contained" className="save-button" onClick={handleSaveClick}>
                            SAVE
                        </Button>
                    </div>
                ) : (
                    <div className="action-buttons">
                        {isTrackerCompleted && (
                            <div className="pdf-download-container">
                              <PDFDownloadLink
                                document={React.createElement(
                                  getPdfComponent(formDetails?.formType),
                                  { 
                                    formData: formDetails,
                                    signatures: reviewSignatures 
                                  }
                                )}
                                fileName={getPdfFileName(formDetails?.formType, formDetails)}
                              >
                                {({ loading }) => (
                                  <Button 
                                    variant="contained" 
                                    color="primary" 
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : null}
                                    sx={{
                                      backgroundColor: formDetails?.formType === 'Budget' ? '#4caf50' : 
                                                    formDetails?.formType === 'Project' ? '#9c27b0' : 
                                                    '#1976d2',
                                      '&:hover': {
                                        backgroundColor: formDetails?.formType === 'Budget' ? '#388e3c' : 
                                                      formDetails?.formType === 'Project' ? '#7b1fa2' : 
                                                      '#1565c0'
                                      }
                                    }}
                                  >
                                    {loading ? 'Generating PDF...' : `Download ${formDetails?.formType || 'Form'} PDF`}
                                  </Button>
                                )}
                              </PDFDownloadLink>
                            </div>
                          )}
                        <Button variant="contained" className="action-button" onClick={handleViewForms}>
                            VIEW FORMS
                        </Button>
                        {trackerData.currentAuthority && (trackerData.currentAuthority === user?.faculty || trackerData.currentAuthority === user?.role) ? (
                            <Button variant="contained" className="action-button" onClick={handleEditClick}>
                                EDIT TRACKER
                        </Button>
                        ) : null}
                    </div>
                )}
            </div>

            {isTrackerCompleted && (
    <div className="feedback-container">
        <h4>Your feedback is valuable to us!</h4>
        <p>Please share your thoughts and suggestions to help us improve our system.</p>
        
        {feedbackSubmitted ? (
            <div className="feedback-thank-you">
                <CheckCircleIcon style={{ color: '#4caf50', marginRight: 8 }} />
                Thank you for your feedback!
            </div>
        ) : (
            <>
                <textarea
                    className="feedback-textarea"
                    placeholder="Write your feedback here..."
                    value={feedbackText}
                    onChange={(e) => {
                        setFeedbackText(e.target.value);
                        if (feedbackError) setFeedbackError('');
                    }}
                    rows={4}
                    disabled={isSubmittingFeedback}
                />
                
                {feedbackError && (
                    <div className="feedback-error">
                        <small style={{ color: 'red' }}>{feedbackError}</small>
                    </div>
                )}
                
                <div className="feedback-button-container">
                    <Button 
                        variant="contained" 
                        onClick={handleFeedbackSubmit}
                        disabled={!feedbackText.trim() || isSubmittingFeedback}
                        className="feedback-submit-button"
                        startIcon={isSubmittingFeedback ? <CircularProgress size={20} /> : null}
                    >
                        {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </div>
            </>
        )}
    </div>
)}
        </div>
    </div>
    );
};

export default ProgressTracker;