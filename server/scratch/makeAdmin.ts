import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../src/models/User';

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB');
    
    // Make all users admin for now so the tester can access it
    const res = await User.updateMany({}, { role: 'admin' });
    console.log(`Updated ${res.modifiedCount} users to admin.`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

makeAdmin();
