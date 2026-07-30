import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './AIProvider';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenAI;
  private model: string = 'gemini-2.0-flash';

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  private async execute(prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing');
    }

    // Attempt real API call first
    const result = await this.genAI.models.generateContent({
      model: this.model,
      contents: prompt
    });
    const content = result.text;
    
    if (!content) {
      throw new Error('Empty response from Gemini');
    }

    return content;
  }

  async generateInterviewQuestions(prompt: string): Promise<string> {
    return this.execute(prompt);
  }

  async generateFollowUpQuestion(prompt: string): Promise<string> {
    return this.execute(prompt);
  }

  async evaluateInterview(prompt: string): Promise<string> {
    return this.execute(prompt);
  }

  async analyzeResume(prompt: string): Promise<string> {
    return this.execute(prompt);
  }

  async reviewCode(prompt: string): Promise<string> {
    return this.execute(prompt);
  }

  async generateRecommendations(prompt: string): Promise<string> {
    return this.execute(prompt);
  }
}
