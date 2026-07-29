import { Request, Response } from 'express';
const pdf = require('pdf-parse');
import { Resume } from '../models/Resume';

// Extend Request type if needed, but we typically use a custom interface in middleware
interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
}

export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Parse the PDF buffer in memory
    const pdfData = await pdf(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim() === '') {
      res.status(400).json({ success: false, message: 'Could not extract text from the PDF. Ensure it is a valid text-based PDF.' });
      return;
    }

    // Delete existing resume for this user to maintain 1:1 relationship
    await Resume.findOneAndDelete({ userId });

    // Save new resume
    const newResume = new Resume({
      userId,
      fileName: req.file.originalname,
      extractedText
    });

    await newResume.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      resume: {
        fileName: newResume.fileName,
        uploadedAt: newResume.uploadedAt,
        // We might not want to send the entire extracted text back every time to save bandwidth,
        // but for this phase, we will return it so the frontend can verify it.
        extractedText: newResume.extractedText
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Server error during upload processing' });
  }
};

export const getResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const resume = await Resume.findOne({ userId });
    if (!resume) {
      res.status(404).json({ success: false, message: 'No resume found' });
      return;
    }

    res.status(200).json({
      success: true,
      resume: {
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
        extractedText: resume.extractedText
      }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await Resume.findOneAndDelete({ userId });
    
    res.status(200).json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
