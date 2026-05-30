import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    // FIX: useNewUrlParser & useUnifiedTopology removed — deprecated in Mongoose 7+
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/secureauth'
    );
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
