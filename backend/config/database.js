import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    // BUG FIX: useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 7+
    // Mongoose 7 sets them to true internally — passing them causes a warning/error
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/secureauth'
    );

    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
