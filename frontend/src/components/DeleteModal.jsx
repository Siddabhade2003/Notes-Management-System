import { Trash2 } from 'lucide-react';

export default function DeleteModal({ note, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Note</h3>
        <p>
          Are you sure you want to delete <strong>"{note?.title || 'Untitled'}"</strong>?
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ background: 'var(--red)', color: '#fff' }}
            onClick={onConfirm}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
