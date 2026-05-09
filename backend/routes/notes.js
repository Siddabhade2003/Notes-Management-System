const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
} = require('../controllers/notesController');

router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', togglePin);

module.exports = router;
