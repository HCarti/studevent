// Modal.js
import React, { useState } from 'react';
import './Modal.css'; // Import Modal styles

const Modal = ({ organization, closeModal, allOrganizations }) => {
  const [clickedOrgId, setClickedOrgId] = useState(null); // Track clicked organization ID

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${allOrganizations ? 'all-orgs-view' : 'single-org-view'}`}>
        {allOrganizations ? (
          <div>
            <h2>All Organizations</h2>
            <div className="all-organizations">
              {allOrganizations.map((org) => (
                <div 
                  key={org.id} 
                  className={`org-card ${clickedOrgId === org.id ? 'active' : ''}`} 
                  onClick={() => setClickedOrgId(org.id)} // Set the clicked organization ID
                >
                  <img src={org.image} alt={org.name} className="org-image" />
                  <div className="org-info">
                    <h3>{org.name}</h3>
                    <p>{org.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="single-organization">
            <h2>{organization.name}</h2>
            <img src={organization.image} alt={organization.name} className="single-org-image" />
            <p>{organization.description}</p>
          </div>
        )}
        <button className="modal-close" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
