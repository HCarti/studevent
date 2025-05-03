// Modal.js
import React, { useEffect } from 'react';
import './Modal.css'; // Import Modal styles

const Modal = ({ organization, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!organization) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="modal-header">
          <img src={organization.image} alt={organization.name} className="modal-image" />
          <h2 className="modal-title">{organization.name}</h2>
        </div>

        <div className="modal-body">
          <p className="modal-description">{organization.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
