import { CodeSubmission } from '../../models/CodeSubmission';
import { CodingQuestion, TestCase } from '../../models/CodingQuestion';
import mongoose from 'mongoose';
import { ParsedExecutionResult } from './resultParser';
import { jdoodleClient, getJDoodleLanguage } from './jdoodleClient';

export const executionService = {
  async runSampleTests(code: string, language: string, questionId: string): Promise<ParsedExecutionResult[]> {
    const question = await CodingQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');
    
    const testCases = question.sampleTestCases;
    if (!testCases || testCases.length === 0) return [];

    return this.executeTestCases(code, language, testCases);
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
    const results = await this.executeTestCases(code, language, testCases);

    let passedTestCases = 0;
    let maxExecutionTime = 0;
    let maxMemory = 0;
    let finalStatus = 'Accepted';

    for (const res of results) {
      if (res.passed) {
        passedTestCases++;
      } else if (finalStatus === 'Accepted') {
        finalStatus = res.status;
      }

      if (res.time > maxExecutionTime) maxExecutionTime = res.time;
      if (res.memory > maxMemory) maxMemory = res.memory;
    }

    const submission = new CodeSubmission({
      userId: new mongoose.Types.ObjectId(userId),
      codingSessionId: new mongoose.Types.ObjectId(sessionId),
      questionId: new mongoose.Types.ObjectId(questionId),
      language,
      sourceCode: code,
      status: finalStatus,
      passedTestCases,
      totalTestCases: testCases.length,
      executionTime: maxExecutionTime,
      memoryUsed: maxMemory
    });

    await submission.save();

    return {
      submission,
      results
    };
  },

  async executeTestCases(code: string, language: string, testCases: TestCase[]): Promise<ParsedExecutionResult[]> {
    const jdoodleLang = getJDoodleLanguage(language);
    const results: ParsedExecutionResult[] = [];

    // Execute sequentially to respect standard rate limits
    for (const tc of testCases) {
      try {
        const response = await jdoodleClient.execute({
          script: code,
          language: jdoodleLang.language,
          versionIndex: jdoodleLang.versionIndex,
          stdin: tc.input
        });

        const output = (response.output || '').trim();
        const expected = (tc.expectedOutput || '').trim();
        let passed = expected === '' || output === expected;
        const time = parseFloat(response.cpuTime || '0') * 1000;
        const memory = parseFloat(response.memory || '0');

        let status = passed ? 'Accepted' : 'Wrong Answer';
        let error = undefined;

        // Naive compilation/runtime error detection for JDoodle since everything is in output
        const outputLower = output.toLowerCase();
        if (outputLower.includes('exception in thread') || outputLower.includes('traceback (most recent call last)')) {
           status = 'Runtime Error';
           error = output;
           passed = false;
        } else if (outputLower.includes('error:') || outputLower.includes('syntaxerror:')) {
           status = 'Compilation Error';
           error = output;
           passed = false;
        } else if (output.includes('Time Limit Exceeded') || response.statusCode !== 200) {
           status = 'Time Limit Exceeded';
           passed = false;
        }

        results.push({
          status,
          output,
          expectedOutput: expected,
          passed: status === 'Accepted' && passed,
          time,
          memory,
          error
        });
        
        // Wait 1 second between requests to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
      } catch (err: any) {
        results.push({
          status: 'Internal Error',
          output: '',
          expectedOutput: tc.expectedOutput,
          passed: false,
          time: 0,
          memory: 0,
          error: err.message
        });
      }
    }

    return results;
  }
};
