const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/user');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Every route below requires a valid token AND isAdmin === true
router.use(auth, adminAuth);

// 1. GET ROUTE: Dashboard statistics
// http://localhost:5000/api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const totalLost = await Item.countDocuments({ status: 'lost' });
    const totalFound = await Item.countDocuments({ status: 'found' });
    const totalUsers = await User.countDocuments();
    const totalReturned = await Item.countDocuments({ reportStatus: 'Returned' });

    const recoveryRate = totalItems > 0 ? Math.round((totalReturned / totalItems) * 100) : 0;

    // Breakdown by reportStatus (Pending / Matched / Claimed / Returned)
    const statusAgg = await Item.aggregate([
      { $group: { _id: '$reportStatus', count: { $sum: 1 } } }
    ]);
    const byStatus = {};
    statusAgg.forEach((s) => { byStatus[s._id || 'Pending'] = s.count; });

    // Breakdown by category
    const categoryAgg = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const byCategory = {};
    categoryAgg.forEach((c) => { byCategory[c._id || 'Other'] = c.count; });

    // Reports posted per day, last 14 days (simple trend line)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const trendAgg = await Item.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalItems,
      totalLost,
      totalFound,
      totalUsers,
      totalReturned,
      recoveryRate,
      byStatus,
      byCategory,
      trend: trendAgg.map((t) => ({ date: t._id, count: t.count }))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET ROUTE: List every item in the system, with the poster's name/email (for moderation)
// http://localhost:5000/api/admin/items
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find()
      .select('-verificationAnswerHash')
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. DELETE ROUTE: Admin can delete ANY item, regardless of who posted it
// http://localhost:5000/api/admin/items/:id
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found.' });
    }
    await item.deleteOne();
    res.json({ msg: 'Item removed by admin. 🗑️' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 4. GET ROUTE: List every registered user, with how many reports each has posted
// http://localhost:5000/api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Count reports per user in one aggregation query, then merge into the user list
    const counts = await Item.aggregate([
      { $group: { _id: '$postedBy', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach((c) => { countMap[c._id?.toString()] = c.count; });

    const usersWithCounts = users.map((u) => ({
      ...u.toObject(),
      reportCount: countMap[u._id.toString()] || 0
    }));

    res.json(usersWithCounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
