import { Search, Plus, BookOpen, X } from 'lucide-react';
import NoteItem from './NoteItem';

const SKELETON = Array.from({ length: 5 }, (_, i) => i);

export default function Sidebar({
  notes,
  loading,
  searchQuery,
  onSearch,
  onNewNote,
  activeId,
  onSelect,
  isOpen,
}) {
  const pinned = notes.filter(n => n.pinned);
  const rest    = notes.filter(n => !n.pinned);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon"><BookOpen size={18} /></div>
          <span className="logo-text">NotesVault</span>
        </div>
        <button className="btn-new" onClick={onNewNote}>
          <Plus size={15} /> New Note
        </button>
      </div>

      <div className="search-box">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearch('')}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="notes-list">
        {loading ? (
          SKELETON.map(i => (
            <div key={i} style={{ padding: '12px 14px', marginBottom: 4 }}>
              <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 10, width: '90%' }} />
            </div>
          ))
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={28} />
            <p>{searchQuery ? 'No notes match your search' : 'No notes yet. Create one!'}</p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <div className="notes-section-label">📌 Pinned</div>
                {pinned.map(n => (
                  <NoteItem
                    key={n.id}
                    note={n}
                    isActive={n.id === activeId}
                    onClick={() => onSelect(n)}
                  />
                ))}
              </>
            )}
            {rest.length > 0 && (
              <>
                {pinned.length > 0 && <div className="notes-section-label">All Notes</div>}
                {rest.map(n => (
                  <NoteItem
                    key={n.id}
                    note={n}
                    isActive={n.id === activeId}
                    onClick={() => onSelect(n)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </span>
      </div>
    </aside>
  );
}
