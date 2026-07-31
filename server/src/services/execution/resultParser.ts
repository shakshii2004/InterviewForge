import { PistonResponse } from './pistonClient';

export interface ParsedExecutionResult {
  status: string;
  output: string;
  expectedOutput?: string;
  passed: boolean;
  time: number;
  memory: number;
  error?: string;
}

export const parsePistonResult = (result: PistonResponse, expectedOutput?: string): ParsedExecutionResult => {
  const time = 0; // Piston does not return execution time in the standard response
  const memory = 0; // Piston does not return memory usage

  // Handle compilation error
  if (result.compile && result.compile.code !== 0) {
    return {
      status: 'Compilation Error',
      output: '',
      passed: false,
      time,
      memory,
      error: result.compile.stderr || result.compile.output
    };
  }

  // Handle runtime error or timeout
  if (result.run.code !== 0) {
    let status = 'Runtime Error';
    if (result.run.signal === 'SIGKILL' || result.run.signal === 'SIGXCPU') {
      status = 'Time Limit Exceeded';
    }
    return {
      status,
      output: result.run.stdout,
      passed: false,
      time,
      memory,
      error: result.run.stderr || result.run.output || `Process exited with code ${result.run.code}`
    };
  }

  // Handle successful execution
  const output = (result.run.stdout || '').trim();
  const expected = (expectedOutput || '').trim();
  const passed = expected === '' || output === expected;

  return {
    status: passed ? 'Accepted' : 'Wrong Answer',
    output,
    expectedOutput: expected,
    passed,
    time,
    memory
  };
};
