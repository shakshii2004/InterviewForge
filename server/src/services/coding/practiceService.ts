import mongoose from 'mongoose';
import { CodingQuestion } from '../../models/CodingQuestion';
import { Bookmark } from '../../models/Bookmark';

export const practiceService = {
  async getQuestions(filters: any = {}) {
    const query: any = {};
    if (filters.difficulty && filters.difficulty !== 'All') query.difficulty = filters.difficulty;
    if (filters.topic && filters.topic !== 'All') query.topics = filters.topic;
    if (filters.company) query.companies = filters.company;
    
    // We can also support search by title
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const totalQuestions = await CodingQuestion.countDocuments(query);
    
    const questions = await CodingQuestion.find(query)
      .select('-hiddenTestCases -starterCode') // Don't send heavy/hidden fields for list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      questions,
      totalQuestions,
      totalPages: Math.ceil(totalQuestions / limit),
      currentPage: page
    };
  },

  async getBookmarks(userId: string) {
    const bookmarks = await Bookmark.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('questionId', '-hiddenTestCases -starterCode')
      .sort({ createdAt: -1 })
      .lean();
    return bookmarks;
  },

  async toggleBookmark(userId: string, questionId: string) {
    const existing = await Bookmark.findOne({ 
      userId: new mongoose.Types.ObjectId(userId), 
      questionId: new mongoose.Types.ObjectId(questionId) 
    });

    if (existing) {
      await existing.deleteOne();
      return { bookmarked: false };
    } else {
      await Bookmark.create({ 
        userId: new mongoose.Types.ObjectId(userId), 
        questionId: new mongoose.Types.ObjectId(questionId) 
      });
      return { bookmarked: true };
    }
  }
};
