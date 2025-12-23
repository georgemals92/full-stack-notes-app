// Imports
const jwt = require("jsonwebtoken");

// Variables & Secrets
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Authentication function to check that JWT is provided and is valid
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }
  console.log(auth);
  const token = auth.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next(); 
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Authorization function to check role
// Requires authentication
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "User not authenticated" });
    if (req.user.role !== role)
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
};

// Exports
module.exports = { requireAuth, requireRole };
