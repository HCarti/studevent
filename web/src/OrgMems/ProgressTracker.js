import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './ProgressTracker.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
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
    const [organizationType, setOrganizationType] = useState(null);
    const [isAssignedAdviser, setIsAssignedAdviser] = useState(false);

    const [pdfStatus, setPdfStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    const sanitizeFormData = (formData) => {
        if (!formData) return {};
        return {
            ...formData,
            presidentSignature: formData.presidentSignature?.url || formData.presidentSignature,
            studentOrganization: formData.studentOrganization?.organizationName || formData.studentOrganization,
            organizationType: formData.studentOrganization?.organizationType || formData.organizationType
        };
    };

    const sanitizeSignatures = (signatures, orgType) => {
        if (!signatures) return {};
        
        const baseSignatures = {
            adviser: {
                signature: signatures.adviser?.signature?.url || signatures.adviser?.signature,
                date: signatures.adviser?.date,
                status: signatures.adviser?.status
            },
            admin: {
                signature: signatures.admin?.signature?.url || signatures.admin?.signature,
                date: signatures.admin?.date,
                status: signatures.admin?.status
            },
            academicdirector: {
                signature: signatures.academicdirector?.signature?.url || signatures.academicdirector?.signature,
                date: signatures.academicdirector?.date,
                status: signatures.academicdirector?.status
            },
            academicservices: {
                signature: signatures.academicservices?.signature?.url || signatures.academicservices?.signature,
                date: signatures.academicservices?.date,
                status: signatures.academicservices?.status
            },
            executivedirector: {
                signature: signatures.executivedirector?.signature?.url || signatures.executivedirector?.signature,
                date: signatures.executivedirector?.date,
                status: signatures.executivedirector?.status
            }
        };

        if (orgType === 'Recognized Student Organization - Academic') {
            baseSignatures.dean = {
                signature: signatures.dean?.signature?.url || signatures.dean?.signature,
                date: signatures.dean?.date,
                status: signatures.dean?.status
            };
        }

        return baseSignatures;
    };

    const transformBudgetData = (rawBudget) => {
        if (!rawBudget || typeof rawBudget !== 'object') {
            return null;
        }
      
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
    };

    useEffect(() => {
        const checkAdviserAssignment = async () => {
            if (user?.faculty === "Adviser" && formDetails?.studentOrganization) {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                        `https://studevent-server.vercel.app/api/users/check-adviser-assignment`, 
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                adviserId: user._id,
                                organizationName: formDetails.studentOrganization
                            })
                        }
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        setIsAssignedAdviser(data.isAssigned);
                    }
                } catch (error) {
                    console.error("Error checking adviser assignment:", error);
                }
            }
        };

        if (user && formDetails) {
            checkAdviserAssignment();
        }
    }, [user, formDetails]);

        // Modify the button rendering logic
        const shouldShowEditButton = () => {
            // Admins can always edit
            if (user?.role === "Admin") return true;
            
            // For advisers, check if they're assigned to this organization
            if (user?.faculty === "Adviser") {
                return isAssignedAdviser && 
                       (trackerData?.currentAuthority === user?.faculty || 
                        trackerData?.currentAuthority === user?.role);
            }
            
            // For other roles, use the existing logic
            return trackerData?.currentAuthority === user?.faculty || 
                   trackerData?.currentAuthority === user?.role;
        };


    const fetchBudgetData = async (budgetId) => {
        try {
            const response = await fetch(`https://stundevelop-server.vercel.app/api/budgets/${budgetId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
        
            if (!response.ok) {
                throw new Error("Budget fetch failed");
            }
        
            return await response.json();
        } catch (error) {
            console.error("Budget fetch error:", error);
            return null;
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                if (parsedUser.organizationType) {
                    setOrganizationType(parsedUser.organizationType);
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    const fetchAllData = async () => {
        try {
          setLoading(true);
          setFetchError(null);
          const token = localStorage.getItem("token");
          
          // Fetch all data in parallel
          const [formRes, signaturesRes, trackerRes] = await Promise.all([
            fetch(`https://studevent-server.vercel.app/api/forms/${formId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            }),
            fetch(`https://studevent-server.vercel.app/api/tracker/signatures/${formId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            }),
            fetch(`https://studevent-server.vercel.app/api/tracker/${formId}?deepPopulate=true`, {
              headers: { "Authorization": `Bearer ${token}` }
            })
          ]);
      
          if (!formRes.ok || !signaturesRes.ok || !trackerRes.ok) {
            throw new Error('Failed to fetch data');
          }
      
          const [formData, signaturesData, trackerData] = await Promise.all([
            formRes.json(),
            signaturesRes.json(),
            trackerRes.json()
          ]);
      
          const orgType = formData.studentOrganization?.organizationType || 
                         formData.organizationType || 
                         organizationType;
      
          setOrganizationType(orgType);
      
          // Fetch budget data if exists
          let budgetData = null;
          if (formData.attachedBudget) {
            const budgetId = typeof formData.attachedBudget === 'object' 
              ? formData.attachedBudget._id 
              : formData.attachedBudget;
            budgetData = await fetchBudgetData(budgetId);
          }
      
          // Enhanced step data processing with user lookup
          const processedTrackerData = await processTrackerData(trackerData, token);
      
          setFormDetails(sanitizeFormData(formData));
          setReviewSignatures(sanitizeSignatures(signaturesData, orgType));
          setTrackerData(processedTrackerData);
          setCurrentStep(String(processedTrackerData.currentStep));
          setBudgetData(budgetData);
          setAllDataLoaded(true);
        } catch (error) {
          console.error("Error in fetchAllData:", error);
          setFetchError(error.message);
          setAllDataLoaded(false);
        } finally {
          setLoading(false);
        }
      };
      
      // Helper function to ensure all reviewer data is properly populated
      const processTrackerData = async (trackerData, token) => {
        if (!trackerData?.steps) return trackerData;
      
        // Process each step to ensure we have reviewer details
        const processedSteps = await Promise.all(
          trackerData.steps.map(async (step) => {
            // If reviewedBy exists but doesn't have name fields, fetch user details
            if (step.reviewedBy && (!step.reviewedBy.firstName || !step.reviewedBy.lastName)) {
              try {
                const userId = typeof step.reviewedBy === 'string' 
                  ? step.reviewedBy 
                  : step.reviewedBy._id;
      
                if (userId) {
                  const userRes = await fetch(
                    `https://studevent-server.vercel.app/api/users/${userId}`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                  );
      
                  if (userRes.ok) {
                    const userData = await userRes.json();
                    step.reviewedBy = {
                      ...step.reviewedBy,
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                      email: userData.email
                    };
                  }
                }
              } catch (error) {
                console.error("Error fetching user details:", error);
              }
            }
            return step;
          })
        );
      
        return { ...trackerData, steps: processedSteps };
      };

    useEffect(() => {
        if (formId) fetchAllData();
    }, [formId]);

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

            await fetchAllData();
            setIsEditing(false);
            setRemarks("");
        } catch (error) {
            console.error("Update error:", error);
        }
    };

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
    };

    const renderProgressSteps = () => {
        if (!trackerData || !trackerData.steps) return null;
    
        return trackerData.steps.map((step, index) => {
            if (step.stepName === 'Dean' && organizationType !== 'Recognized Student Organization - Academic') {
                return null;
            }
    
            let reviewerName = 'Unknown Reviewer';
            if (step.reviewedBy) {
                if (typeof step.reviewedBy === 'object') {
                    if (step.reviewedBy.firstName || step.reviewedBy.lastName) {
                        reviewerName = `${step.reviewedBy.firstName || ''} ${step.reviewedBy.lastName || ''}`.trim();
                    } else if (step.reviewedBy.email) {
                        reviewerName = step.reviewedBy.email.split('@')[0];
                    }
                } else if (typeof step.reviewedBy === 'string') {
                    reviewerName = `User ${step.reviewedBy.substring(0, 5)}...`;
                }
            }

            // Determine icon and status class
            let icon, statusClass;
            if (step.status === 'approved') {
                icon = <CheckCircleIcon />;
                statusClass = '';
            } else if (step.status === 'declined') {
                icon = <HighlightOffIcon />;
                statusClass = 'declined';
            } else {
                icon = <RadioButtonUncheckedIcon />;
                statusClass = 'pending';
            }

            return (
                <div key={index} className="step-container">
                    <div className={`progress-step ${statusClass}`}>{icon}</div>
                    <div className="step-label">
                        <span className="step-date">
                            {step.timestamp ? new Date(step.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        </span>
                        <strong>{step.stepName}</strong>
                        <div style={{ color: '#444', marginBottom: 4 }}>
                            {step.status === 'approved' && 'Step approved.'}
                            {step.status === 'declined' && 'Step declined.'}
                            {step.status === 'pending' && 'Awaiting review.'}
                        </div>
                        {step.status !== 'pending' && (
                            <div className="reviewer-info">
                                <small><span style={{ fontWeight: 'bold' }}>Reviewed by:</span> {reviewerName}</small>
                                {step.timestamp && (
                                    <small><span style={{ fontWeight: 'bold' }}>Time:</span> {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                )}
                                {step.remarks && (
                                    <small className="remarks"><span style={{ fontWeight: 'bold' }}>Remarks:</span> {step.remarks}</small>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    const isTrackerCompleted = () => {
        if (!trackerData || !trackerData.steps) return false;

        return trackerData.steps.every(step => {
            if (step.stepName === 'Dean' && organizationType !== 'Recognized Student Organization - Academic') {
                return true;
            }
            return step.status === 'approved';
        });
    };

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <CircularProgress color="primary" size={60} />
                <p style={{ color: '#1a237e', marginTop: '1rem' }}>Loading form data...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="error-container">
                <HighlightOffIcon style={{ fontSize: 48, color: '#d32f2f' }} />
                <p>Error loading data: {fetchError}</p>
                <Button 
                    variant="contained" 
                    onClick={fetchAllData}
                    style={{ marginTop: '1rem' }}
                >
                    Retry
                </Button>
            </div>
        );
    }

    if (!trackerData) {
        return (
            <div className="error-container">
                <HighlightOffIcon style={{ fontSize: 48, color: '#d32f2f' }} />
                <p>No tracker data found.</p>
            </div>
        );
    }

    return (
        <div className='prog-box'>
            <h3>Event Proposal Tracker</h3>
            {/* {organizationType && (
                <p style={{ 
                    textAlign: 'center', 
                    color: '#666',
                    marginBottom: '2rem'
                }}>
                    Organization Type: {organizationType}
                </p>
            )} */}
            <div className="progress-content">
                <div className="progress-tracker">
                    <div className="progress-bar-container">
                        {renderProgressSteps()}
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
                                    <span style={{ color: '#4caf50' }}>Approve</span>
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
                                    <span style={{ color: '#f44336' }}>Decline</span>
                                </label>
                            </div>
                            <textarea
                                className="feedback-textarea"
                                placeholder="Enter your remarks..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setIsApprovedChecked(false);
                                        setIsDeclinedChecked(false);
                                        setRemarks('');
                                    }}
                                    style={{ color: '#666' }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="contained" 
                                    onClick={handleSaveClick}
                                    disabled={!isApprovedChecked && !isDeclinedChecked}
                                    style={{ 
                                        backgroundColor: isApprovedChecked ? '#4caf50' : '#f44336',
                                        '&:hover': {
                                            backgroundColor: isApprovedChecked ? '#388e3c' : '#d32f2f'
                                        }
                                    }}
                                >
                                    Submit Review
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="action-buttons">
                            {isTrackerCompleted() && (
                                <div className="pdf-download-container">
                                    {pdfStatus.error && (
                                        <div className="pdf-error-message">
                                            <small style={{ color: '#f44336' }}>{pdfStatus.error}</small>
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
                                        style={{ backgroundColor: '#1a237e' }}
                                    >
                                        {loading ? 'Preparing PDF...' : 'VIEW FORMS'}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                            {shouldShowEditButton() && (
                                <Button 
                                    variant="contained" 
                                    onClick={() => setIsEditing(true)}
                                    style={{ backgroundColor: '#1a237e' }}
                                >
                                    EDIT TRACKER
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {isTrackerCompleted() && (
                    <div className="feedback-container">
                        <h4>Your Feedback</h4>
                        {feedbackSubmitted ? (
                            <div className="feedback-thank-you">
                                <CheckCircleIcon style={{ color: '#4caf50' }} />
                                <span>Thank you for your feedback!</span>
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
                                {feedbackError && <small style={{ color: '#f44336' }}>{feedbackError}</small>}
                                <Button 
                                    variant="contained" 
                                    onClick={handleFeedbackSubmit}
                                    disabled={!feedbackText.trim() || isSubmittingFeedback}
                                    style={{ 
                                        backgroundColor: '#1a237e',
                                        marginTop: '1rem'
                                    }}
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