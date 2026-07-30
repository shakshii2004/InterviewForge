import OpenAI from 'openai';
import { AIProvider } from './AIProvider';

export class OpenRouterProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseURL: 'https://openrouter.ai/api/v1',
    });
    this.model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
  }

  private async execute(prompt: string): Promise<string> {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is missing');
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
      // OpenRouter specific headers recommended but not strictly required
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenRouter');
    
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
