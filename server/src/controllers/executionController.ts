import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { executionService } from '../services/execution/executionService';
import { codingAnalyticsService } from '../services/coding/codingAnalyticsService';

export const runCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, language, questionId: reqQuestionId } = req.body;
    let questionId = reqQuestionId;

    // Handle stale frontend states that send dummy_question_id
    if (questionId === 'dummy_question_id') {
      const CodingQuestion = mongoose.model('CodingQuestion');
      let firstQ = await CodingQuestion.findOne();
      
      // Auto-seed if database is completely empty on first production run
      if (!firstQ) {
        firstQ = await CodingQuestion.create({
          title: 'Two Sum',
          difficulty: 'Easy',
          description: 'Given an array of integers nums and an integer target...',
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
      }
      
      questionId = firstQ._id.toString();
    }
    
    if (!code || !language || !questionId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const results = await executionService.runSampleTests(code, language, questionId);
    res.json({ results });
  } catch (error: any) {
    console.error('Run code error:', error);
    res.status(500).json({ message: error.message || 'Server error running code' });
  }
};

export const submitCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { code, language, questionId: reqQuestionId, sessionId } = req.body;
    let questionId = reqQuestionId;

    // Handle stale frontend states that send dummy_question_id
    if (questionId === 'dummy_question_id') {
      const CodingQuestion = mongoose.model('CodingQuestion');
      let firstQ = await CodingQuestion.findOne();
      
      if (!firstQ) {
        firstQ = await CodingQuestion.create({
          title: 'Two Sum',
          difficulty: 'Easy',
          description: 'Given an array of integers nums and an integer target...',
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
      }
      
      questionId = firstQ._id.toString();
    }

    if (!code || !language || !questionId || !sessionId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const { submission, results } = await executionService.submitHiddenTests(code, language, questionId, sessionId, userId);
    
    // Background update
    codingAnalyticsService.updateUserAnalytics(userId).catch(e => console.error('Analytics update error:', e));

    res.status(201).json({ submission, results });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ message: 'Server error submitting code' });
  }
};

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const CodeSubmission = mongoose.model('CodeSubmission');
    const submissions = await CodeSubmission.find({ codingSessionId: sessionId }).sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
};
