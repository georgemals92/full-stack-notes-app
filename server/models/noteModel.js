const mongoose = require('mongoose');

// Simple Mongoose model for a Note
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);

