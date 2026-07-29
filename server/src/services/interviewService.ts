import mongoose from 'mongoose';
import { InterviewSession } from '../models/InterviewSession';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { Resume } from '../models/Resume';
import { GeminiProvider } from './ai/geminiProvider';
import { GenerationContext } from './ai/aiProvider';

const aiProvider = new GeminiProvider();

export const interviewService = {
  async generateNextQuestion(interviewId: string, userId: string) {
    const session = await InterviewSession.findOne({ _id: interviewId, userId });
    if (!session) throw new Error('Session not found');
    
    if (session.status === 'completed') {
      throw new Error('Interview already completed');
    }

    if (session.status === 'pending') {
      session.status = 'in-progress';
      session.startedAt = new Date();
    }

    const currentOrder = session.currentQuestionIndex + 1;
    
    if (currentOrder > session.totalQuestions) {
      session.status = 'completed';
      session.completedAt = new Date();
      await session.save();
      return null; // Interview done
    }

    let resumeText = undefined;
    if (session.resumeId) {
      const resume = await Resume.findById(session.resumeId);
      if (resume) resumeText = resume.extractedText;
    }

    const previousQuestions = await Question.find({ interviewId }).sort({ order: 1 });
    const previousAnswers = await Answer.find({ interviewId }).sort({ startedAt: 1 }); // Rough mapping, in reality we map by questionId

    const context: GenerationContext = {
      role: session.role,
      experience: session.experienceLevel,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      resumeText,
      previousQuestions,
      previousAnswers,
      questionNumber: currentOrder
    };

    const generated = await aiProvider.generateQuestion(context);

    const newQuestion = new Question({
      interviewId: session._id,
      order: currentOrder,
      question: generated.question,
      category: generated.category,
      difficulty: generated.difficulty,
      expectedPoints: generated.expectedPoints,
      followUps: generated.followUps,
      aiGenerated: true
    });

    await newQuestion.save();
    
    // Create an empty answer stub to track start time
    const newAnswer = new Answer({
      interviewId: session._id,
      questionId: newQuestion._id,
      answer: '',
      startedAt: new Date()
    });
    await newAnswer.save();

    session.currentQuestionIndex = currentOrder;
    await session.save();

    return { question: newQuestion, answerStub: newAnswer };
  },

  async saveAnswer(answerId: string, answerText: string, isFinal: boolean, userId: string) {
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error('Answer not found');

    const session = await InterviewSession.findOne({ _id: answer.interviewId, userId });
    if (!session) throw new Error('Session not found');

    answer.answer = answerText;
    if (isFinal) {
      answer.submittedAt = new Date();
      answer.responseTime = Math.floor((answer.submittedAt.getTime() - answer.startedAt.getTime()) / 1000);
    }
    
    await answer.save();
    return answer;
  },
  
  async getFullSession(interviewId: string, userId: string) {
    const session = await InterviewSession.findOne({ _id: interviewId, userId });
    if (!session) throw new Error('Session not found');
    
    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    const answers = await Answer.find({ interviewId });
    
    return { session, questions, answers };
  },

  async evaluateInterview(interviewId: string, userId: string) {
    const session = await InterviewSession.findOne({ _id: interviewId, userId });
    if (!session) throw new Error('Session not found');

    if (session.status !== 'completed') {
      throw new Error('Interview is not completed yet');
    }

    if (session.score !== undefined) {
      return this.getFullSession(interviewId, userId); // Already evaluated
    }

    const answers = await Answer.find({ interviewId });
    let totalScore = 0;
    let scoredAnswers = 0;

    // Simulate AI grading delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    for (const answer of answers) {
      if (!answer.score && answer.answer.trim().length > 0) {
        // Mock Grading Logic
        const randomScore = Math.floor(Math.random() * 4) + 6; // Score between 6 and 9
        answer.score = randomScore;
        answer.aiFeedback = "Your response highlighted the core concept well. However, you could improve by providing a more specific real-world example and structuring your answer with the STAR method (Situation, Task, Action, Result) to give it more impact.";
        await answer.save();
        
        totalScore += randomScore;
        scoredAnswers++;
      }
    }

    // Out of 100 possible points (assuming 10 pts per question)
    if (scoredAnswers > 0) {
      session.score = Math.round((totalScore / (scoredAnswers * 10)) * 100);
    } else {
      session.score = 0; // No valid answers provided
    }
    
    await session.save();
    return this.getFullSession(interviewId, userId);
  }
};
