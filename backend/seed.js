// Creates (or resets) the initial Admin account so you can log in for the first time.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@xploreintellects.com').toLowerCase();

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`Admin account already exists: ${adminEmail}`);
    process.exit(0);
  }

  await User.create({
    name: process.env.ADMIN_NAME || 'System Admin',
    email: adminEmail,
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
  });

  console.log('Admin account created successfully:');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
  console.log('You can now log in from the Admin Login page.');

  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
