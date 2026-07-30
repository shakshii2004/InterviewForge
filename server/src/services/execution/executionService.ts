import { getJudge0LanguageId } from './languageMapper';
import { judge0Client, SubmissionRequest } from './judge0Client';
import { parseJudge0Result, ParsedExecutionResult } from './resultParser';
import { CodeSubmission } from '../../models/CodeSubmission';
import { CodingQuestion, TestCase } from '../../models/CodingQuestion';
import mongoose from 'mongoose';
import { wrapCode } from './codeWrapper';
import { localExecutor } from './localExecutor';

const POLL_INTERVAL = 1000;
const MAX_POLL_ATTEMPTS = 20;

export const executionService = {
  async runSampleTests(code: string, language: string, questionId: string): Promise<ParsedExecutionResult[]> {
    const question = await CodingQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');

    const languageId = getJudge0LanguageId(language);
    
    const testCases = question.sampleTestCases;
    if (!testCases || testCases.length === 0) return [];

    return this.executeTestCases(code, language, languageId, testCases, question.signature);
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

    const languageId = getJudge0LanguageId(language);
    
    const testCases = question.hiddenTestCases;
    const results = await this.executeTestCases(code, language, languageId, testCases, question.signature);

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

  async executeTestCases(code: string, language: string, languageId: number, testCases: TestCase[], signature: any): Promise<ParsedExecutionResult[]> {
    const isMock = !process.env.JUDGE0_API_KEY;
    const wrappedCode = wrapCode(code, language, signature);

    if (isMock) {
      return await localExecutor.runAll(wrappedCode, language, testCases);
    }

    const requests: SubmissionRequest[] = testCases.map(tc => ({
      source_code: wrappedCode,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.expectedOutput
    }));

    // If there's only 1 test case, use single submission for simplicity, else batch.
    // For safety with free API tiers that might not support batch, we submit sequentially
    // with a 1-second delay between submissions to avoid HTTP 429 Too Many Requests limits.
    
    const tokens: string[] = [];
    for (const req of requests) {
      const token = await judge0Client.createSubmission(req);
      tokens.push(token);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }

    // Poll sequentially to also avoid rate limits on the GET endpoints
    const results: ParsedExecutionResult[] = [];
    
    for (let i = 0; i < tokens.length; i++) {
      let attempts = 0;
      let finalResult = null;
      
      while (attempts < MAX_POLL_ATTEMPTS) {
        const status = await judge0Client.getSubmissionStatus(tokens[i]);
        if (status.status.id > 2) {
          finalResult = status;
          break;
        }
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
        attempts++;
      }

      if (finalResult) {
        results.push(parseJudge0Result(finalResult, testCases[i].expectedOutput));
      } else {
        // Timeout
        results.push({
          status: 'Internal Error',
          output: '',
          passed: false,
          time: 0,
          memory: 0,
          error: 'Execution timed out'
        });
      }
      
      // Delay before polling next token
      if (i < tokens.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return results;
  }
};
