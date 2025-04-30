import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './ProgressTracker.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ActivityPdf from '../PdfForms/ActivityPdf';
import BudgetPdf from '../PdfForms/BudgetPdf';
import ProjectPdf from '../PdfForms/ProjectPdf';

const ProgressTracker = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const form = state?.form;
    const { formId } = useParams();
    const [formDetails, setFormDetails] = useState(null);   
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [trackerData, setTrackerData] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isApprovedChecked, setIsApprovedChecked] = useState(false);
    const [isDeclinedChecked, setIsDeclinedChecked] = useState(false);
    const [reviewSignatures, setReviewSignatures] = useState({});
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [budgetData, setBudgetData] = useState(null);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const [pdfStatus, setPdfStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    // Data sanitization functions
    const sanitizeFormData = (formData) => {
        if (!formData) return {};
        return {
            ...formData,
            presidentSignature: formData.presidentSignature?.url || formData.presidentSignature,
            studentOrganization: formData.studentOrganization?.organizationName || formData.studentOrganization
        };
    };

    const sanitizeSignatures = (signatures) => {
        if (!signatures) return {};
        
        return {
          adviser: {
            // name: signatures.adviser?.name || "ADVISER NAME",
            signature: signatures.adviser?.signature?.url || signatures.adviser?.signature,
            date: signatures.adviser?.date,
            status: signatures.adviser?.status
          },
          dean: {
            // name: signatures.dean?.name || "DEAN NAME",
            signature: signatures.dean?.signature?.url || signatures.dean?.signature,
            date: signatures.dean?.date,
            status: signatures.dean?.status
          },
          admin: {
            // name: signatures.admin?.name || "ADMIN NAME",
            signature: signatures.admin?.signature?.url || signatures.admin?.signature,
            date: signatures.admin?.date,
            status: signatures.admin?.status
          },
          academicdirector: {
            // name: signatures.academicdirector?.name || "ACADEMIC DIRECTOR NAME",
            signature: signatures.academicdirector?.signature?.url || signatures.academicdirector?.signature,
            date: signatures.academicdirector?.date,
            status: signatures.academicdirector?.status
          },
          academicservices: {
            // name: signatures.academicservices?.name || "ACADEMIC SERVICES NAME",
            signature: signatures.academicservices?.signature?.url || signatures.academicservices?.signature,
            date: signatures.academicservices?.date,
            status: signatures.academicservices?.status
          },
          executivedirector: {
            // name: signatures.executivedirector?.name || "EXECUTIVE DIRECTOR NAME",
            signature: signatures.executivedirector?.signature?.url || signatures.executivedirector?.signature,
            date: signatures.executivedirector?.date,
            status: signatures.executivedirector?.status
          }
        };
      };

    // Fetch user data
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    const transformBudgetData = (rawBudget) => {
        if (!rawBudget || typeof rawBudget !== 'object') {
          console.error('Invalid budget data:', rawBudget);
          return null;
        }
      
        try {
          return {
            nameOfRso: rawBudget.nameOfRso || rawBudget.nameOfiso || 'N/A',
            eventTitle: rawBudget.eventTitle || 'N/A',
            grandTotal: rawBudget.grandTotal || 0,
            createdAt: rawBudget.createdAt || new Date().toISOString(),
            items: (rawBudget.items || []).map(item => ({
              description: item.description || 'Unspecified Item',
              quantity: item.quantity || 0,
              unitCost: item.unitCost || 0,
              totalCost: item.totalCost || (item.quantity * item.unitCost) || 0,
              unit: item.unit || '-'
            })),
            createdBy: {
              name: 'Organization Representative',
              _id: rawBudget.createdBy
            }
          };
        } catch (error) {
          console.error('Error transforming budget data:', error);
          return null;
        }
      };

    // Main data fetching function
    const fetchBudgetData = async (budgetId) => {
        try {
          console.log("Fetching budget with ID:", budgetId);
          
          const response = await fetch(`https://stundevelop-server.vercel.app/api/budgets/${budgetId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
      
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("API Error Response:", {
              status: response.status,
              error: errorData
            });
            throw new Error(errorData.error || "Budget fetch failed");
          }
      
          return await response.json();
        } catch (error) {
          console.error("Budget fetch error:", {
            budgetId,
            error: error.message,
            stack: error.stack
          });
          return null;
        }
      };

      const fetchAllData = async () => {
        try {
          setLoading(true);
          setFetchError(null);
          const token = localStorage.getItem("token");
          
          // 1. First fetch all parallel data
          const [formRes, signaturesRes, trackerRes] = await Promise.all([
            fetch(`https://studevent-server.vercel.app/api/forms/${formId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            }),
            fetch(`https://studevent-server.vercel.app/api/tracker/signatures/${formId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            }),
            fetch(`https://studevent-server.vercel.app/api/tracker/${formId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            })
          ]);
      
          // Check responses
          if (!formRes.ok || !signaturesRes.ok || !trackerRes.ok) {
            throw new Error('Failed to fetch one or more data sources');
          }
      
          // Process initial data
          const [formData, signaturesData, trackerData] = await Promise.all([
            formRes.json(),
            signaturesRes.json(),
            trackerRes.json()
          ]);
      
          // Debug: Check the attachedBudget structure
          console.log("Form data attachedBudget:", {
            exists: !!formData.attachedBudget,
            type: typeof formData.attachedBudget,
            value: formData.attachedBudget
          });
      
          // 2. Handle budget data
          let budgetData = null;
          if (formData.attachedBudget) {
            try {
              // Get the budget ID (handling both object and string cases)
              const budgetId = typeof formData.attachedBudget === 'object' 
                ? formData.attachedBudget._id 
                : formData.attachedBudget;
      
              console.log("Fetching budget with ID:", budgetId);
              
              budgetData = await fetchBudgetData(budgetId);
              
              // Validate the budget data
              if (!budgetData || !Array.isArray(budgetData.items)) {
                console.error("Invalid budget data structure:", budgetData);
                budgetData = null;
              } else {
                console.log("Successfully fetched budget data:", {
                  itemCount: budgetData.items.length,
                  grandTotal: budgetData.grandTotal
                });
              }
            } catch (budgetError) {
              console.error("Error fetching budget:", budgetError);
              budgetData = null;
            }
          }
      
          // 3. Update all states together
          setFormDetails(sanitizeFormData(formData));
          setReviewSignatures(sanitizeSignatures(signaturesData));
          setTrackerData(trackerData);
          setCurrentStep(String(trackerData.currentStep));
          setBudgetData(budgetData);
      
          // Final debug log
          console.log("All data loaded successfully:", {
            formData: sanitizeFormData(formData),
            signatures: sanitizeSignatures(signaturesData),
            trackerData,
            budgetData
          });
      
          setAllDataLoaded(true);
        } catch (error) {
          console.error("Error in fetchAllData:", error);
          setFetchError(error.message);
          setAllDataLoaded(false);
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
        if (formId) fetchAllData();
    }, [formId]);

    // Feedback submission
    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) {
            setFeedbackError('Please enter feedback');
            return;
        }

        setIsSubmittingFeedback(true);
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
                    formType: formDetails?.formType || 'Activity'
                }),
            });

            if (!response.ok) throw new Error('Failed to submit feedback');
            setFeedbackSubmitted(true);
            setFeedbackText('');
        } catch (error) {
            setFeedbackError(error.message);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    // Tracker update
    const handleSaveClick = async () => {
        if (!trackerData || !user) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const status = isApprovedChecked ? "approved" : "declined";
        const trackerId = trackerData._id || formId;
        const step = trackerData.steps.find(step => 
            step.status === "pending" || step.status === "declined"
        );

        if (!step) return;

        try {
            await fetch(`https://studevent-server.vercel.app/api/tracker/update-step/${trackerId}/${step._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    status, 
                    remarks: remarks || "", 
                    signature: user.signature 
                }),
            });

            // Refresh data
            await fetchAllData();
            setIsEditing(false);
            setRemarks("");
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    // PDF component handling
    const getPdfComponent = (formType) => {
        switch (formType) {
            case 'Budget': return BudgetPdf;
            case 'Project': return ProjectPdf;
            default: return ActivityPdf;
        }
    };

    const getPdfFileName = (formType, details) => {
        switch (formType) {
            case 'Budget': return `budget_${details?.nameOfRso || ''}.pdf`;
            case 'Project': return `project_${details?.projectTitle || ''}.pdf`;
            default: return `activity_${details?.eventTitle || ''}.pdf`;
        }
    };

    const SafePDFDownload = () => {
        if (!allDataLoaded) return null;
        
        try {
          return (
            <PDFDownloadLink
              document={React.createElement(
                getPdfComponent(formDetails?.formType),
                { 
                  formData: sanitizeFormData(formDetails),
                  budgetData: budgetData,
                  signatures: reviewSignatures
                }
              )}
              fileName={getPdfFileName(formDetails?.formType, formDetails)}
              onRender={() => setPdfStatus({ loading: true, error: null, success: false })}
              onError={(error) => setPdfStatus({ loading: false, error: error.message, success: false })}
              onLoad={() => setPdfStatus({ loading: false, error: null, success: true })}
            >
              {({ loading }) => (
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled={loading || pdfStatus.loading}
                  startIcon={(loading || pdfStatus.loading) ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Generating PDF...' : `Download ${formDetails?.formType || 'Form'} PDF`}
                </Button>
              )}
            </PDFDownloadLink>
          );
        } catch (error) {
          console.error("PDF generation error:", error);
          return <div className="pdf-error">Failed to generate PDF</div>;
        }
      };

    // Loading and error states
    if (loading) {
        return (
            <div className="loading-spinner-container">
                <CircularProgress color="primary" size={60} />
                <p>Loading form data...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="error-container">
                <p>Error loading data: {fetchError}</p>
                <Button onClick={fetchAllData}>Retry</Button>
            </div>
        );
    }

    if (!trackerData) {
        return <p>No tracker data found.</p>;
    }

    const isTrackerCompleted = trackerData.steps.every(step => step.status === 'approved');

    return (
        <div className='prog-box'>
            <h3 style={{ textAlign: 'center' }}>Event Proposal Tracker</h3>
            <div className="progress-content">
                <div className="progress-tracker">
                    <div className="progress-bar-container">
                        {trackerData.steps.map((step, index) => (
                            <div key={index} className="step-container">
                                <div className="progress-step">
                                    {step.status === 'approved' ? (
                                        <CheckCircleIcon style={{ color: '#4caf50', fontSize: 24 }} />
                                    ) : step.status === 'declined' ? (
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
                                            <small>{new Date(step.timestamp).toLocaleString()}</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {isEditing ? (
                      <div className="edit-tracker">
                        <h3>Review Submission</h3>
                        <div className="edit-tracker-options">
                          <label>
                            <input
                              type="checkbox"
                              checked={isApprovedChecked}
                              onChange={() => {
                                setIsApprovedChecked(!isApprovedChecked);
                                if (isDeclinedChecked) setIsDeclinedChecked(false);
                              }}
                            />
                            Approve
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={isDeclinedChecked}
                              onChange={() => {
                                setIsDeclinedChecked(!isDeclinedChecked);
                                if (isApprovedChecked) setIsApprovedChecked(false);
                              }}
                            />
                            Decline
                          </label>
                        </div>
                        <textarea
                          className="feedback-textarea"
                          placeholder="Enter your remarks..."
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outlined" 
                            onClick={() => {
                              setIsEditing(false);
                              setIsApprovedChecked(false);
                              setIsDeclinedChecked(false);
                              setRemarks('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="contained" 
                            onClick={handleSaveClick}
                            disabled={!isApprovedChecked && !isDeclinedChecked}
                          >
                            Submit Review
                          </Button>
                        </div>
                      </div>
                    ) : (
                        <div className="action-buttons">
                            {isTrackerCompleted && (
                                <div className="pdf-download-container">
                                    {pdfStatus.error && (
                                        <div className="pdf-error-message">
                                            <small style={{ color: 'red' }}>{pdfStatus.error}</small>
                                        </div>
                                    )}
                                    <SafePDFDownload />
                                </div>
                            )}
                            <PDFDownloadLink
                                document={React.createElement(
                                    getPdfComponent(formDetails?.formType),
                                    { 
                                        formData: sanitizeFormData(formDetails),
                                        budgetData: budgetData,
                                        signatures: reviewSignatures
                                    }
                                )}
                                fileName={getPdfFileName(formDetails?.formType, formDetails)}
                            >
                                {({ loading }) => (
                                    <Button 
                                        variant="contained" 
                                        disabled={loading}
                                    >
                                        {loading ? 'Preparing PDF...' : 'VIEW FORMS'}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                            {(trackerData.currentAuthority === user?.faculty || trackerData.currentAuthority === user?.role) && (
                                <Button variant="contained" onClick={() => setIsEditing(true)}>
                                    EDIT TRACKER
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {isTrackerCompleted && (
                    <div className="feedback-container">
                        <h4>Your Feedback</h4>
                        {feedbackSubmitted ? (
                            <div className="feedback-thank-you">
                                <CheckCircleIcon style={{ color: '#4caf50' }} />
                                Thank you for your feedback!
                            </div>
                        ) : (
                            <>
                                <textarea
                                    placeholder="Your feedback message here..."
                                    className="feedback-textarea"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    disabled={isSubmittingFeedback}
                                />
                                {feedbackError && <small style={{ color: 'red' }}>{feedbackError}</small>}
                                <Button 
                                    variant="contained" 
                                    onClick={handleFeedbackSubmit}
                                    disabled={!feedbackText.trim() || isSubmittingFeedback}
                                >
                                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressTracker;