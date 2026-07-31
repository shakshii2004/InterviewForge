import { CodeSubmission } from '../../models/CodeSubmission';
import { CodingQuestion, TestCase } from '../../models/CodingQuestion';
import mongoose from 'mongoose';
import { ParsedExecutionResult } from './resultParser';

export const executionService = {
  async runSampleTests(code: string, language: string, questionId: string): Promise<ParsedExecutionResult[]> {
    const question = await CodingQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');
    
    const testCases = question.sampleTestCases;
    if (!testCases || testCases.length === 0) return [];

    return testCases.map(tc => ({
      status: 'Internal Error',
      output: '',
      expectedOutput: tc.expectedOutput,
      passed: false,
      time: 0,
      memory: 0,
      error: 'Code execution has been disabled by the administrator.'
    }));
  },

  async submitHiddenTests(
    code: string, 
    language: string, 
    questionId: string, 
    sessionId: string, 
    userId: string
  ) {
    const question = await CodingQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');
    
    const testCases = question.hiddenTestCases;
    
    const results: ParsedExecutionResult[] = testCases.map(tc => ({
      status: 'Internal Error',
      output: '',
      expectedOutput: tc.expectedOutput,
      passed: false,
      time: 0,
      memory: 0,
      error: 'Code execution has been disabled by the administrator.'
    }));

    const submission = new CodeSubmission({
      userId: new mongoose.Types.ObjectId(userId),
      codingSessionId: new mongoose.Types.ObjectId(sessionId),
      questionId: new mongoose.Types.ObjectId(questionId),
      language,
      sourceCode: code,
      status: 'Internal Error',
      passedTestCases: 0,
      totalTestCases: testCases.length,
      executionTime: 0,
      memoryUsed: 0
    });

    await submission.save();

    return {
      submission,
      results
    };
  }
};
