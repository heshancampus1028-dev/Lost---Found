const mongoose = require('mongoose');

// A "claim" is created every time someone tries to claim a found item by
// answering its verification question. We keep both successful and failed
// attempts so the finder can review who has been trying to claim their item.
const ClaimSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  // How the claimant can be reached (they may not be a registered/logged-in user)
  claimantContact: {
    type: String,
    required: true
  },
  claimantName: {
    type: String,
    default: ''
  },
  answerGiven: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Claim', ClaimSchema);
