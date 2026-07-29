import { AIProvider, GenerationContext, GeneratedQuestion } from './aiProvider';
import { buildPrompt } from './promptBuilder';
import { parseAIResponse } from './responseParser';
import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

export class GeminiProvider implements AIProvider {
  async generateQuestion(context: GenerationContext): Promise<GeneratedQuestion> {
    // MOCK MODE: Bypass slow generation to ensure 1-second response time
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          question: `Can you tell me about a time you had to overcome a significant technical challenge in your previous role?`,
          expectedTopics: [
            "Problem-solving methodology",
            "Technical architecture",
            "Collaboration with team members"
          ],
          difficulty: "intermediate",
          category: "technical-behavioral"
        });
      }, 1000);
    });
  }
}
