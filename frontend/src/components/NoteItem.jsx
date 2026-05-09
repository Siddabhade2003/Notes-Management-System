import { formatDistanceToNow } from 'date-fns';
import { Pin } from 'lucide-react';

export default function NoteItem({ note, isActive, onClick }) {
  const preview = note.preview || note.content || '';
  const date = note.updated_at ? new Date(note.updated_at) : new Date();

  return (
    <div className={`note-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="note-item-title">
        {!!note.pinned && <Pin size={10} className="pin-badge" />}
        <span>{note.title || 'Untitled'}</span>
      </div>
      {preview && (
        <div className="note-item-preview">
          {preview.replace(/\n/g, ' ').slice(0, 60)}
        </div>
      )}
      <div className="note-item-date">
        {formatDistanceToNow(date, { addSuffix: true })}
      </div>
    </div>
  );
}