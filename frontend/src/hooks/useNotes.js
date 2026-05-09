import { useState, useCallback, useEffect, useRef } from 'react';
import { notesApi } from '../utils/api';
import toast from 'react-hot-toast';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimer = useRef(null);

  const fetchNotes = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const { data } = await notesApi.getAll({ search: search.trim() });
      setNotes(data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchNotes(query), 350);
  }, [fetchNotes]);

  const createNote = useCallback(async (noteData) => {
    const { data } = await notesApi.create(noteData);
    setNotes((prev) => [data.data, ...prev]);
    toast.success('Note created!');
    return data.data;
  }, []);

  const updateNote = useCallback(async (id, noteData) => {
    const { data } = await notesApi.update(id, noteData);
    setNotes((prev) => prev.map((n) => (n.id === id ? data.data : n)));
    toast.success('Note saved!');
    return data.data;
  }, []);

  const deleteNote = useCallback(async (id) => {
    await notesApi.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success('Note deleted');
  }, []);

  const togglePin = useCallback(async (id) => {
    const { data } = await notesApi.togglePin(id);
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, pinned: !!data.pinned } : n))
        .sort((a, b) => b.pinned - a.pinned || new Date(b.updated_at) - new Date(a.updated_at))
    );
    toast.success(data.pinned ? 'Note pinned!' : 'Note unpinned');
  }, []);

  return {
    notes,
    loading,
    searchQuery,
    handleSearch,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    refetch: fetchNotes,
  };
};