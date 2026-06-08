import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DB] Connected');

    // Pehle check karo admin exist karta hai ya nahi
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      // Role admin karo agar nahi hai
      existing.role = 'admin';
      await existing.save();
      console.log('[Admin] Existing user updated to admin role');
    } else {
      // Naya admin banao
      await User.create({
        firstName: 'Admin',
        lastName: 'SecureAuth',
        email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
        password: process.env.ADMIN_PASSWORD || '2949',
        role: 'admin',
      });
      console.log('[Admin] Admin user created successfully');
    }

    console.log(`[Admin] Email: ${process.env.ADMIN_EMAIL}`);
    process.exit(0);
  } catch (error) {
    console.error('[Admin] Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();