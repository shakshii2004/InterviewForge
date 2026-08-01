import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { CodingQuestion } from '../src/models/CodingQuestion';

const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/interviewforge';

async function test() {
  await mongoose.connect(DB_URI);
  
  const questions = await CodingQuestion.find();
  const topics = new Set<string>();
  
  questions.forEach(q => {
    if (q.topics) {
      q.topics.forEach(t => topics.add(t));
    }
  });
  
  console.log('All Topics in DB:', Array.from(topics));
  process.exit(0);
}

test();
