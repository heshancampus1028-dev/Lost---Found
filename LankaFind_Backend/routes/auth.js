const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

// REGISTER ROUTE (http://localhost:5000/api/auth/register)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please fill in all fields.' });
    }

    // 1. Check if the email is already registered
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'This email is already registered.' });
    }

    // 2. Hash the password (never store plain text passwords)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the new user
    user = new User({
      name,
      email,
      password: hashedPassword
    });

    // 4. Save to the database
    await user.save();

    res.status(201).json({ msg: 'User registered successfully! 🎉' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// LOGIN ROUTE (http://localhost:5000/api/auth/login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email address.' });
    }

    // 2. Compare the given password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid password.' });
    }

    // 3. Generate a JWT token (valid for 7 days)
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Send back the token and user details
    res.json({
      msg: 'Logged in successfully! 🔓✨',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET CURRENT USER'S FULL PROFILE (http://localhost:5000/api/auth/me)
// Used by the Profile page to load phone/address/bio, which aren't in the login response.
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// UPDATE PROFILE (http://localhost:5000/api/auth/profile)
// Lets a logged-in user add/edit their name, phone, address, and bio.
// Email is intentionally not editable here (it's the account's unique identifier).
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, bio } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;
    if (bio !== undefined) update.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ msg: 'Profile updated successfully!', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
