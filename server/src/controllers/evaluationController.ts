import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { evaluationService } from '../services/evaluation/evaluationService';

export const generateEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const evaluation = await evaluationService.generateEvaluation(req.params.id as string, userId);
    res.status(200).json({ success: true, data: evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const evaluation = await evaluationService.getEvaluation(req.params.id as string, userId);
    res.status(200).json({ success: true, data: evaluation });
  } catch (error: any) {
    if (error.message === 'Evaluation not found') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const deleteEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    await evaluationService.deleteEvaluation(req.params.id as string, userId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
