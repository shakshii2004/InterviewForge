import { Request, Response } from 'express';
import { codingService } from '../services/codingService';

export const createCodingSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { language, difficulty, topics, numberOfQuestions, duration, questionId } = req.body;

    if (questionId) {
      // Direct question practice mode
      const { CodingQuestion } = await import('../models/CodingQuestion');
      const question = await CodingQuestion.findById(questionId);
      if (!question) {
        res.status(404).json({ message: 'Question not found' });
        return;
      }
      
      const session = await codingService.createSession(userId, {
        language: language || 'JavaScript',
        difficulty: question.difficulty,
        topics: question.topics || ['Practice'],
        numberOfQuestions: 1,
        duration: question.estimatedTime || 45,
        currentQuestion: question._id,
        status: 'active',
        startedAt: new Date()
      });
      res.status(201).json({ sessionId: session._id });
      return;
    }

    // Validation for random session mode
    if (!language || !['Java', 'C++', 'Python', 'JavaScript'].includes(language)) {
      res.status(400).json({ message: 'Invalid or missing language' });
      return;
    }
    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      res.status(400).json({ message: 'Invalid or missing difficulty' });
      return;
    }
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      res.status(400).json({ message: 'Topics must be a non-empty array' });
      return;
    }
    
    // Find a random question matching the criteria
    const { CodingQuestion } = await import('../models/CodingQuestion');
    const questions = await CodingQuestion.find({
      difficulty,
      topics: { $in: topics }
    });
    
    // Fallback if no question matches exact criteria
    if (questions.length === 0) {
      res.status(404).json({ message: `No problems found matching topic '${topics.join(', ')}' and difficulty '${difficulty}'. Try 'Easy' difficulty instead!` });
      return;
    }
    
    // Shuffle questions and select the requested number
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(numberOfQuestions || 1, shuffled.length));
    const selectedIds = selectedQuestions.map(q => q._id);

    const session = await codingService.createSession(userId, {
      language,
      difficulty,
      topics,
      numberOfQuestions: selectedQuestions.length,
      duration: duration || 45,
      currentQuestion: selectedIds[0],
      questions: selectedIds,
      status: 'active',
      startedAt: new Date()
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Create coding session error:', error);
    res.status(500).json({ message: 'Server error creating coding session' });
  }
};

export const getCodingSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const session = await codingService.getSessionById(req.params.id as string, userId);
    if (!session) {
      res.status(404).json({ message: 'Coding session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('Get coding session error:', error);
    res.status(500).json({ message: 'Server error fetching coding session' });
  }
};

export const updateCodingSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const updates = req.body;
    
    // Optional: add validation for updates here
    // e.g., if changing language, ensure it's valid
    if (updates.language && !['Java', 'C++', 'Python', 'JavaScript'].includes(updates.language)) {
      res.status(400).json({ message: 'Invalid language' });
      return;
    }

    // Always update lastSavedAt when patching
    updates.lastSavedAt = new Date();

    // Handle nested map updates for codes
    const finalUpdates: any = { ...updates };
    if (updates.codes) {
      delete finalUpdates.codes;
      for (const [qId, code] of Object.entries(updates.codes)) {
        finalUpdates[`codes.${qId}`] = code;
      }
    }

    const session = await codingService.updateSession(req.params.id as string, userId, finalUpdates);
    if (!session) {
      res.status(404).json({ message: 'Coding session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('Update coding session error:', error);
    res.status(500).json({ message: 'Server error updating coding session' });
  }
};

export const getCodingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const history = await codingService.getHistory(userId);
    const stats = await codingService.getStats(userId);

    res.json({ history, stats });
  } catch (error) {
    console.error('Get coding history error:', error);
    res.status(500).json({ message: 'Server error fetching coding history' });
  }
};

export const deleteCodingSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const session = await codingService.deleteSession(req.params.id as string, userId);
    if (!session) {
      res.status(404).json({ message: 'Coding session not found' });
      return;
    }

    res.json({ message: 'Coding session deleted successfully' });
  } catch (error) {
    console.error('Delete coding session error:', error);
    res.status(500).json({ message: 'Server error deleting coding session' });
  }
};
