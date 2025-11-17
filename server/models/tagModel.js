const mongoose = require('mongoose');

// Simple Mongoose model for a Tag
const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }},
  { timestamps: true}
);

module.exports = mongoose.model('Tag', tagSchema);

