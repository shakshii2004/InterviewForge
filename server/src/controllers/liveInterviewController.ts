import { Request, Response } from 'express';
import { InterviewSession } from '../models/InterviewSession';
import { voiceInterviewService } from '../services/voiceInterviewService';

export const startLiveInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, experienceLevel, interviewType, difficulty, duration, communicationMode, resumeId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const session = new InterviewSession({
      userId,
      role,
      experienceLevel,
      interviewType,
      difficulty,
      duration,
      communicationMode: communicationMode || 'Text',
      resumeId,
      status: 'in-progress',
      totalQuestions: duration === 15 ? 3 : duration === 30 ? 5 : duration === 45 ? 7 : 10,
      startedAt: new Date(),
      transcript: []
    });

    await session.save();
    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const updateTranscript = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { speaker, text } = req.body;
    const userId = req.user?.id;

    const session = await InterviewSession.findOne({ _id: sessionId as string, userId });
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    if (session.status !== 'in-progress') {
      res.status(400).json({ message: 'Interview is not in progress' });
      return;
    }

    session.transcript?.push({
      speaker,
      text,
      timestamp: new Date()
    });

    await session.save();
    res.json({ message: 'Transcript updated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const finishLiveInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { speechMetrics } = req.body;
    const userId = req.user?.id;

    const session = await InterviewSession.findOne({ _id: sessionId as string, userId });
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    session.status = 'completed';
    session.completedAt = new Date();
    if (speechMetrics) {
      session.speechMetrics = speechMetrics;
    }

    await session.save();

    // Trigger AI evaluation generation in background or return immediately
    // Ideally we pass this to a service to generate the complete evaluation.
    await voiceInterviewService.generateEvaluation(sessionId as string);

    res.json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const getLiveInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    const session = await InterviewSession.findOne({ _id: sessionId as string, userId });
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
