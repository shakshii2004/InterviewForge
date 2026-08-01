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
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string; // HTML string
  constraints: string[];
  topics: string[];
  companies: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  hints: string[];
  
  acceptanceRate: number; // percentage
  totalSubmissions: number;
  estimatedTime: number; // in minutes
  
  starterCode: {
    [language: string]: string;
  };
  signature: FunctionSignature;
  sampleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  timeLimit: number; // in seconds
  memoryLimit: number; // in KB
  
  timeComplexity: string;
  spaceComplexity: string;
  aiEditorial: {
    approach?: string;
    bruteForce?: string;
    optimal?: string;
    dryRun?: string;
    interviewTips?: string;
    commonMistakes?: string;
  };
  
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

const ExampleSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String }
}, { _id: false });

const CodingQuestionSchema = new Schema<ICodingQuestion>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'], index: true },
  description: { type: String, required: true },
  constraints: [{ type: String }],
  topics: [{ type: String, index: true }],
  companies: [{ type: String, index: true }],
  examples: [ExampleSchema],
  hints: [{ type: String }],
  
  acceptanceRate: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
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
  memoryLimit: { type: Number, default: 128000 }, // standard 128MB
  
  timeComplexity: { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },
  aiEditorial: {
    approach: { type: String },
    bruteForce: { type: String },
    optimal: { type: String },
    dryRun: { type: String },
    interviewTips: { type: String },
    commonMistakes: { type: String }
  }
}, { timestamps: true });

export const CodingQuestion = mongoose.model<ICodingQuestion>('CodingQuestion', CodingQuestionSchema);
