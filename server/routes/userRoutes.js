// Imports
const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
} = require("../controllers/userController");
const { requireAuth, requireRole } = require("../middleware/auth");
const router = express.Router();

// Router
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:username", getUser);
router.get("/", requireAuth, requireRole("admin"), getAllUsers); // Get list of all users - requires admin rights

// Exports
module.exports = router;
