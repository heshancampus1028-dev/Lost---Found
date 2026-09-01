const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  // Category used for search/filter (kept as a separate field instead of embedding it in the description)
  category: {
    type: String,
    enum: ['Electronics', 'Documents', 'Personal Items', 'Keys', 'Other'],
    required: true,
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['lost', 'found'], // can only be one of these two
    required: true
  },
  location: {
    type: String,
    required: true
  },
  // Optional exact pin dropped on the map (location text field above stays as the human-readable label)
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  contact: {
    type: String,
    required: false,
    default: ''
  },
  // Reference to the User who posted this item (used for delete/status-update permission checks)
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Uploaded image filenames (served from /uploads on the backend)
  images: {
    type: [String],
    default: []
  },
  // Lifecycle status of the report itself (separate from `status` which is lost/found)
  reportStatus: {
    type: String,
    enum: ['Pending', 'Matched', 'Claimed', 'Returned'],
    default: 'Pending'
  },
  // Ownership verification (mainly used on FOUND items so the finder can screen claimants).
  // The question is public, but the answer is only ever stored as a bcrypt hash.
  verificationQuestion: {
    type: String,
    default: null
  },
  verificationAnswerHash: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', ItemSchema);
