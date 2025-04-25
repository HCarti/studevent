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
        return {
            adviser: signatures?.adviser?.signature || null,
            dean: signatures?.dean?.signature || null,
            admin: signatures?.admin?.signature || null,
            academicdirector: signatures?.academicdirector?.signature || null,
            academicservices: signatures?.academicservices?.signature || null,
            executivedirector: signatures?.executivedirector?.signature || null,
            president: signatures?.presidentSignature || null
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

    // Main data fetching function
    const fetchBudgetData = async (budgetId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://studevent-server.vercel.app/api/budgets/${budgetId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            setBudgetData(await response.json());
        } catch (error) {
            console.error('Error fetching budget:', error);
            setBudgetData(null);
        }
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setFetchError(null);
            const token = localStorage.getItem("token");
            
            // Fetch form data and signatures in parallel
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

            // Check all responses
            if (!formRes.ok || !signaturesRes.ok || !trackerRes.ok) {
                throw new Error('Failed to fetch one or more data sources');
            }

            // Process data
            const [formData, signaturesData, trackerData] = await Promise.all([
                formRes.json(),
                signaturesRes.json(),
                trackerRes.json()
            ]);

            setFormDetails(sanitizeFormData(formData));
            setReviewSignatures(sanitizeSignatures(signaturesData));
            setTrackerData(trackerData);
            setCurrentStep(String(trackerData.currentStep));

            // Fetch budget if exists
            if (formData.attachedBudget) {
                const budgetId = formData.attachedBudget._id || formData.attachedBudget;
                await fetchBudgetData(budgetId);
            }

            setAllDataLoaded(true);
        } catch (error) {
            console.error("Error loading data:", error);
            setFetchError(error.message);
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
                            budgetData: budgetData || { items: [], grandTotal: 0, nameOfRso: 'N/A' },
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
                            <h3>EDIT TRACKER</h3>
                            <div className="edit-tracker-options">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isApprovedChecked}
                                        onChange={() => setIsApprovedChecked(!isApprovedChecked)}
                                    /> Approved
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isDeclinedChecked}
                                        onChange={() => setIsDeclinedChecked(!isDeclinedChecked)}
                                    /> Declined
                                </label>
                            </div>
                            <textarea
                                placeholder='Remarks'
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                            <Button variant="contained" onClick={handleSaveClick}>
                                SAVE
                            </Button>
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
                            <Button variant="contained" onClick={() => navigate(`/formdetails/${formId}`, { state: { form } })}>
                                VIEW FORMS
                            </Button>
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
                                    placeholder="Your feedback..."
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