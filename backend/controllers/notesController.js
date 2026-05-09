const db = require('../config/db');

// GET /api/notes - Get all notes (sorted by pinned first, then updated_at)
const getAllNotes = async (req, res) => {
  try {
    const { search, sort = 'updated_at', order = 'DESC' } = req.query;

    const allowedSort = ['updated_at', 'created_at', 'title'];
    const allowedOrder = ['ASC', 'DESC'];
    const safeSort = allowedSort.includes(sort) ? sort : 'updated_at';
    const safeOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    let query, params;

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = `
        SELECT id, title, 
               SUBSTRING(content, 1, 200) AS preview,
               content, pinned, tags, created_at, updated_at
        FROM notes
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY pinned DESC, ${safeSort} ${safeOrder}
      `;
      params = [term, term];
    } else {
      query = `
        SELECT id, title,
               SUBSTRING(content, 1, 200) AS preview,
               content, pinned, tags, created_at, updated_at
        FROM notes
        ORDER BY pinned DESC, ${safeSort} ${safeOrder}
      `;
      params = [];
    }

    const [rows] = await db.execute(query, params);

    return res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error('getAllNotes error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching notes' });
  }
};

// GET /api/notes/:id - Get single note
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM notes WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getNoteById error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching note' });
  }
};

// POST /api/notes - Create note
const createNote = async (req, res) => {
  try {
    const { title, content = '', pinned = false, tags = '' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (title.trim().length > 255) {
      return res.status(400).json({ success: false, message: 'Title must be 255 characters or less' });
    }

    const [result] = await db.execute(
      'INSERT INTO notes (title, content, pinned, tags) VALUES (?, ?, ?, ?)',
      [title.trim(), content, Boolean(pinned), tags]
    );

    const [newNote] = await db.execute('SELECT * FROM notes WHERE id = ?', [result.insertId]);

    return res.status(201).json({ success: true, message: 'Note created', data: newNote[0] });
  } catch (err) {
    console.error('createNote error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating note' });
  }
};

// PUT /api/notes/:id - Update note
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, pinned, tags } = req.body;

    const [existing] = await db.execute('SELECT id FROM notes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ success: false, message: 'Title cannot be empty' });
    }
    if (title && title.trim().length > 255) {
      return res.status(400).json({ success: false, message: 'Title must be 255 characters or less' });
    }

    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title.trim()); }
    if (content !== undefined) { fields.push('content = ?'); values.push(content); }
    if (pinned !== undefined) { fields.push('pinned = ?'); values.push(Boolean(pinned)); }
    if (tags !== undefined) { fields.push('tags = ?'); values.push(tags); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await db.execute(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await db.execute('SELECT * FROM notes WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Note updated', data: updated[0] });
  } catch (err) {
    console.error('updateNote error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating note' });
  }
};

// DELETE /api/notes/:id - Delete note
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.execute('SELECT id, title FROM notes WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await db.execute('DELETE FROM notes WHERE id = ?', [id]);

    return res.json({ success: true, message: `Note "${existing[0].title}" deleted successfully` });
  } catch (err) {
    console.error('deleteNote error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting note' });
  }
};

// PATCH /api/notes/:id/pin - Toggle pin
const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.execute('SELECT id, pinned FROM notes WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const newPinned = !existing[0].pinned;
    await db.execute('UPDATE notes SET pinned = ? WHERE id = ?', [newPinned, id]);

    return res.json({ success: true, message: `Note ${newPinned ? 'pinned' : 'unpinned'}`, pinned: newPinned });
  } catch (err) {
    console.error('togglePin error:', err);
    return res.status(500).json({ success: false, message: 'Server error toggling pin' });
  }
};

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote, togglePin };
