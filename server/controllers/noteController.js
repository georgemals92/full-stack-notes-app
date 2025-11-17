const Note = require('../models/noteModel');
const Tag = require('../models/tagModel');
const Category = require('../models/categoryModel');


// Helper function that checks whether the referenced IDs from another data model are valid.
// Returns the validated id list that was provided as an argument  
const validateIdsExist = async (Model, ids) => {
  
  // Returns empty array if no IDs are referenced or ID is not array
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }
  // Queries the database to match referenced IDs match IDs of the documents in the data model
  const found = await Model.find({ _id: {$in: ids }}).select('_id');
  
  // Checks that the array of all referenced IDs are a match otherwise throws an error
  if (found.length !== ids.length) {
    throw new Error('One or more IDs are invalid');
  }

  return ids;
}
  // Ensures that URL params are provided as or converted to array IDs for API
  const toIdArray = (v) => {
    if (Array.isArray(v)) {
      return v;
    }
    if (typeof v === 'string') {
      return v.split(',').map(s => s.trim()).filter(Boolean);
    } 
  }

// Get notes
const getNotes = async (req, res) => {
  try {
    // Query for filtering, search and sorting

    let {
      categories,
      tags, 
      search,
      sortBy = 'createdAt',
      order = 'desc' 
    } = req.query;
    
    const categoryParams = toIdArray(categories);
    const tagParams = toIdArray(tags);
    const query = {};
    
    if (categoryParams && categoryParams.length > 0){
      const categoryIds = await validateIdsExist (Category, categoryParams);
      
      if (categoryIds.length > 0) {
        query.categories = {$in: categoryIds};
      }
    }
    
    if (tagParams && tagParams.length > 0) {
      const tagIds = await validateIdsExist(Tag, tagParams);
      
      if (tagIds.length > 0) {
        query.tags = {$in : tagIds}
      };
    }
    
    if (search) {query.$or = [
      {title : {$regex: search, $options: 'i'}},
      {body: {$regex: search, $options: 'i'}}
    ];
    
    }

    // Fetching logic
    
    const notes = await Note.find(query)
      .populate('tags', 'name')
      .populate('categories', 'name')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(100);
    
      res.json(notes);
  
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

// Create note
const createNote = async (req, res) => {
  try {
    const { title, body, categories = [], tags = [] } = req.body;
    const tagIds = await validateIdsExist(Tag, tags);
    const categoryIds = await validateIdsExist (Category, categories);

    if (!title) return res.status(400).json({ error: 'Title is required' });
    


    const note = await Note.create({ 
      title,
      body,
      categories: categoryIds,
      tags: tagIds 
    });

    await note.populate([
      {path: 'tags', select: 'name'},
      {path: 'categories', select: 'name'}
    ]);
    
    res.status(201).json(note);

  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
};

//Update note
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, categories = [], tags = [] } = req.body;
    const categoryIds = await validateIdsExist(Category, categories);
    const tagIds = await validateIdsExist(Tag, tags);
    
    const updated = await Note.findByIdAndUpdate(
      id,
      { title, body, categories: categoryIds, tags: tagIds },
      { new: true, runValidators: true }
    ).populate('tags', 'name').populate('categories', 'name');

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