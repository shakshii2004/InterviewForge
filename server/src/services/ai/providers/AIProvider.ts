export interface GenerationContext {
  role: string;
  experience: string;
  interviewType: string;
  difficulty: string;
  resumeText?: string;
  previousQuestions?: any[];
  previousAnswers?: any[];
  questionNumber: number;
}

export interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: string;
  expectedPoints: string[];
  followUps: string[];
}

export interface AIProvider {
  generateInterviewQuestions(prompt: string): Promise<string>;
  generateFollowUpQuestion(prompt: string): Promise<string>;
  evaluateInterview(prompt: string): Promise<string>;
  analyzeResume(prompt: string): Promise<string>;
  reviewCode(prompt: string): Promise<string>;
  generateRecommendations(prompt: string): Promise<string>;
}
