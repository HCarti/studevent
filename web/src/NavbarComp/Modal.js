// Modal.js
import React from 'react';
import './Modal.css'; // Import Modal styles
 
const Modal = ({ organization, closeModal }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{organization.name}</h2>
        <img src={organization.image} alt={organization.name} className="modal-image" />
        <p>{organization.description}</p>
        <button className="modal-close" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};
 
export default Modal;