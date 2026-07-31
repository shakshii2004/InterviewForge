import axios from 'axios';

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';

export interface JDoodleRequest {
  script: string;
  stdin?: string;
  language: string;
  versionIndex?: string;
}

export interface JDoodleResponse {
  output: string;
  statusCode: number;
  memory: string | null;
  cpuTime: string | null;
  error?: string;
}

export const getJDoodleLanguage = (lang: string): { language: string; versionIndex: string } => {
  const map: Record<string, { language: string; versionIndex: string }> = {
    'java': { language: 'java', versionIndex: '4' }, // Java 17
    'c': { language: 'c', versionIndex: '5' }, // GCC 11.1.0
    'c++': { language: 'cpp', versionIndex: '5' }, // GCC 11.1.0
    'python3': { language: 'python3', versionIndex: '4' }, // Python 3.9
    'python': { language: 'python3', versionIndex: '4' },
    'javascript': { language: 'nodejs', versionIndex: '4' }, // Node.js 17
    'go': { language: 'go', versionIndex: '4' }, // Go 1.17
    'kotlin': { language: 'kotlin', versionIndex: '3' }, // Kotlin 1.6
    'c#': { language: 'csharp', versionIndex: '4' }, // Mono 6.12
  };
  
  const normalized = lang.toLowerCase();
  if (map[normalized]) return map[normalized];
  
  // Default fallback
  return { language: normalized, versionIndex: '0' };
};

export const jdoodleClient = {
  async execute(req: JDoodleRequest): Promise<JDoodleResponse> {
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('JDoodle API credentials are not configured.');
    }

    try {
      const response = await axios.post<JDoodleResponse>(JDOODLE_API_URL, {
        clientId,
        clientSecret,
        script: req.script,
        stdin: req.stdin || '',
        language: req.language,
        versionIndex: req.versionIndex || '0'
      }, {
        timeout: 15000 // 15 seconds timeout
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.error || `JDoodle API Error: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('JDoodle API unavailable or timed out.');
      } else {
        throw new Error(`Execution error: ${error.message}`);
      }
    }
  }
};
