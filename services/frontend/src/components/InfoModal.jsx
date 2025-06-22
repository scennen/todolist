import React from 'react';

const InfoModal = ({ open, onClose, title, message }) => {
  if (!open) return null;
  return (
    <div className="modal" style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: 380, textAlign: 'center' }}>
        <h2 className="modal-title" style={{ marginBottom: 18 }}>{title}</h2>
        <div style={{ fontSize: 16, color: '#444', marginBottom: 28 }}>{message}</div>
        <div className="modal-actions" style={{ justifyContent: 'center', marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <button type="button" onClick={onClose} style={{ minWidth: 120 }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
