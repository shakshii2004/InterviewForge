import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { CodingQuestion } from '../src/models/CodingQuestion';
import { generateAiEditorial } from '../src/services/coding/aiService';

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewforge';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function seedAiEditorials() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(DB_URI);
  console.log('Connected.');

  // Find all questions that don't have an optimal AI editorial yet
  const questions = await CodingQuestion.find({
    $or: [
      { 'aiEditorial.approach': { $exists: false } },
      { 'aiEditorial.approach': null },
      { 'aiEditorial.approach': '' }
    ]
  });

  console.log(`Found ${questions.length} questions needing AI Editorials.`);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`(${i + 1}/${questions.length}) Generating editorial for: ${q.title}...`);

    try {
      const editorial = await generateAiEditorial(q.title, q.description, q.hints);
      
      if (editorial) {
        await CodingQuestion.findByIdAndUpdate(q._id, {
          aiEditorial: {
            approach: editorial.approach,
            bruteForce: editorial.bruteForce,
            optimal: editorial.optimal,
            interviewTips: editorial.interviewTips
          },
          timeComplexity: editorial.timeComplexity,
          spaceComplexity: editorial.spaceComplexity
        });
        console.log(`[SUCCESS] Saved editorial for: ${q.title}`);
      } else {
        console.log(`[FAILED] No editorial returned for: ${q.title}`);
      }
    } catch (err: any) {
      console.error(`[ERROR] Failed to process ${q.title}:`, err.message);
    }

    // Delay 3 seconds between requests to avoid hitting rate limits
    await delay(3000);
  }

  console.log('\nAI Editorial backfill complete!');
  process.exit(0);
}

seedAiEditorials();
