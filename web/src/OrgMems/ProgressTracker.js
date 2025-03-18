import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './ProgressTracker.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Button from '@mui/material/Button';

const ProgressTracker = ({ currentUser }) => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const form = state?.form;
    const { formId } = useParams();

    const [user, setUser] = useState(null);

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

    const [currentStep, setCurrentStep] = useState(0);
    const [trackerData, setTrackerData] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isApprovedChecked, setIsApprovedChecked] = useState(false);
    const [isDeclinedChecked, setIsDeclinedChecked] = useState(false);

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
            }
        };
    
        fetchTrackerData();
    }, [formId]);
    
    if (!trackerData) return <p>Loading...</p>;

    console.log("User Data from LocalStorage:", user);
    console.log("Tracker's currentAuthority:", trackerData.currentAuthority);

    const handleEditClick = () => setIsEditing(true);

    
    const handleSaveClick = async () => {
        if (!trackerData || !user || !user._id || (!user.faculty && !user.role)) return;
    
        const token = localStorage.getItem("token");
        if (!token) return;
    
        const status = isApprovedChecked ? "approved" : "declined";
        const remarksText = remarks || "";
        const trackerId = trackerData?._id || formId;
    
        const stepIndex = trackerData.steps.findIndex(step => 
            step?.stepName?.trim().toLowerCase() === String(currentStep).trim().toLowerCase()
        );
    
        if (stepIndex === -1) return;
    
        const step = trackerData.steps[stepIndex];
    
        const requestBody = { status, remarks: remarksText };
    
        try {
            // Send update request
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
    
            // Fetch updated tracker data
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
    
            // Update state
            setTrackerData(updatedData);
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

    return (
        <div className='prog-box'>
            <h3 style={{ textAlign: 'center' }}>Event Proposal Tracker</h3>
            <div className="progress-tracker">
            <div className="progress-bar-container">
                {trackerData.steps.map((step, index) => {
                    const canShowStep = index <= currentStep || trackerData.steps.slice(0, index).every(prevStep => prevStep.color === 'green' || prevStep.color === 'red');
                            return canShowStep ? (
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
                                                <small>Reviewed by: {step.reviewedByRole} ({step.reviewedBy})</small>
                                            </div>
                                        )}
                                        {step.timestamp && (
                                            <div className="timestamp">
                                                <small>{new Date(step.timestamp).toLocaleString()}</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null;
                        })}
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
        </div>
    );
};

export default ProgressTracker;
