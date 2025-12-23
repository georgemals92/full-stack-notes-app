const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String },
    username: { type: String, required: true, unique: true, trim: true },
    role: { type: String, default: "user", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
