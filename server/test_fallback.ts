import { AIProviderFactory } from './src/services/ai/AIProviderFactory';
import * as dotenv from 'dotenv';
dotenv.config(); // Load real env variables

async function testFallback() {
  console.log("=== AI Fallback System Test ===");
  console.log("Initial GROQ Key:", process.env.GROQ_API_KEY ? "Present" : "Missing");
  console.log("Initial OpenRouter Key:", process.env.OPENROUTER_API_KEY ? "Present" : "Missing");
  console.log("Initial Gemini Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

  // Force Groq to fail with an invalid key
  process.env.GROQ_API_KEY = "invalid_groq_key_to_force_failure";
  
  const prompt = `Generate ONE simple technical interview question. Return ONLY a valid JSON object matching this schema exactly:
{
  "question": "The interview question text",
  "category": "e.g., System Design",
  "difficulty": "Easy",
  "expectedPoints": ["point 1", "point 2"],
  "followUps": ["potential follow up 1", "potential follow up 2"]
}`;

  try {
    console.log("\nTriggering prompt...");
    const response = await AIProviderFactory.generateInterviewQuestions(prompt);
    console.log("\n✅ Success! Final Response:");
    console.log(response);
  } catch (error: any) {
    console.error("\n❌ Test Failed/Completed with Error:");
    console.error(error.message);
  }
}

testFallback();
