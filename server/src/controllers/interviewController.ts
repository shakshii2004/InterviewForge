import { Request, Response } from 'express';
import { InterviewSession } from '../models/InterviewSession';
import { Resume } from '../models/Resume';
import { interviewService } from '../services/interviewService';

interface AuthRequest extends Request {
  user?: any;
}

export const createInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { role, experienceLevel, interviewType, difficulty, duration } = req.body;

    if (!role || !experienceLevel || !interviewType || !difficulty || !duration) {
      res.status(400).json({ success: false, message: 'All setup fields are required.' });
      return;
    }

    const resume = await Resume.findOne({ userId });
    
    const newSession = new InterviewSession({
      userId,
      role,
      experienceLevel,
      interviewType,
      difficulty,
      duration,
      resumeId: resume ? resume._id : undefined,
      status: 'pending',
      totalQuestions: 5
    });

    await newSession.save();

    res.status(201).json({ success: true, sessionId: newSession._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const interviews = await InterviewSession.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInterviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const data = await interviewService.getFullSession(req.params.id as string, userId);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Interview not found' });
  }
};

export const deleteInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    await InterviewSession.findOneAndDelete({ _id: req.params.id, userId });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- NEW AI INTERVIEW CORE ENDPOINTS ---

export const startInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const nextQ = await interviewService.generateNextQuestion(req.params.id as string, userId);
    res.status(200).json({ success: true, data: nextQ });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { answerId, answer, isFinal } = req.body;
    const saved = await interviewService.saveAnswer(answerId, answer, isFinal, userId);
    res.status(200).json({ success: true, answer: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const nextQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const nextQ = await interviewService.generateNextQuestion(req.params.id as string, userId);
    res.status(200).json({ success: true, data: nextQ });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const finishInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const session = await InterviewSession.findOne({ _id: req.params.id, userId });
    if (session) {
      session.status = 'completed';
      session.completedAt = new Date();
      await session.save();
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const evaluateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const evaluation = await interviewService.evaluateInterview(req.params.id as string, userId);
    res.status(200).json({ success: true, data: evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
