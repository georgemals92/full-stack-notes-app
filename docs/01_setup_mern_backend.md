# 📘 MERN (Vite) Backend Setup & CRUD Implementation Guide

## 🧭 Overview
This guide describes how to create a **Node.js + Express + MongoDB (Mongoose)** backend for a **MERN (Vite)** application.  
It includes setup, dependency installation, environment configuration, modular structure, CRUD API for “notes,” and API testing.

---

## ⚙️ 1. Prerequisites

Ensure the following are installed on your system:

| Tool | Purpose | Check command |
|------|----------|---------------|
| **Node.js (≥ 18)** | JavaScript runtime | `node -v` |
| **npm** | Package manager | `npm -v` |
| **MongoDB Server** | Local database | `mongosh --version` |
| **MongoDB Compass (optional)** | GUI for MongoDB | — |

### ✅ Verify MongoDB Installation

1. **Windows (Service Method)**  
   - Open **Services** and look for **MongoDB Server (MongoDB)**  
   - Status should be *Running*  
   - Or start it manually:
     ```bash
     net start MongoDB
     ```
2. **Check in Compass**
   - Connection string:  
     ```
     mongodb://127.0.0.1:27017
     ```
   - Should show `test` and `admin` databases.

---

## 🏗️ 2. Project Setup

From your main project folder:

```bash
mkdir server
cd server
npm init -y
```

This creates a default `package.json`.

---

## 📦 3. Install Dependencies

Install the required backend packages:

```bash
npm install express mongoose dotenv cors
```

And development utilities:

```bash
npm install --save-dev nodemon
```

---

## ⚙️ 4. Configure `package.json`

Update your `scripts` section to include a development command:

```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

Now you can start the development server using:

```bash
npm run dev
```

---

## 🌿 5. Environment Variables

**File:** `server/.env`
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/mern_vite_dev
```

---

## 🧩 6. Modular Folder Structure

```
server/
├─ config/
│  └─ db.js
├─ controllers/
│  └─ noteController.js
├─ models/
│  └─ noteModel.js
├─ routes/
│  └─ noteRoutes.js
├─ .env
└─ index.js
```

---

## 🗂️ 7. Code Implementation

### 7.1 Database Connection — `config/db.js`
```js
const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 7.2 Model — `models/noteModel.js`
```js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
```

### 7.3 Controller — `controllers/noteController.js`
```js
const Note = require('../models/noteModel');

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const note = new Note({ title, body });
    await note.save();
    res.status(201).json(note);
  } catch {
    res.status(500).json({ error: 'Failed to create note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Note.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Note not found' });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Note.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
```

### 7.4 Routes — `routes/noteRoutes.js`
```js
const express = require('express');
const router = express.Router();
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/noteController');

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
```

### 7.5 Entry Point — `index.js`
```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB(process.env.MONGO_URI);

app.use('/api/notes', noteRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 🧠 8. Testing CRUD API with `curl`

### Start the backend
```bash
cd server
npm run dev
```

### Health Check
```bash
curl http://localhost:4000/api/health
```

### Create Note
```bash
curl -X POST http://localhost:4000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Note", "body": "Created via curl"}'
```

### Read Notes
```bash
curl http://localhost:4000/api/notes
```

### Update Note
```bash
curl -X PUT http://localhost:4000/api/notes/<note_id> \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "body": "Updated Content"}'
```

### Delete Note
```bash
curl -X DELETE http://localhost:4000/api/notes/<note_id>
```

---

## 🧩 9. Key Takeaways

| Layer | Description |
|--------|--------------|
| **config/** | Handles database and environment setup |
| **models/** | Defines MongoDB data schema |
| **controllers/** | Business logic for CRUD operations |
| **routes/** | Maps HTTP methods to controller actions |
| **index.js** | Starts server and mounts routes |
| **.env** | Stores configuration for flexible environments |

---

## 🚀 10. Next Steps

1. Add centralized error handling middleware.  
2. Introduce request validation (e.g., `express-validator`).  
3. Implement authentication (JWT or session-based).  
4. Connect to Vite React frontend using REST calls.  
5. Optionally Dockerize for consistent deployments.
