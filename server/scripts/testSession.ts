import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { CodingQuestion } from '../src/models/CodingQuestion';

const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/interviewforge';

async function test() {
  await mongoose.connect(DB_URI);
  
  const difficulty = 'Medium';
  const topics = ['Linked List'];
  
  const questions = await CodingQuestion.find({
    topics: { $in: ['Linked List'] }
  });
  
  console.log(`Found ${questions.length} Linked List questions.`);
  questions.forEach(q => console.log(q.title + ' - ' + q.difficulty));
  
  process.exit(0);
}

test();
