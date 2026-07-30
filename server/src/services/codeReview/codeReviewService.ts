import { CodeReview } from '../../models/CodeReview';
import { CodeSubmission } from '../../models/CodeSubmission';
import { CodingQuestion } from '../../models/CodingQuestion';
import { AIProviderFactory } from '../ai/AIProviderFactory';
import { buildCodeReviewPrompt } from './codeReviewPromptBuilder';
import { parseCodeReviewResponse } from './codeReviewParser';

export const codeReviewService = {
  async generateReview(submissionId: string, userId: string) {
    // Check if review already exists
    const existingReview = await CodeReview.findOne({ submissionId, userId });
    if (existingReview) {
      return existingReview;
    }

    // Fetch submission
    const submission = await CodeSubmission.findOne({ _id: submissionId, userId });
    if (!submission) {
      throw new Error('Submission not found or unauthorized');
    }

    // Fetch question
    const question = await CodingQuestion.findById(submission.questionId);
    if (!question) {
      throw new Error('Associated question not found');
    }

    // Generate prompt
    // Note: We're passing null for executionResults right now as they are not stored on CodeSubmission directly,
    // but the CodeSubmission itself has the max execution time and memory used, which is enough context.
    const prompt = buildCodeReviewPrompt(submission as any, question as any, []);

    // Call AI Provider
    const rawResponse = await AIProviderFactory.reviewCode(prompt);

    // Parse Response
    const parsedData = parseCodeReviewResponse(rawResponse);

    // Store in DB
    const review = new CodeReview({
      userId,
      submissionId,
      ...parsedData
    });

    const savedReview = await review.save();
    return {
      review: savedReview,
      submission,
      question
    };
  },

  async getReviewBySubmissionId(submissionId: string, userId: string) {
    const review = await CodeReview.findOne({ submissionId, userId });
    if (!review) return null;

    const submission = await CodeSubmission.findOne({ _id: submissionId, userId });
    let question = null;
    if (submission && submission.questionId) {
      question = await CodingQuestion.findById(submission.questionId);
    }

    return {
      review,
      submission,
      question
    };
  },

  async deleteReview(submissionId: string, userId: string) {
    return await CodeReview.findOneAndDelete({ submissionId, userId });
  }
};
