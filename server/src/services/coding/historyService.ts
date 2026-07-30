import mongoose from 'mongoose';
import { CodeSubmission } from '../../models/CodeSubmission';
import { CodeReview } from '../../models/CodeReview';
import { CodingQuestion } from '../../models/CodingQuestion';

export const historyService = {
  async getUserHistory(userId: string, filters: any = {}) {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters.status) query.status = filters.status;
    if (filters.language) query.language = filters.language;
    // Add date range filters if necessary

    const submissions = await CodeSubmission.find(query)
      .sort({ submittedAt: -1 })
      .populate('questionId', 'title difficulty topics companies')
      .lean();

    const submissionIds = submissions.map(s => s._id);
    const reviews = await CodeReview.find({ submissionId: { $in: submissionIds } }).lean();
    
    const reviewMap = new Map(reviews.map(r => [r.submissionId.toString(), r]));

    // Filter by question difficulty or topics if requested
    let result = submissions.map((sub: any) => ({
      ...sub,
      review: reviewMap.get(sub._id.toString()) || null
    }));

    if (filters.difficulty) {
      result = result.filter(r => r.questionId?.difficulty === filters.difficulty);
    }
    if (filters.topic) {
      result = result.filter(r => r.questionId?.topics?.includes(filters.topic));
    }

    return result;
  },

  async getSubmissionDetails(submissionId: string, userId: string) {
    const submission = await CodeSubmission.findOne({ 
      _id: submissionId, 
      userId 
    }).populate('questionId').lean();

    if (!submission) throw new Error('Submission not found');

    const review = await CodeReview.findOne({ submissionId }).lean();
    return { submission, review };
  },

  async deleteSubmission(submissionId: string, userId: string) {
    await CodeSubmission.findOneAndDelete({ _id: submissionId, userId });
    await CodeReview.findOneAndDelete({ submissionId });
    return true;
  },

  async compareAttempts(questionId: string, userId: string) {
    const submissions = await CodeSubmission.find({ 
      questionId, 
      userId 
    }).sort({ submittedAt: 1 }).lean();

    if (submissions.length < 2) {
      return { message: 'Not enough submissions to compare.', submissions };
    }

    const submissionIds = submissions.map(s => s._id);
    const reviews = await CodeReview.find({ submissionId: { $in: submissionIds } }).lean();
    const reviewMap = new Map(reviews.map(r => [r.submissionId.toString(), r]));

    const populatedSubmissions = submissions.map(s => ({
      ...s,
      review: reviewMap.get(s._id.toString()) || null
    }));

    return {
      submissions: populatedSubmissions,
      improvement: {
        runtime: populatedSubmissions[0].executionTime - populatedSubmissions[populatedSubmissions.length - 1].executionTime,
        memory: populatedSubmissions[0].memoryUsed - populatedSubmissions[populatedSubmissions.length - 1].memoryUsed,
      }
    };
  }
};
