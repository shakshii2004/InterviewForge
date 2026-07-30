import mongoose, { Document, Schema } from 'mongoose';

export interface ICodeSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  codingSessionId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  language: string;
  sourceCode: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Internal Error';
  passedTestCases: number;
  totalTestCases: number;
  executionTime: number; // Max time across all test cases (in ms)
  memoryUsed: number; // Max memory across all test cases (in KB)
  submittedAt: Date;
}

const codeSubmissionSchema = new Schema<ICodeSubmission>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  codingSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'CodingSession',
    required: true
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'CodingQuestion',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  sourceCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Internal Error'],
    required: true
  },
  passedTestCases: {
    type: Number,
    required: true,
    default: 0
  },
  totalTestCases: {
    type: Number,
    required: true
  },
  executionTime: {
    type: Number,
    default: 0
  },
  memoryUsed: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export const CodeSubmission = mongoose.model<ICodeSubmission>('CodeSubmission', codeSubmissionSchema);
