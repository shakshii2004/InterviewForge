import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  extractedText: string;
  uploadedAt: Date;
}

const resumeSchema = new Schema<IResume>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // 1:1 relationship
  },
  fileName: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
