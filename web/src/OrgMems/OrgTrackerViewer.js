import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './OrgTrackerViewer.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import StarIcon from '@mui/icons-material/Star';

const OrgTrackerViewer = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const form = state?.form;
    const { formId } = useParams();

    const [trackerData, setTrackerData] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');

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
                setTrackerData(data);
                
                // Check if feedback already exists
                if (data.feedback) {
                    setFeedbackSubmitted(true);
                }
            } catch (error) {
                console.error("Error fetching tracker data:", error.message);
            }
        };

        fetchTrackerData();
    }, [formId]);

    const handleViewForms = () => {
        navigate(`/formdetails/${formId}`, { state: { form } });
    };

    const handleFeedbackSubmit = async () => {
        if (!rating || !feedbackText.trim()) {
            setFeedbackError('Please provide both a rating and feedback');
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://studevent-server.vercel.app/api/tracker/${formId}/feedback`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rating,
                    comments: feedbackText
                }),
            });

            if (!response.ok) throw new Error(`Error submitting feedback: ${response.statusText}`);

            const updatedData = await response.json();
            setTrackerData(updatedData);
            setFeedbackSubmitted(true);
        } catch (error) {
            console.error("Error submitting feedback:", error.message);
            setFeedbackError('Failed to submit feedback. Please try again.');
        }
    };

    const isTrackerCompleted = trackerData?.steps.every(step => step.status === 'approved');

    return (
        <div className='org-prog-box'>
            {!trackerData && (
                <div className="org-floating-loader">
                    <CircularProgress className="org-spinner" />
                </div>
            )}
            <h3 style={{ textAlign: 'center' }} className="proposal-ttl">Event Proposal Tracker</h3>
            
            <div className="org-tracker-content-wrapper">
                {/* Left Column - Tracker Steps */}
                <div className="org-tracker-steps-column">
                    <div className="org-progress-bar-container">
                        {trackerData ? (
                            trackerData.steps.filter(step => step.color !== 'yellow').map((step, index) => (
                                <div key={index} className="org-step-container">
                                    <div className="org-progress-step">
                                        {step.color === 'green' ? (
                                            <CheckCircleIcon style={{ color: '#4caf50', fontSize: 24 }} />
                                        ) : step.color === 'red' ? (
                                            <CheckCircleIcon style={{ color: 'red', fontSize: 24 }} />
                                        ) : (
                                            <RadioButtonUncheckedIcon style={{ color: '#ffeb3b', fontSize: 24 }} />
                                        )}
                                    </div>
                                    <div className="org-step-label">
                                        <strong>{step.stepName}</strong>
                                        {step.reviewedBy && (
                                            <div className="org-reviewer-info">
                                                <small>Reviewed by: {step.reviewedByRole} </small>
                                            </div>
                                        )}
                                        {step.timestamp && (
                                            <div className="org-timestamp">
                                                <small>{new Date(step.timestamp).toLocaleString()}</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : null}
                    </div>
                    <div className="org-action-buttons">
                        <Button variant="contained" className="org-action-button" onClick={handleViewForms}>
                            VIEW FORMS
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