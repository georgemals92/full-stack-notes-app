const express = require('express');
const router = express.Router();
const {
    getNotes,
    createNote,
    updateNote,
    deleteNote
} = require('../controllers/noteController');

// Base route /api/notes
router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;