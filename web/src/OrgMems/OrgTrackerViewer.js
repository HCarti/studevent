import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './OrgTrackerViewer.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; // Import spinner

const OrgTrackerViewer = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const form = state?.form;
    const { formId } = useParams();

    const [trackerData, setTrackerData] = useState(null);

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
            } catch (error) {
                console.error("Error fetching tracker data:", error.message);
            }
        };

        fetchTrackerData();
    }, [formId]);

    const handleViewForms = () => {
        navigate(`/formdetails/${formId}`, { state: { form } });
    };

    return (
        <div className='org-prog-box'>
            {!trackerData && (
                <div className="org-floating-loader">
                    <CircularProgress className="org-spinner" />
                </div>
            )}
            <h3 style={{ textAlign: 'center' }} className="proposal-ttl">Event Proposal Tracker</h3>
            <div className="org-progress-tracker">
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
                                            <small>Reviewed by: {step.reviewedByRole} ({step.reviewedBy})</small>
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
        </div>
    );
};

export default OrgTrackerViewer;