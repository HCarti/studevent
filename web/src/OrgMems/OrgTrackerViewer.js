import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './OrgTrackerViewer.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import StarIcon from '@mui/icons-material/Star';

const OrgTrackerViewer = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { formId } = useParams();
    const [trackerData, setTrackerData] = useState(null);
    const [formDetails, setFormDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');

    // Determine if this is a Local Off-Campus form
    const isLocalOffCampus = state?.formType === 'LocalOffCampus' || 
                           state?.form?.formType === 'LocalOffCampus';

                           useEffect(() => {
                            if (!formId) return;
                        
                            const fetchData = async () => {
                                try {
                                    const token = localStorage.getItem("token");
                                    if (!token) throw new Error("No token found. Please log in again.");
                        
                                    // Determine endpoint based on form type
                                    let trackerEndpoint;
                                    if (isLocalOffCampus) {
                                        trackerEndpoint = `https://studevent-server.vercel.app/api/local-off-campus/${formId}/tracker`;
                                    } else {
                                        trackerEndpoint = `https://studevent-server.vercel.app/api/tracker/${formId}?deepPopulate=true`;
                                    }
                        
                                    // Fetch tracker data
                                    const trackerRes = await fetch(trackerEndpoint, {
                                        headers: {
                                            "Authorization": `Bearer ${token}`,
                                            "Content-Type": "application/json",
                                        },
                                    });
                        
                                    if (!trackerRes.ok) {
                                        throw new Error(`Error fetching tracker data: ${trackerRes.statusText}`);
                                    }
                        
                                    let trackerData = await trackerRes.json();
                                    
                                    // Process the tracker data to ensure reviewer details are populated
                                    trackerData = await processTrackerData(trackerData);
                                    
                                    setTrackerData(trackerData);
                        
                                    // Fetch form details only for regular forms
                                    if (!isLocalOffCampus) {
                                        const formRes = await fetch(`https://studevent-server.vercel.app/api/forms/${formId}`, {
                                            headers: {
                                                "Authorization": `Bearer ${token}`,
                                                "Content-Type": "application/json",
                                            },
                                        });
                                        
                                        if (!formRes.ok) throw new Error(`Error fetching form data: ${formRes.statusText}`);
                                        setFormDetails(await formRes.json());
                                    }
                        
                                    // Check for existing feedback
                                    if (trackerData.feedback) {
                                        setFeedbackSubmitted(true);
                                    }
                                } catch (error) {
                                    console.error("Error fetching data:", error.message);
                                    setError(`Failed to load tracker: ${error.message}`);
                                } finally {
                                    setLoading(false);
                                }
                            };
                        
                            fetchData();
                        }, [formId, isLocalOffCampus]);

    const processTrackerData = async (trackerData) => {
        if (!trackerData?.steps) return trackerData;
      
        const token = localStorage.getItem("token");
        if (!token) return trackerData;
    
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

    const handleViewForms = () => {
        if (isLocalOffCampus) {
            const formPhase = trackerData?.formPhase || state?.formPhase;
            navigate(formPhase === 'BEFORE' 
                ? `/local-off-campus-before/${formId}`
                : `/local-off-campus-after/${formId}`,
                { state: { formData: state?.form } }
            );
        } else {
            navigate(`/formdetails/${formId}`, { 
                state: { form: formDetails || state?.form } 
            });
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!rating || !feedbackText.trim()) {
            setFeedbackError('Please provide both a rating and feedback');
            return;
        }
    
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
                    rating, 
                    formType: isLocalOffCampus ? 'LocalOffCampus' : formDetails?.formType || 'Activity',
                }),
            });
    
            if (!response.ok) throw new Error('Failed to submit feedback');
    
            setFeedbackSubmitted(true);
            setFeedbackText('');
            setRating(0); 
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setFeedbackError('Failed to submit feedback. Please try again later.');
        }
    };

    const getTrackerTitle = () => {
        if (isLocalOffCampus) {
            const formPhase = trackerData?.formPhase || state?.formPhase;
            return formPhase === 'BEFORE' 
                ? 'Local Off-Campus Event Tracker' 
                : 'After Report Tracker';
        }
        return 'Event Proposal Tracker';
    };

    const isTrackerCompleted = trackerData?.steps?.every(step => step.status === 'approved');

    const renderReviewerInfo = (step) => {
        let reviewerName = 'Unknown Reviewer';
        
        if (step.reviewedBy) {
            if (typeof step.reviewedBy === 'object') {
                reviewerName = `${step.reviewedBy.firstName || ''} ${step.reviewedBy.lastName || ''}`.trim();
            }
        }
    
        return (
            <div className="org-reviewer-info">
                <small><span style={{ fontWeight: 'bold' }}>Reviewed by:</span> {reviewerName}</small>
                {step.timestamp && (
                    <small><span style={{ fontWeight: 'bold' }}>Time:</span> {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                )}
                {step.remarks && step.status === 'declined' && (
                    <small className="org-remarks"><span style={{ fontWeight: 'bold' }}>Remarks:</span> {step.remarks}</small>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`loader-container ${!loading ? 'hidden' : ''}`}>
                <div className="loader"></div>
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="org-error-container">
                <h3>Error Loading Tracker</h3>
                <p>{error}</p>
                <Button 
                    variant="contained" 
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className='org-prog-box'>
            <h3 style={{ textAlign: 'center' }} className="proposal-ttl">
                {getTrackerTitle()}
            </h3>
            
            <div className="org-tracker-content-wrapper">
                {/* Left Column - Tracker Steps */}
                <div className="org-tracker-steps-column">
                    <div className="org-progress-bar-container">
                        {trackerData?.steps?.map((step, index) => {
                            // Determine icon and status class
                            let icon, statusClass;
                            if (step.status === 'approved') {
                                icon = <CheckCircleIcon style={{ color: '#4caf50', fontSize: 24 }} />;
                                statusClass = 'approved';
                            } else if (step.status === 'declined') {
                                icon = <HighlightOffIcon style={{ color: '#f44336', fontSize: 24 }} />;
                                statusClass = 'declined';
                            } else {
                                icon = <RadioButtonUncheckedIcon style={{ color: '#ffeb3b', fontSize: 24 }} />;
                                statusClass = 'pending';
                            }

                            return (
                                <div key={index} className={`org-step-container ${statusClass}`}>
                                    <div className="org-progress-step">
                                        {icon}
                                    </div>
                                    <div className="org-step-label">
                                        <strong>{step.stepName}</strong>
                                        <div style={{ color: '#444', marginBottom: 4 }}>
                                            {step.status === 'approved' && 'Step approved.'}
                                            {step.status === 'declined' && 'Step declined.'}
                                            {step.status === 'pending' && 'Awaiting review.'}
                                        </div>
                                        {step.status !== 'pending' && (
                                            <div style={{ marginTop: 8 }}>
                                                {renderReviewerInfo(step)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="org-action-buttons">
                        <Button 
                            variant="contained" 
                            className="org-action-button" 
                            onClick={handleViewForms}
                        >
                            {isLocalOffCampus ? 'VIEW FORM' : 'VIEW FORMS'}
                        </Button>
                    </div>
                </div>

                {/* Right Column - Feedback */}
                {isTrackerCompleted && (
                    <div className="org-feedback-column">
                        <div className="org-feedback-container">
                            <h4>Your feedback is valuable to us!</h4>
                            <p>Please share your thoughts and suggestions to help us improve our system.</p>
                            
                            {feedbackSubmitted ? (
                                <div className="org-feedback-thank-you">
                                    <CheckCircleIcon style={{ color: '#4caf50', marginRight: 8 }} />
                                    <span>Thank you for your feedback!</span>
                                </div>
                            ) : (
                                <>
                                    <div className="org-rating-stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon 
                                                key={star}
                                                className={star <= rating ? 'org-star-filled' : 'org-star-empty'}
                                                onClick={() => setRating(star)}
                                            />
                                        ))}
                                    </div>
                                    
                                    <textarea
                                        className="org-feedback-textarea"
                                        placeholder="What worked well? What could be improved?"
                                        value={feedbackText}
                                        onChange={(e) => {
                                            setFeedbackText(e.target.value);
                                            setFeedbackError('');
                                        }}
                                        rows={4}
                                    />
                                    
                                    {feedbackError && (
                                        <div className="org-feedback-error">
                                            <small style={{ color: 'red' }}>{feedbackError}</small>
                                        </div>
                                    )}
                                    
                                    <div className="org-feedback-button-container">
                                        <Button 
                                            variant="contained" 
                                            onClick={handleFeedbackSubmit}
                                            disabled={!rating || !feedbackText.trim()}
                                            className="org-feedback-submit-button"
                                        >
                                            Submit Feedback
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrgTrackerViewer;