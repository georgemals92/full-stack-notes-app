const path = require('path');
// Use dotenv-safe to enforce required environment variables defined in .env.example
// This will throw and exit if required vars are missing from .env or the environment.
require('dotenv-safe').config({
  example: path.join(__dirname, '..', '.env.example')
});

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes')

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON bodies

// .env variables
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Connect with mongo DB
connectDB(MONGO_URI);

// Routes - Notes
app.use('/api/notes', noteRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
