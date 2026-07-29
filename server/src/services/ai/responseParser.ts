import { GeneratedQuestion } from './aiProvider';

export const parseAIResponse = (text: string): GeneratedQuestion => {
  try {
    // Strip markdown formatting if AI still includes it despite JSON mime type
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```$/, '');
    }
    
    const parsed = JSON.parse(cleanText);
    
    // Ensure fallback structure
    return {
      question: parsed.question || "Could you explain your thought process?",
      category: parsed.category || "General",
      difficulty: parsed.difficulty || "Medium",
      expectedPoints: Array.isArray(parsed.expectedPoints) ? parsed.expectedPoints : [],
      followUps: Array.isArray(parsed.followUps) ? parsed.followUps : []
    };
  } catch (error) {
    console.error('Error parsing AI JSON:', error, 'Raw text:', text);
    // Fallback question if AI fails
    return {
      question: "Could you tell me more about your experience with these technologies?",
      category: "Fallback",
      difficulty: "Medium",
      expectedPoints: [],
      followUps: []
    };
  }
};
