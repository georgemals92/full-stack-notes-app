const Note = require('../models/noteModel');

// Get notes
const getNotes = async (req, res) => {
  try {
    // Query for filtering, search and sorting

    const {
      category,
      tag, 
      search,
      sortBy = 'createdAt',
      order = 'desc' 
    } = req.query;
    
    const query = {};

    if (category) {query.category = category;}
    
    if (tag) {query.tags = tag};
    
    if (search) {query.$or = [
      {title : {$regex: search, $options: 'i'}},
      {body: {$regex: search, $options: 'i'}}
    ];

    }

    // Fetching logic
    
    const notes = await Note.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 }).limit(100);
    
      res.json(notes);
  
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

// Create note
const createNote = async (req, res) => {
  try {
    const { title, body, category, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const note = new Note({ 
      title,
      body,
      category: category || '',
      tags: Array.isArray(tags) ? tags : [] 
    });
    
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
};

//Update note
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, category, tags } = req.body;

    const updated = await Note.findByIdAndUpdate(
      id,
      { title, body, category, tags },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Note not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

// Delete a note by ID
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Note.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote
};