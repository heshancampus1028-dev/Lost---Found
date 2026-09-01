const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dns = require('dns');

// Node.js වල DNS resolver එක Google DNS වලට මාරු කිරීම
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

// Safety net: log unexpected errors instead of letting them silently kill the
// whole server process (this is what was happening with certain malformed
// image uploads before the upload route got its own error handling).
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json()); // parse JSON request bodies

// Serve uploaded item images statically, e.g. http://localhost:5000/uploads/169999-file.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route registration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((err) => console.error('❌ Database connection error:', err));

// Simple health-check route
app.get('/', (req, res) => {
  res.send('LankaFind Backend is up and running! 🚀');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running successfully on port ${PORT}...`);
});
