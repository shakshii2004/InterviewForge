import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure dotenv is loaded before checking env vars
dotenv.config();

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error("MONGO_URI environment variable is missing. Cannot connect to database.");
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
