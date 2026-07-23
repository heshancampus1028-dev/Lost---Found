const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// 1. POST ROUTE: Submit a claim attempt for an item (public - the claimant
// may not be logged in, e.g. someone who just found the post via a shared link)
// Body: { itemId, claimantContact, claimantName, answer }
// http://localhost:5000/api/claims
router.post('/', async (req, res) => {
  try {
    const { itemId, claimantContact, claimantName, answer } = req.body;

    if (!itemId || !claimantContact || !answer) {
      return res.status(400).json({ msg: 'Item, your contact info, and an answer are all required.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found.' });
    }

    if (!item.verificationAnswerHash) {
      return res.status(400).json({ msg: 'This item does not have a verification question set up.' });
    }

    const isCorrect = await bcrypt.compare(answer, item.verificationAnswerHash);

    const claim = new Claim({
      item: itemId,
      claimantContact,
      claimantName: claimantName || '',
      answerGiven: answer,
      verified: isCorrect
    });
    await claim.save();

    // If verified, mark the item as "Matched" so the finder sees it needs attention
    if (isCorrect && item.reportStatus === 'Pending') {
      item.reportStatus = 'Matched';
      await item.save();
    }

    if (isCorrect) {
      res.json({ verified: true, msg: 'Correct! The finder can now see your contact details. 🎉', contact: item.contact });
    } else {
      res.json({ verified: false, msg: 'That answer does not match. Please try again or contact the finder directly if you believe this is your item.' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET ROUTE: List claim attempts for one item (owner only)
// http://localhost:5000/api/claims/item/:itemId
router.get('/item/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found.' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You do not have permission to view these claims.' });
    }

    const claims = await Claim.find({ item: req.params.itemId }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
