const mongoose = require('mongoose');

// Simple Mongoose model for a Note
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: String,
  category: { type: String, default: ''},
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);

