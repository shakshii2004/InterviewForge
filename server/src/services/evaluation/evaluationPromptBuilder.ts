import { IInterviewSession } from '../../models/InterviewSession';
import { IQuestion } from '../../models/Question';
import { IAnswer } from '../../models/Answer';

export function buildEvaluationPrompt(
  session: IInterviewSession, 
  questions: IQuestion[], 
  answers: IAnswer[], 
  resumeText?: string
): string {
  
  const qnaTranscript = questions.map((q, i) => {
    const ans = answers.find(a => a.questionId.toString() === q._id.toString());
    return `
Question ${i + 1}: ${q.question}
Expected Concepts: ${q.expectedPoints?.join(', ')}
Candidate Answer: ${ans?.answer || 'NO ANSWER PROVIDED'}
Time Taken: ${ans?.responseTime || 0} seconds
`;
  }).join('\n');

  return `
You are a senior technical interviewer and hiring manager.
Your task is to evaluate a candidate's complete interview performance and generate a comprehensive feedback report.

Candidate Profile:
- Role: ${session.role}
- Experience Level: ${session.experienceLevel}
- Interview Type: ${session.interviewType}
- Difficulty: ${session.difficulty}
- Interview Duration: ${session.duration} minutes

Resume Snippet (Context):
${resumeText || 'None provided'}

---
INTERVIEW TRANSCRIPT
---
${qnaTranscript}
---

Generate a highly detailed, professional evaluation report in STRICT JSON FORMAT.
Do not output any markdown text or explanations outside of the JSON block.

REQUIRED JSON SCHEMA:
{
  "overallScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "problemSolvingScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "projectScore": <number 0-100>,
  "timeManagementScore": <number 0-100>,
  "summary": "<A 3-4 sentence comprehensive summary of their overall performance>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<area 1>", "<area 2>", ...],
  "questionFeedback": [
    {
      "questionId": "<exact question ID from transcript mapping (use index 0,1,2 etc if ID unavailable)>",
      "score": <number 0-10>,
      "strengths": ["<point 1>", ...],
      "missingPoints": ["<point 1>", ...],
      "feedback": "<Actionable feedback on how to answer this specific question better>"
    }
  ],
  "recommendedTopics": ["<Topic 1>", "<Topic 2>", ...]
}

For the questionFeedback "questionId" field, use the literal index of the question (e.g. "0", "1", "2").
Ensure all scores are fair and realistic based on the exact candidate answers provided.
`;
}
