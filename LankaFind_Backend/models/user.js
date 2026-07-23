const mongoose = require('mongoose');

// Schema (blueprint) for storing user data
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // no two accounts can share the same email
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // minimum 6 characters for the password
  },
  // Admins can access the /admin dashboard and moderate any item.
  // Never set via the public register route - only promoted manually (see scripts/createAdmin.js)
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now // automatically saved when the account is created
  }
});

// Build the 'User' model from this schema and export it
module.exports = mongoose.model('User', UserSchema);
