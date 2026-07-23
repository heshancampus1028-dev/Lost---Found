// Run this once from the LankaFind_Backend folder to make an existing user an admin:
//   node scripts/createAdmin.js someone@example.com
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/createAdmin.js someone@example.com');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
    } else {
      console.log(`✅ ${user.email} is now an admin. Log out and log back in to refresh their token.`);
    }

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });
