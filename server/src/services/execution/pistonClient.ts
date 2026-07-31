import axios from 'axios';

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';

export interface PistonRequest {
  language: string;
  version: string;
  files: { content: string }[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
}

export interface PistonResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
}

export const pistonClient = {
  async execute(req: PistonRequest): Promise<PistonResponse> {
    try {
      const response = await axios.post<PistonResponse>(PISTON_API_URL, req, {
        timeout: 15000, // 15 seconds overall timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Execution timeout: The execution took too long and was aborted.');
        }
        if (error.response?.data?.message) {
          throw new Error(`Piston API Error: ${error.response.data.message}`);
        }
      }
      throw new Error(error.message || 'Unknown error occurred during execution');
    }
  }
};
