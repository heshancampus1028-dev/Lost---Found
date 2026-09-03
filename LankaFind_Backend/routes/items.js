const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadBufferToCloudinary = require('../utils/cloudinaryUpload');

// Wraps multer so that fileFilter/size/type errors are caught and sent back
// as a normal JSON response, instead of throwing inside the multipart stream
// and crashing the whole Node process (this is what was happening before
// when an unsupported format like .avif/.heic was picked alongside valid images).
function safeUpload(req, res, next) {
  upload.array('images', 3)(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err.message);
      return res.status(400).json({
        msg: err.message.includes('Only image files')
          ? 'One of the selected files is not a supported image format (jpg, jpeg, png, webp only).'
          : 'Image upload failed: ' + err.message
      });
    }
    next();
  });
}

// 1. POST ROUTE: Create a new item (must be logged in)
// http://localhost:5000/api/items
router.post('/', auth, safeUpload, async (req, res) => {
  try {
    const { title, description, status, location, contact, category, verificationQuestion, verificationAnswer, latitude, longitude } = req.body;

    // req.files is populated by multer (in memory) if images were sent (field name: "images").
    // Each buffer is streamed up to Cloudinary here, and we store the permanent
    // secure_url it returns - not a local filename, since that would vanish on Vercel.
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer, 'lankafind/items'))
      );
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    // If a verification question + answer were provided, hash the answer before saving.
    // Only the question is ever shown publicly - the answer never leaves the server as plain text.
    let verificationAnswerHash = null;
    let questionToSave = null;
    if (verificationQuestion && verificationAnswer) {
      const salt = await bcrypt.genSalt(10);
      verificationAnswerHash = await bcrypt.hash(verificationAnswer, salt);
      questionToSave = verificationQuestion;
    }

    const newItem = new Item({
      title,
      description,
      status,
      location,
      contact,
      category,
      images: imageUrls,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      verificationQuestion: questionToSave,
      verificationAnswerHash,
      postedBy: req.user.id // auto-attach the logged-in user's id
    });

    const item = await newItem.save();

    // Never send the answer hash back to the client, even the owner's own response
    const itemToReturn = item.toObject();
    delete itemToReturn.verificationAnswerHash;

    res.json({ msg: 'Item posted successfully! 🎉', item: itemToReturn });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET ROUTE: Get all items (public - no login required)
