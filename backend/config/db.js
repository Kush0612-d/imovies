import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[Database] MongoDB unavailable (${error.message}). Running with resilient fallback.`);
  }
};

export default connectDB;

