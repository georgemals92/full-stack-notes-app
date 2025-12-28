const express = require("express");
const router = express.Router();
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

const { requireAuth } = require("../middleware/auth");

// Base route /api/notes
router.get("/", requireAuth, getNotes);
router.get("/public", getNotes); //for testing
router.post("/", requireAuth, createNote);
router.put("/:id", requireAuth, updateNote);
router.delete("/:id", requireAuth, deleteNote);

module.exports = router;