// Query params: ?search=keyword&category=Electronics&status=lost
// http://localhost:5000/api/items
router.get('/', async (req, res) => {
  try {
    const { search, category, status, location, dateFrom, dateTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    // Separate, more precise location filter (e.g. "Kandy", "Colombo")
    if (location) filter.location = { $regex: location, $options: 'i' };

    // Date range filter based on when the report was created
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        // include the whole "dateTo" day, not just 00:00
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    // Match keyword against title or location (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(filter).select('-verificationAnswerHash').sort({ createdAt: -1 }); // newest first
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 4. GET ROUTE: Auto-matching - find possible opposite-type matches for one item
// (a "lost" item looks for "found" items, and vice-versa)
// Category is NOT a hard filter anymore (people often miscategorize items).
// Instead, everything is scored: category match, location word overlap,
// title word overlap, and how close the two reports are in time. Only
// candidates that clear a minimum score are returned, so unrelated items
// don't flood the results.
//
// NOTE: generic words (e.g. "bag", "phone", "black", "key") are excluded from
// the overlap check, and a single overlapping word is no longer enough on its
// own to count as a match - it needs to be backed up by another signal
// (category, location, or a second shared word). This avoids false matches
// where two completely unrelated items just happen to share one common word.
// http://localhost:5000/api/items/:id/matches
router.get('/:id/matches', async (req, res) => {
  try {
    const sourceItem = await Item.findById(req.params.id);
    if (!sourceItem) {
      return res.status(404).json({ msg: 'Item not found.' });
    }

    const oppositeStatus = sourceItem.status === 'lost' ? 'found' : 'lost';

    // Common words that are too generic to mean anything on their own
    // (colors, materials, and very common item nouns). Extend this list
    // as you notice more false-positive matches in practice.
    const STOPWORDS = new Set([
      'the', 'and', 'with', 'for', 'was', 'this', 'that', 'from', 'have',
      'black', 'white', 'red', 'blue', 'green', 'grey', 'gray', 'pink',
      'yellow', 'brown', 'silver', 'gold', 'colour', 'color', 'small',
      'big', 'new', 'old', 'one', 'bag', 'phone', 'key', 'keys', 'card',
      'wallet', 'item', 'items', 'lost', 'found'
    ]);

    // Helper: split text into meaningful lowercase words (skip tiny, common, or stop words)
    const toWords = (text) =>
      (text || '')
        .toLowerCase()
        .split(/[\s,.-]+/)
        .filter((word) => word.length > 3 && !STOPWORDS.has(word));

    const sourceLocationWords = toWords(sourceItem.location);
    const sourceTitleWords = toWords(sourceItem.title);

    // Only consider items reported within a 60-day window of this one.
    // This is intentionally generous - it's just here to keep the candidate
    // pool reasonable, not to be the deciding factor. Actual match quality
    // is still decided by the scoring below (category/location/title), with
    // time-closeness only ever adding a small bonus, never a requirement.
    const windowMs = 60 * 24 * 60 * 60 * 1000;
    const dateFrom = new Date(sourceItem.createdAt.getTime() - windowMs);
    const dateTo = new Date(sourceItem.createdAt.getTime() + windowMs);

    // Broad candidate pool: just opposite status, not resolved, within the date window.
    // No category filter here - category is scored instead, so a miscategorized item can still surface.
    const candidates = await Item.find({
      _id: { $ne: sourceItem._id },
      status: oppositeStatus,
      reportStatus: { $ne: 'Returned' },
      createdAt: { $gte: dateFrom, $lte: dateTo }
    }).select('-verificationAnswerHash').sort({ createdAt: -1 });

    const scored = candidates.map((candidate) => {
      let score = 0;
      let signals = 0; // how many independent things point to a match

      // Category match is a strong signal, but no longer required
      const categoryMatch = candidate.category === sourceItem.category;
      if (categoryMatch) {
        score += 3;
        signals += 1;
      }

      // Location word overlap (e.g. "University Library" vs "Library")
      const candidateLocationWords = toWords(candidate.location);
      const locationOverlap = sourceLocationWords.some((w) => candidateLocationWords.includes(w));
      if (locationOverlap) {
        score += 2;
        signals += 1;
      }

      // Title word overlap (e.g. "Samsung S25" vs "Samsung s25 phone")
      const candidateTitleWords = toWords(candidate.title);
      const sharedTitleWords = sourceTitleWords.filter((w) => candidateTitleWords.includes(w)).length;
      if (sharedTitleWords > 0) {
        score += sharedTitleWords * 2;
        signals += 1;
      }

      // Closer in time = higher score (up to +3, capped low since time alone proves nothing)
      const daysApart = Math.abs(candidate.createdAt - sourceItem.createdAt) / (24 * 60 * 60 * 1000);
      score += Math.max(0, 3 - daysApart / 4);

      return { candidate, score, signals };
    });

    // Require at least 2 independent signals (e.g. category + location, or
    // 2 shared title words) - a single weak overlap is never enough by itself.
    const MIN_SCORE = 5;
    const MIN_SIGNALS = 2;
    const relevant = scored.filter((s) => s.score >= MIN_SCORE && s.signals >= MIN_SIGNALS);
    relevant.sort((a, b) => b.score - a.score);

    const topMatches = relevant.slice(0, 5).map((s) => s.candidate);
    res.json(topMatches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 5. GET ROUTE: Get items posted by the logged-in user only ("My Reports" page)
// http://localhost:5000/api/items/my
router.get('/my', auth, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user.id }).select('-verificationAnswerHash').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 6. GET ROUTE: Get a single item by id (public - used for item detail / QR poster pages)
// http://localhost:5000/api/items/64f.../single
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('-verificationAnswerHash');
    if (!item) {
      return res.status(404).json({ msg: 'Item not found.' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 7. PATCH ROUTE: Edit a report's own details (owner only)
// Lets the poster fix a typo, update the location/description/contact, etc.
// after the report has already been published. Images are left as-is here -
// only text/number fields and the verification Q&A can be changed.
// Body may include any of: title, description, location, category, contact,
// latitude, longitude, verificationQuestion, verificationAnswer
// http://localhost:5000/api/items/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found.' });
    }

    // Only the owner can edit their own report
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You do not have permission to edit this item.' });
    }

    const {
      title,
      description,
      location,
      category,
      contact,
      latitude,
      longitude,
      verificationQuestion,
      verificationAnswer
    } = req.body;

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (location !== undefined) item.location = location;
    if (category !== undefined) item.category = category;
    if (contact !== undefined) item.contact = contact;
    if (latitude !== undefined) item.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) item.longitude = longitude ? parseFloat(longitude) : null;

    // The question can be cleared/changed freely since it's shown publicly.
    // The answer is only ever re-hashed if a new one was actually typed in -
    // we never overwrite it with a blank hash just because the field was empty.
    if (verificationQuestion !== undefined) item.verificationQuestion = verificationQuestion || null;
    if (verificationAnswer) {
      const salt = await bcrypt.genSalt(10);
      item.verificationAnswerHash = await bcrypt.hash(verificationAnswer, salt);
    }

    await item.save();

    const itemToReturn = item.toObject();
    delete itemToReturn.verificationAnswerHash;

    res.json({ msg: 'Item updated successfully! ✏️', item: itemToReturn });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 8. PATCH ROUTE: Update an item's reportStatus (owner only)
// Body: { status: "Pending" | "Matched" | "Claimed" | "Returned" }
// http://localhost:5000/api/items/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Matched', 'Claimed', 'Returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value.' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found.' });
    }

    // Only the owner can update the status
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You do not have permission to modify this item.' });
    }

    item.reportStatus = status;
    await item.save();

    res.json({ msg: 'Item status updated! ✅', item });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 9. DELETE ROUTE: Delete an item (owner only)
// http://localhost:5000/api/items/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found.' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You do not have permission to delete this item.' });
    }

    await item.deleteOne();
    res.json({ msg: 'Item deleted. 🗑️' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
