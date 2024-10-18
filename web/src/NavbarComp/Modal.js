// Modal.js
import React, { useState } from 'react';
import './Modal.css'; // Import Modal styles

const Modal = ({ organization, closeModal }) => {
  const [clickedOrgId, setClickedOrgId] = useState(null); // Track clicked organization ID

  return (
    <div className="modal-overlay">
      <div className={`modal-content single-org-view`}>
        <div className="single-organization">
          <h2>{organization.name}</h2>
          <img src={organization.image} alt={organization.name} className="single-org-image" />
          <p>{organization.description}</p>
        </div>
        <button className="modal-close" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
