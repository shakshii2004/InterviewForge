import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { CodingQuestion } from './src/models/CodingQuestion';

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  const q = await CodingQuestion.findOne({title: 'Two Sum'});
  console.log('Sample TCs:', JSON.stringify(q?.sampleTestCases, null, 2));
  process.exit(0);
}
run();
