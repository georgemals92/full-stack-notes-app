// Run once. Make a DB backup before running.
const mongoose = require('mongoose');
const path = require('path');
require('dotenv-safe').config({ path: path.join(__dirname, '..', '..', '.env') });

const Note = require('../models/noteModel'); // if schema still string-based this still reads raw doc
const Tag = require('../models/tagModel');
const Category = require('../models/categoryModel');

async function findOrCreateMany(Model, names) {
  const ids = [];
  for (const n of (names || [])) {
    const name = String(n || '').trim();
    if (!name) continue;
    let doc = await Model.findOne({ name });
    if (!doc) doc = await Model.create({ name });
    ids.push(doc._id);
  }
  return ids;
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const notes = await Note.find({});
  console.log(`Found ${notes.length} notes`);

  for (const note of notes) {
    const tagNames = Array.isArray(note.tags) ? note.tags : [];
    const catNames = Array.isArray(note.categories) ? note.categories : [];

    const tagIds = await findOrCreateMany(Tag, tagNames);
    const catIds = await findOrCreateMany(Category, catNames);

    note.tags = tagIds;
    note.categories = catIds;
    await note.save();
    console.log(`Migrated note ${note._id}`);
  }

  console.log('Migration complete');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});