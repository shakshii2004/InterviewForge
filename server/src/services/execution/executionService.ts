import { getPistonLanguage } from './languageMapper';
import { pistonClient } from './pistonClient';
import { parsePistonResult, ParsedExecutionResult } from './resultParser';
import { CodeSubmission } from '../../models/CodeSubmission';
import { CodingQuestion, TestCase } from '../../models/CodingQuestion';
import mongoose from 'mongoose';
import { wrapCode } from './codeWrapper';

export const executionService = {
  async runSampleTests(code: string, language: string, questionId: string): Promise<ParsedExecutionResult[]> {
    const question = await CodingQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');

    const pistonLang = getPistonLanguage(language);
    
    const testCases = question.sampleTestCases;
    if (!testCases || testCases.length === 0) return [];

    return this.executeTestCases(code, language, pistonLang.language, pistonLang.version, testCases, question.signature);
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

    const pistonLang = getPistonLanguage(language);
    
    const testCases = question.hiddenTestCases;
    const results = await this.executeTestCases(code, language, pistonLang.language, pistonLang.version, testCases, question.signature);

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

  async executeTestCases(
    code: string, 
    originalLanguage: string, 
    pistonLangName: string, 
    pistonLangVersion: string, 
    testCases: TestCase[], 
    signature: any
  ): Promise<ParsedExecutionResult[]> {
    const wrappedCode = wrapCode(code, originalLanguage, signature);
    const results: ParsedExecutionResult[] = [];
    
    // We run each test case sequentially since Piston API execute endpoint does not natively 
    // support array of stdins for batch runs in a single request.
    for (const tc of testCases) {
      try {
        const response = await pistonClient.execute({
          language: pistonLangName,
          version: pistonLangVersion,
          files: [
            { content: wrappedCode }
          ],
          stdin: tc.input
        });

        results.push(parsePistonResult(response, tc.expectedOutput));
      } catch (error: any) {
        console.error(`Piston Execution Error for language ${pistonLangName}:`, error.message);
        results.push({
          status: 'Internal Error',
          output: '',
          passed: false,
          time: 0,
          memory: 0,
          error: error.message || 'Execution failed due to server error'
        });
      }
      
      // Sleep slightly between requests to be nice to the public API
      if (testCases.length > 1) {
        await new Promise(r => setTimeout(r, 250));
      }
    }

    return results;
  }
};
