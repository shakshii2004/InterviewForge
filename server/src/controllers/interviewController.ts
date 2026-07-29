import { Request, Response } from 'express';
import { InterviewSession } from '../models/InterviewSession';
import { Resume } from '../models/Resume';

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

    // Validate required fields
    if (!role || !experienceLevel || !interviewType || !difficulty || !duration) {
      res.status(400).json({ success: false, message: 'All setup fields are required.' });
      return;
    }

    // Check if user has a resume uploaded
    const resume = await Resume.findOne({ userId });
    
    const newSession = new InterviewSession({
      userId,
      role,
      experienceLevel,
      interviewType,
      difficulty,
      duration,
      resumeId: resume ? resume._id : undefined,
      status: 'pending'
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      message: 'Interview session created successfully',
      sessionId: newSession._id
    });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const interviews = await InterviewSession.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInterviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const interview = await InterviewSession.findOne({ _id: req.params.id, userId });
    
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const deleted = await InterviewSession.findOneAndDelete({ _id: req.params.id, userId });
    
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Interview session deleted successfully'
    });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
