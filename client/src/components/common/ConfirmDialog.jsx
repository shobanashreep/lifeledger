import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} width={400}>
      <p className="text-muted" style={{ marginTop: 0 }}>{message}</p>
      <div className="flex gap-12" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
