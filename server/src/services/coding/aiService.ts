import { GoogleGenAI, Type, Schema } from '@google/genai';

const editorialSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    approach: {
      type: Type.STRING,
      description: "A high-level explanation of how to solve the problem optimally."
    },
    bruteForce: {
      type: Type.STRING,
      description: "A description of the brute-force approach and why it is inefficient."
    },
    optimal: {
      type: Type.STRING,
      description: "Markdown formatted code block showing the optimal solution in Python and Java."
    },
    timeComplexity: {
      type: Type.STRING,
      description: "The time complexity (e.g., O(N log N)) with a brief explanation."
    },
    spaceComplexity: {
      type: Type.STRING,
      description: "The space complexity (e.g., O(N)) with a brief explanation."
    },
    interviewTips: {
      type: Type.STRING,
      description: "Tips on how to communicate this solution in a real interview, and common pitfalls."
    }
  },
  required: ["approach", "bruteForce", "optimal", "timeComplexity", "spaceComplexity", "interviewTips"]
};

export const generateAiEditorial = async (title: string, description: string, hints: string[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    
    const prompt = `
      You are an expert technical interviewer and competitive programmer.
      Create a detailed, high-quality editorial for the following algorithmic coding problem.

      Title: ${title}
      Description:
      ${description.substring(0, 1500)} // truncate description to avoid massive token usage

      Hints provided by problem:
      ${hints.join('\n')}

      Your output MUST be a JSON object with the requested schema.
      For the 'optimal' field, write extremely clean code in BOTH Python and Java wrapped in Markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: editorialSchema,
        temperature: 0.2
      }
    });

    if (!response.text) {
      throw new Error('No response from AI');
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error('AI Editorial Generation Error:', error);
    return null; // Return null if generation fails so it doesn't crash the import
  }
};
