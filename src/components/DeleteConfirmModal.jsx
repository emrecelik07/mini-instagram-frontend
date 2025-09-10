import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-modal-icon">
            <AlertTriangle size={24} />
          </div>
          <button className="delete-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="delete-modal-body">
          <h3 className="delete-modal-title">{title || 'Delete Post'}</h3>
          <p className="delete-modal-message">
            {message || 'Are you sure you want to delete this post? This action cannot be undone.'}
          </p>
        </div>
        
        <div className="delete-modal-footer">
          <button 
            className="delete-modal-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="delete-modal-confirm" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

