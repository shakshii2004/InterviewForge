import { AIProvider } from './providers/AIProvider';
import { GroqProvider } from './providers/GroqProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';
import { GeminiProvider } from './providers/GeminiProvider';

interface CacheEntry {
  response: string;
  timestamp: number;
}

export class AIProviderFactory {
  private static providers: { name: string; provider: AIProvider }[] = [];
  private static cache: Map<string, CacheEntry> = new Map();
  private static CACHE_TTL_MS = 60 * 1000; // 1 minute

  private static initializeProviders() {
    if (this.providers.length > 0) return; // already initialized

    if (process.env.GROQ_API_KEY) {
      this.providers.push({ name: 'Groq', provider: new GroqProvider() });
    }
    
    if (process.env.OPENROUTER_API_KEY) {
      this.providers.push({ name: 'OpenRouter', provider: new OpenRouterProvider() });
    }
    
    if (process.env.GEMINI_API_KEY) {
      this.providers.push({ name: 'Gemini', provider: new GeminiProvider() });
    }

    if (this.providers.length === 0) {
      // Fallback fallback if no keys at all are configured but user expects the system to boot
      // Though ideally it will throw on execution.
      console.warn("No AI API Keys configured.");
    }
  }

  private static getCacheKey(method: string, prompt: string): string {
    // Simple hash or just concatenation for this scope
    return `${method}:${prompt}`;
  }

  private static checkCache(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL_MS) {
      console.log(`[AI Factory] Cache hit for ${key.substring(0, 50)}...`);
      return entry.response;
    }
    return null;
  }

  private static setCache(key: string, response: string) {
    this.cache.set(key, { response, timestamp: Date.now() });
  }

  static async executeWithFallback(method: keyof AIProvider, prompt: string): Promise<string> {
    this.initializeProviders();

    if (this.providers.length === 0) {
      throw new Error('No AI provider available. Check API keys.');
    }

    const cacheKey = this.getCacheKey(method, prompt);
    const cachedResponse = this.checkCache(cacheKey);
    if (cachedResponse) return cachedResponse;

    for (const { name, provider } of this.providers) {
      let attempts = 0;
      const maxAttempts = 2; // 1 initial + 1 retry

      while (attempts < maxAttempts) {
        attempts++;
        try {
          console.log(`[AI Factory] Attempting ${method} using ${name} (Attempt ${attempts})`);
          // @ts-ignore - We know method is a key of AIProvider and prompt is string
          const response = await provider[method](prompt);
          
          console.log(`[AI Factory] ${name} succeeded.`);
          this.setCache(cacheKey, response);
          return response;
        } catch (error: any) {
          console.error(`[AI Factory] ${name} failed: ${error.message}`);
          if (attempts >= maxAttempts) {
            console.log(`[AI Factory] Switching to next provider...`);
            break; // Break out of retry loop, move to next provider
          }
        }
      }
    }

    throw new Error('All AI providers failed. Unable to generate response.');
  }

  // Helper static methods to match AIProvider interface signature for consumers
  static async generateInterviewQuestions(prompt: string): Promise<string> {
    return this.executeWithFallback('generateInterviewQuestions', prompt);
  }

  static async generateFollowUpQuestion(prompt: string): Promise<string> {
    return this.executeWithFallback('generateFollowUpQuestion', prompt);
  }

  static async evaluateInterview(prompt: string): Promise<string> {
    return this.executeWithFallback('evaluateInterview', prompt);
  }

  static async analyzeResume(prompt: string): Promise<string> {
    return this.executeWithFallback('analyzeResume', prompt);
  }

  static async reviewCode(prompt: string): Promise<string> {
    return this.executeWithFallback('reviewCode', prompt);
  }

  static async generateRecommendations(prompt: string): Promise<string> {
    return this.executeWithFallback('generateRecommendations', prompt);
  }
}
