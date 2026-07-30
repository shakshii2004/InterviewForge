import { ICodeSubmission } from '../../models/CodeSubmission';
import { ICodingQuestion } from '../../models/CodingQuestion';

export const buildCodeReviewPrompt = (
  submission: ICodeSubmission,
  question: ICodingQuestion,
  executionResults: any[] // Optionally, pass parsed results to the AI for more context
): string => {
  const resultSummary = executionResults ? 
    JSON.stringify(executionResults.map(r => ({ status: r.status, time: r.time, memory: r.memory })), null, 2) 
    : 'No results available';

  return `You are a Senior Software Engineer conducting a rigorous technical interview code review.

Evaluate the candidate's solution for the following coding problem:

# PROBLEM
Title: ${question.title}
Difficulty: ${question.difficulty}
Description: ${question.description}
Constraints: ${question.constraints?.join(' | ') || 'None provided'}

# CANDIDATE SUBMISSION
Language: ${submission.language}
Status: ${submission.status}
Passed Test Cases: ${submission.passedTestCases} / ${submission.totalTestCases}
Execution Time: ${submission.executionTime} ms
Memory Used: ${submission.memoryUsed} KB
Test Results: ${resultSummary}

# SOURCE CODE
\`\`\`${submission.language.toLowerCase()}
${submission.sourceCode}
\`\`\`

# TASK
Provide a comprehensive, objective, and professional code review.
Evaluate correctness, time/space complexity, readability, best practices, and optimization opportunities.

You MUST return the output strictly as a JSON object matching the following structure.
Do not include any markdown formatting or code blocks outside the JSON (e.g. no \`\`\`json ... \`\`\`).
Return ONLY raw JSON.

# EXPECTED JSON STRUCTURE
{
  "overallScore": number (0-100),
  "correctnessScore": number (0-100),
  "timeComplexityScore": number (0-100),
  "spaceComplexityScore": number (0-100),
  "readabilityScore": number (0-100),
  "bestPracticesScore": number (0-100),
  "optimizationScore": number (0-100),
  "summary": "String (2-3 sentences summarizing the overall impression)",
  "timeComplexity": "String (e.g. 'O(N)')",
  "timeComplexityExplanation": "String (Explain WHY this is the time complexity)",
  "spaceComplexity": "String (e.g. 'O(1)')",
  "spaceComplexityExplanation": "String (Explain WHY this is the space complexity)",
  "strengths": ["String", "String"],
  "weaknesses": ["String", "String"],
  "bugs": ["String (List any bugs, leave empty if none)"],
  "edgeCaseAnalysis": [
    { "case": "String (specific edge case)", "handled": boolean }
  ],
  "optimizations": ["String (Suggestions to improve time/space complexity or code structure)"],
  "alternativeApproaches": ["String (Describe briefly alternative ways to solve it)"],
  "interviewerFeedback": "String (Direct, constructive feedback as an interviewer speaking to the candidate)",
  "recommendedTopics": ["String", "String (Topics the candidate should study)"],
  "interviewReadiness": {
    "rating": "String (Must be exactly one of: 'Excellent', 'Good', 'Needs Practice')",
    "feedback": "String (Brief reason for this rating)"
  },
  "industryComparison": {
    "averageScore": number (0-100, e.g. 75),
    "candidateScore": number (0-100, same as overallScore),
    "estimatedPercentile": "String (e.g. 'Top 10%', 'Top 50%')"
  },
  "learningRoadmap": [
    {
      "topic": "String",
      "reason": "String",
      "difficulty": "String (e.g. 'Easy', 'Medium', 'Hard')",
      "estimatedTime": "String (e.g. '30 minutes')"
    }
  ],
  "improvementChecklist": ["String (e.g. 'Improve variable naming')"],
  "interviewerNotes": {
    "communication": number (1-10),
    "codeOrganization": number (1-10),
    "problemSolving": number (1-10),
    "optimizationThinking": number (1-10),
    "debuggingAbility": number (1-10),
    "overallImpression": "String (Overall impression from interviewer perspective)"
  }
}`;
};
