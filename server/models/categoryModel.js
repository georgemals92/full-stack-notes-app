const mongoose = require('mongoose');

// Simple Mongoose model for a Tag
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }},
  { timestamps: true}
);

module.exports = mongoose.model('Category', categorySchema);

