const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// 1. POST ROUTE: Send a message about a specific item
// Body: { itemId, receiverId, text }
// http://localhost:5000/api/messages
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, receiverId, text } = req.body;

    if (!itemId || !receiverId || !text) {
      return res.status(400).json({ msg: 'Item, receiver, and message text are all required.' });
    }
    if (receiverId === req.user.id) {
      return res.status(400).json({ msg: 'You cannot message yourself.' });
    }

    const message = new Message({
      item: itemId,
      sender: req.user.id,
      receiver: receiverId,
      text
    });
    await message.save();

    const populated = await message.populate('sender', 'name');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET ROUTE: List all conversations for the logged-in user
// (grouped by item + the other participant, newest message first)
// http://localhost:5000/api/messages/conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('item', 'title images')
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      // Skip messages tied to an item that no longer exists
      if (!msg.item) return;

      const isSender = msg.sender._id.toString() === req.user.id;
      const otherUser = isSender ? msg.receiver : msg.sender;
      const key = `${msg.item._id}-${otherUser._id}`;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          itemId: msg.item._id,
          itemTitle: msg.item.title,
          itemImage: msg.item.images && msg.item.images.length > 0 ? msg.item.images[0] : null,
          otherUserId: otherUser._id,
          otherUserName: otherUser.name,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          unreadCount: 0
        });
      }

      // Count unread messages that were sent TO me, across the whole thread
      const convo = conversationsMap.get(key);
      if (!isSender && !msg.read) {
        convo.unreadCount += 1;
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. GET ROUTE: Full message thread for one item + the other participant.
// Also marks their messages to me as read.
// http://localhost:5000/api/messages/thread/:itemId/:otherUserId
router.get('/thread/:itemId/:otherUserId', auth, async (req, res) => {
  try {
    const { itemId, otherUserId } = req.params;

    const messages = await Message.find({
      item: itemId,
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { item: itemId, sender: otherUserId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
