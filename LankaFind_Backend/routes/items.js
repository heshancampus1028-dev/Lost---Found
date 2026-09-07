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

// Uploads every buffered file (req.files, from multer memoryStorage) to
// Cloudinary in parallel, and returns the array of secure_url strings to save
// on the Item document. Returns [] if no files were sent.
async function uploadFilesToCloudinary(files) {
  if (!files || files.length === 0) return [];
  const uploads = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer))
  );
  return uploads.map((result) => result.secure_url);
}

// 1. POST ROUTE: Create a new item (must be logged in)
// http://localhost:5000/api/items
router.post('/', auth, safeUpload, async (req, res) => {
  try {
    const { title, description, status, location, contact, category, verificationQuestion, verificationAnswer, latitude, longitude } = req.body;

    // Upload each image buffer to Cloudinary and collect the returned URLs.
    // (Previously this read req.files[].filename, which only exists with
    // multer's diskStorage - since upload.js switched to memoryStorage for
    // Cloudinary, that was always undefined and no image ever got uploaded.)
    const imageUrls = await uploadFilesToCloudinary(req.files);

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
      postedBy: req.user.id
    });

    const item = await newItem.save();

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
    if (location) filter.location = { $regex: location, $options: 'i' };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(filter).select('-verificationAnswerHash').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 4. GET ROUTE: Auto-matching - find possible opposite-type matches for one item
// http://localhost:5000/api/items/:id/matches
router.get('/:id/matches', async (req, res) => {
  try {
    const sourceItem = await Item.findById(req.params.id);
    if (!sourceItem) {
      return res.status(404).json({ msg: 'Item not found.' });
    }

    const oppositeStatus = sourceItem.status === 'lost' ? 'found' : 'lost';

    const STOPWORDS = new Set([
      'the', 'and', 'with', 'for', 'was', 'this', 'that', 'from', 'have',
      'black', 'white', 'red', 'blue', 'green', 'grey', 'gray', 'pink',
      'yellow', 'brown', 'silver', 'gold', 'colour', 'color', 'small',
      'big', 'new', 'old', 'one', 'bag', 'phone', 'key', 'keys', 'card',
      'wallet', 'item', 'items', 'lost', 'found'
    ]);

    const toWords = (text) =>
      (text || '')
        .toLowerCase()
        .split(/[\s,.-]+/)
        .filter((word) => word.length > 3 && !STOPWORDS.has(word));

    const sourceLocationWords = toWords(sourceItem.location);
    const sourceTitleWords = toWords(sourceItem.title);

    const windowMs = 60 * 24 * 60 * 60 * 1000;
    const dateFrom = new Date(sourceItem.createdAt.getTime() - windowMs);
    const dateTo = new Date(sourceItem.createdAt.getTime() + windowMs);

    const candidates = await Item.find({
      _id: { $ne: sourceItem._id },
      status: oppositeStatus,
      reportStatus: { $ne: 'Returned' },
      createdAt: { $gte: dateFrom, $lte: dateTo }
    }).select('-verificationAnswerHash').sort({ createdAt: -1 });

    const scored = candidates.map((candidate) => {
      let score = 0;
      let signals = 0;

      const categoryMatch = candidate.category === sourceItem.category;
      if (categoryMatch) {
        score += 3;
        signals += 1;
      }

      const candidateLocationWords = toWords(candidate.location);
      const locationOverlap = sourceLocationWords.some((w) => candidateLocationWords.includes(w));
      if (locationOverlap) {
        score += 2;
        signals += 1;
      }

      const candidateTitleWords = toWords(candidate.title);
      const sharedTitleWords = sourceTitleWords.filter((w) => candidateTitleWords.includes(w)).length;
      if (sharedTitleWords > 0) {
        score += sharedTitleWords * 2;
        signals += 1;
      }

      const daysApart = Math.abs(candidate.createdAt - sourceItem.createdAt) / (24 * 60 * 60 * 1000);
      score += Math.max(0, 3 - daysApart / 4);

      return { candidate, score, signals };
    });

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

// 6. GET ROUTE: Get a single item by id
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
// http://localhost:5000/api/items/:id
router.patch('/:id', auth, safeUpload, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found.' });
    }

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
      verificationAnswer,
      removeImages
    } = req.body;

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (location !== undefined) item.location = location;
    if (category !== undefined) item.category = category;
    if (contact !== undefined) item.contact = contact;
    if (latitude !== undefined) item.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) item.longitude = longitude ? parseFloat(longitude) : null;

    if (verificationQuestion !== undefined) item.verificationQuestion = verificationQuestion || null;
    if (verificationAnswer) {
      const salt = await bcrypt.genSalt(10);
      item.verificationAnswerHash = await bcrypt.hash(verificationAnswer, salt);
    }

    // Start from the existing image URL list, then apply removals + additions.
    let updatedImages = [...item.images];

    // Explicit removals - removeImages now holds Cloudinary URLs (not filenames),
    // since that's what's stored on the item after the fix above.
    if (removeImages) {
      try {
        const toRemove = JSON.parse(removeImages);
        if (Array.isArray(toRemove) && toRemove.length > 0) {
          updatedImages = updatedImages.filter((url) => !toRemove.includes(url));
        }
      } catch (e) {
        console.error('Could not parse removeImages:', e.message);
      }
    }

    // New uploads go to Cloudinary and get appended, capped at 3 total.
    if (req.files && req.files.length > 0) {
      const newUrls = await uploadFilesToCloudinary(req.files);
      updatedImages = [...updatedImages, ...newUrls].slice(-3);
    }

    item.images = updatedImages;

    // Note: old Cloudinary images that get replaced/removed are left on
    // Cloudinary rather than deleted (deleting needs the image's public_id,
    // which isn't stored yet - only the secure_url is). Not a functional bug,
    // just unused storage building up over time; can be improved later by
    // saving { url, publicId } pairs instead of plain URL strings.

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
