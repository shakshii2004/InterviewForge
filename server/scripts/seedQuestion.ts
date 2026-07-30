import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CodingQuestion } from '../src/models/CodingQuestion';
import { CodingSession } from '../src/models/CodingSession';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewforge');
    
    // Clear old questions
    await CodingQuestion.deleteMany({});
    
    const question = new CodingQuestion({
      title: 'Two Sum',
      difficulty: 'Easy',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
      topics: ['Arrays', 'Hash Table'],
      starterCode: {
        'JavaScript': 'function twoSum(nums, target) {\n  \n}',
        'Python': 'def twoSum(nums, target):\n  pass',
        'Java': 'class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    \n  }\n}',
        'C++': 'class Solution {\npublic:\n  vector<int> twoSum(vector<int>& nums, int target) {\n    \n  }\n};'
      },
      signature: {
        methodName: 'twoSum',
        parameters: [
          { name: 'nums', type: 'int[]' },
          { name: 'target', type: 'int' }
        ],
        returnType: 'int[]'
      },
      sampleTestCases: [
        { input: '2 7 11 15\n9', expectedOutput: '0 1' },
        { input: '3 2 4\n6', expectedOutput: '1 2' }
      ],
      hiddenTestCases: [
        { input: '3 3\n6', expectedOutput: '0 1' },
        { input: '2 5 5 11\n10', expectedOutput: '1 2' },
        { input: '-1 -2 -3 -4 -5\n-8', expectedOutput: '2 4' }
      ],
      timeLimit: 2,
      memoryLimit: 128000
    });

    await question.save();
    console.log('Seeded Two Sum question:', question._id);
    
    // Update all sessions to point to this question
    await CodingSession.updateMany({}, { $set: { currentQuestion: question._id } });
    console.log('Updated all CodingSessions to point to this question.');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
