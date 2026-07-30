import { AIProvider, GenerationContext, GeneratedQuestion } from './aiProvider';
import { buildPrompt } from './promptBuilder';
import { parseAIResponse } from './responseParser';
import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

export class GeminiProvider implements AIProvider {
  async generateQuestion(context: GenerationContext): Promise<GeneratedQuestion> {
    const mockQuestions = [
      {
        question: `Can you tell me about a time you had to overcome a significant technical challenge in your previous role?`,
        expectedTopics: ["Problem-solving methodology", "Technical architecture", "Collaboration"],
        difficulty: "intermediate",
        category: "technical-behavioral"
      },
      {
        question: `How would you design a scalable architecture for a real-time chat application?`,
        expectedTopics: ["WebSockets", "Database sharding", "Load balancing", "Caching"],
        difficulty: "hard",
        category: "system-design"
      },
      {
        question: `Explain the concept of closures in JavaScript and provide a practical use case.`,
        expectedTopics: ["Lexical scoping", "Data privacy", "Event handlers"],
        difficulty: "easy",
        category: "technical"
      },
      {
        question: `Describe a situation where you had a disagreement with a team member over a technical decision. How did you resolve it?`,
        expectedTopics: ["Communication", "Empathy", "Compromise", "Data-driven decisions"],
        difficulty: "intermediate",
        category: "behavioral"
      },
      {
        question: `What are the key differences between SQL and NoSQL databases, and when would you choose one over the other?`,
        expectedTopics: ["ACID properties", "Schema flexibility", "Horizontal scaling", "Use cases"],
        difficulty: "intermediate",
        category: "technical"
      },
      {
        question: `Can you walk me through your process for debugging a complex issue in production?`,
        expectedTopics: ["Logging", "Monitoring", "Root cause analysis", "Rollbacks"],
        difficulty: "intermediate",
        category: "technical-behavioral"
      }
    ];

    // Filter out questions that have already been asked in this session
    const askedQuestionsText = (context.previousQuestions || []).map(q => q.question);
    const availableQuestions = mockQuestions.filter(q => !askedQuestionsText.includes(q.question));

    const pool = availableQuestions.length > 0 ? availableQuestions : mockQuestions;
    const randomQuestion = pool[Math.floor(Math.random() * pool.length)];

    // MOCK MODE: Bypass slow generation to ensure 1-second response time
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(randomQuestion);
      }, 1000);
    });
  }
}
