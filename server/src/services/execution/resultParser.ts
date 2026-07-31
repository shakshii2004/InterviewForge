export interface ParsedExecutionResult {
  status: string;
  output: string;
  expectedOutput?: string;
  passed: boolean;
  time: number;
  memory: number;
  error?: string;
}
