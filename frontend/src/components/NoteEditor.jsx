import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { Pin, Trash2, Save, Tag, X, AlertCircle } from 'lucide-react';
import DeleteModal from './DeleteModal';

const AUTOSAVE_DELAY = 1500;

export default function NoteEditor({ note, onSave, onDelete, onTogglePin }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [titleError, setTitleError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [pinning, setPinning] = useState(false);
  const autosaveTimer = useRef(null);
  const isNew = !note?.id;

  // Sync state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags ? note.tags.split(',').filter(Boolean) : []);
      setTitleError('');
      setSaved(false);
    }
  }, [note?.id]);

  const doSave = useCallback(async (t, c, tgs) => {
    if (!t.trim()) return;
    setSaving(true);
    try {
      await onSave({ title: t.trim(), content: c, tags: tgs.join(',') });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  // Autosave on change (not for new unsaved notes)
  useEffect(() => {
    if (isNew) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (title.trim()) doSave(title, content, tags);
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(autosaveTimer.current);
  }, [title, content, tags]); // eslint-disable-line

  const handleSave = async () => {
    if (!title.trim()) { setTitleError('Title is required'); return; }
    setTitleError('');
    await doSave(title, content, tags);
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handlePin = async () => {
    setPinning(true);
    try { await onTogglePin(note.id); } finally { setPinning(false); }
  };

  const handleDelete = async () => {
    setShowDelete(false);
    await onDelete(note.id);
  };

  return (
    <>
      <div className="editor">
        {/* Toolbar */}
        <div className="editor-toolbar">
          <div className="editor-toolbar-left">
            {/* Tags */}
            <Tag size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <div className="tags-input-wrap">
              {tags.map((t) => (
                <span key={t} className="tag-pill">
                  {t}
                  <button className="tag-remove" onClick={() => setTags(tags.filter(x => x !== t))}>×</button>
                </span>
              ))}
              <input
                className="tag-input"
                placeholder="add tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </div>

          <div className="editor-toolbar-right">
            <div className={`save-indicator ${saved ? 'visible' : ''}`}>
              <span className="save-dot" /> saved
            </div>

            {!isNew && (
              <button
                className={`btn-icon ${!!note?.pinned ? 'pinned' : ''}`}
                onClick={handlePin}
                disabled={pinning}
                title={!!note?.pinned ? 'Unpin' : 'Pin note'}
              >
                <Pin size={15} />
              </button>
            )}

            {!isNew && (
              <button
                className="btn-icon"
                onClick={() => setShowDelete(true)}
                title="Delete note"
                style={{ color: 'var(--text3)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              >
                <Trash2 size={15} />
              </button>
            )}

            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : <Save size={14} />}
              {isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          className="title-input"
          placeholder="Note title…"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(''); }}
        />

        {titleError && (
          <div className="title-error">
            <AlertCircle size={12} />
            {titleError}
          </div>
        )}

        {/* Content */}
        <textarea
          className="content-input"
          placeholder="Start writing…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Meta footer */}
        <div className="editor-meta">
          <span>
            {note?.created_at
              ? `Created ${format(new Date(note.created_at), 'MMM d, yyyy HH:mm')}`
              : 'New note'}
          </span>
          <span>
            {note?.updated_at && !isNew
              ? `Updated ${format(new Date(note.updated_at), 'MMM d HH:mm')}`
              : ''}
          </span>
          <span>{content.length} chars · {content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
        </div>
      </div>

      {showDelete && (
        <DeleteModal
          note={note}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}