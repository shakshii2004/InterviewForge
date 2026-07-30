import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: Schema.Types.ObjectId, ref: 'CodingQuestion', required: true },
}, { timestamps: true });

// Ensure a user can only bookmark a question once
bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
