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
  generateQuestion(context: GenerationContext): Promise<GeneratedQuestion>;
}
