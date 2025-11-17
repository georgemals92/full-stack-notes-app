const Tags = require('../models/tagModel');

const getTags = async (req, res) => {
    try {
        // Fetching logic
        const tags = await Tags.find({}).sort('name').limit(100);
        res.json(tags);
      
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tags' });
      }
};

const createTag = async (req, res) => {
  try {
    const tag = await Tags.create({ name: req.body.name });
    res.status(201).json(tag);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

const updateTag = async (req, res) => {
  try {
    const updated = await findByIdAndUpdate(
      req.params.id, 
      { name: req.body.name }, 
      { new: true}
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

const deleteTag = async (req, res) => {
  try {
    const deleted = await findByIdAndDelete(req.params.id);
    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


module.exports = {
    getTags,
    createTag,
    updateTag,
    deleteTag
};