import mongoose, { Document, Schema } from 'mongoose';

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface MethodParameter {
  name: string;
  type: string;
}

export interface FunctionSignature {
  methodName: string;
  parameters: MethodParameter[];
  returnType: string;
}

export interface ICodingQuestion extends Document {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  topics: string[];
  companies: string[];
  acceptanceRate: number; // percentage
  estimatedTime: number; // in minutes
  starterCode: {
    [language: string]: string;
  };
  signature: FunctionSignature;
  sampleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  timeLimit: number; // in seconds
  memoryLimit: number; // in KB
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true }
}, { _id: false });

const MethodParameterSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }
}, { _id: false });

const FunctionSignatureSchema = new Schema({
  methodName: { type: String, required: true },
  parameters: [MethodParameterSchema],
  returnType: { type: String, required: true }
}, { _id: false });

const CodingQuestionSchema = new Schema<ICodingQuestion>({
  title: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  description: { type: String, required: true },
  constraints: [{ type: String }],
  topics: [{ type: String }],
  companies: [{ type: String }],
  acceptanceRate: { type: Number, default: 50 },
  estimatedTime: { type: Number, default: 30 },
  starterCode: {
    type: Map,
    of: String,
    default: {}
  },
  signature: { type: FunctionSignatureSchema, required: true },
  sampleTestCases: [TestCaseSchema],
  hiddenTestCases: [TestCaseSchema],
  timeLimit: { type: Number, default: 2 }, // standard 2 seconds
  memoryLimit: { type: Number, default: 128000 } // standard 128MB
}, { timestamps: true });

export const CodingQuestion = mongoose.model<ICodingQuestion>('CodingQuestion', CodingQuestionSchema);
