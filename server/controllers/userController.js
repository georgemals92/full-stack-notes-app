// Imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Variables
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // Secret
const SALT_ROUNDS = 10;

// Create new user
const registerUser = async (req, res) => {
  try {
    const { email, password, name, username, role = "user" } = req.body;

    // Checks required fields
    if (!email || !password || !username || !name) {
      return res
        .status(400)
        .json({ message: "Email, name, username and password are required." });
    }

    // Checks for uniqueness - email & username
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(409).json({ message: "Email already in use." });

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res.status(409).json({ message: "Username already in use." });

    // Password hashing, user creation and JWT token generation
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, username, name, passwordHash, role });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Response for successful registration
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to register user." });
  }
};

// Authenticate user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Checks that the required fields for login are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Checks that user with provided email exists in DB
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    // If user with email exists, the provided password is checked against the encrypted password stored in the DB
    const okPassword = await bcrypt.compare(password, user.passwordHash);
    if (!okPassword)
      return res.status(401).json({ message: "Invalid credentials." });

    // JWT token generation - provided that email and password are correct
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // // Response for successful authentication - user data and token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to login." });
  }
};

// Fetch list of all users - for admin + testing
const getAllUsers = async (req, res) => {
  try {
    // Fetch user data - except for passwords?
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

const getUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username)
      return res.status(400).json({ message: "Username required." });

    const user = await User.findOne({ username }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);

  } catch (err) {
    console.error("getUser error:", err);
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, getUser };
