import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { BookOpen, Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import { useNotes } from './hooks/useNotes';
import './index.css';

const NEW_NOTE_TEMPLATE = { id: null, title: '', content: '', tags: '', pinned: false };

export default function App() {
  const {
    notes, loading, searchQuery, handleSearch,
    createNote, updateNote, deleteNote, togglePin,
  } = useNotes();

  const [activeNote, setActiveNote] = useState(null);
  const [isNewNote, setIsNewNote] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectNote = useCallback((note) => {
    setActiveNote(note);
    setIsNewNote(false);
    setSidebarOpen(false);
  }, []);

  const handleNewNote = useCallback(() => {
    setActiveNote(NEW_NOTE_TEMPLATE);
    setIsNewNote(true);
    setSidebarOpen(false);
  }, []);

  const handleSave = useCallback(async (data) => {
    if (isNewNote) {
      const created = await createNote(data);
      setActiveNote(created);
      setIsNewNote(false);
    } else if (activeNote?.id) {
      const updated = await updateNote(activeNote.id, data);
      setActiveNote(updated);
    }
  }, [isNewNote, activeNote, createNote, updateNote]);

  const handleDelete = useCallback(async (id) => {
    await deleteNote(id);
    setActiveNote(null);
    setIsNewNote(false);
  }, [deleteNote]);

  const handleTogglePin = useCallback(async (id) => {
    await togglePin(id);
    if (activeNote?.id === id) {
      setActiveNote(prev => ({ ...prev, pinned: !prev.pinned }));
    }
  }, [togglePin, activeNote]);

  return (
    <div className="app">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
          error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--bg)' } },
        }}
      />

      {/* Mobile header */}
      <div className="mobile-header">
        <button className="btn-icon" onClick={() => setSidebarOpen(v => !v)}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="logo" style={{ flex: 1, margin: 0 }}>
          <div className="logo-icon" style={{ width: 28, height: 28 }}><BookOpen size={14} /></div>
          <span className="logo-text" style={{ fontSize: '1rem' }}>NotesVault</span>
        </div>
      </div>

      <Sidebar
        notes={notes}
        loading={loading}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onNewNote={handleNewNote}
        activeId={activeNote?.id}
        onSelect={handleSelectNote}
        isOpen={sidebarOpen}
      />

      <main className="main">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id ?? 'new'}
            note={activeNote}
            onSave={handleSave}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
          />
        ) : (
          <div className="welcome">
            <BookOpen size={48} strokeWidth={1} />
            <h2>Select a note to begin</h2>
            <p>Choose a note from the sidebar or create a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
