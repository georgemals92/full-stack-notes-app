const Categories = require('../models/categoryModel');

const getCategories = async (req, res) => {
  try {
      // Fetching logic
      const categories = await Categories.find({}).sort('name').limit(100);
      res.json(categories);
    
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

const createCategory = async (req, res) => {
  try {
    const category = await Categories.create({ name: req.body.name });
    res.status(201).json(category);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

const updateCategory = async (req, res) => {
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

const deleteCategory = async (req, res) => {
  try {
    const deleted = await findByIdAndDelete(req.params.id);
    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};