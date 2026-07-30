import OpenAI from 'openai';
import { AIProvider } from './AIProvider';

export class GroqProvider implements AIProvider {
  private client: OpenAI;
  private model: string = 'llama-3.3-70b-versatile';

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || '',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  private async execute(prompt: string): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing');
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');
    
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
