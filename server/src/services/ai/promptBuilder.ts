import { GenerationContext } from './aiProvider';

export const buildPrompt = (context: GenerationContext): string => {
  const { role, experience, interviewType, difficulty, resumeText, previousQuestions, previousAnswers, questionNumber } = context;

  let prompt = `You are an expert technical interviewer conducting a mock interview for a ${experience} ${role}.
The interview type is: ${interviewType}.
The difficulty is: ${difficulty}.

`;

  if (resumeText) {
    prompt += `The candidate's resume context is below. Use this to personalize the question:
<resume>
${resumeText.substring(0, 3000)}...
</resume>

`;
  }

  if (previousQuestions && previousQuestions.length > 0) {
    prompt += `Previous Questions Asked:\n`;
    previousQuestions.forEach((q, i) => {
      prompt += `Q${i + 1}: ${q.question}\n`;
      if (previousAnswers && previousAnswers[i]) {
        prompt += `A${i + 1}: ${previousAnswers[i].answer}\n`;
      }
    });
    
    prompt += `\nBased on the candidate's last answer, you may ask a follow-up question, or transition to a new topic.\n`;
  }

  prompt += `
Generate ONE interview question for question #${questionNumber}.
Return ONLY a valid JSON object matching this schema exactly:
{
  "question": "The interview question text",
  "category": "e.g., System Design, React, Soft Skills",
  "difficulty": "Easy, Medium, or Hard",
  "expectedPoints": ["point 1", "point 2"],
  "followUps": ["potential follow up 1", "potential follow up 2"]
}`;

  return prompt;
};
