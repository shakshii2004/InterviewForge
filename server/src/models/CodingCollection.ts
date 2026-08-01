import mongoose, { Document, Schema } from 'mongoose';

export interface ICodingCollection extends Document {
  title: string; // e.g., "Blind 75", "Top Interview 150"
  slug: string;
  description: string;
  sections: Array<{
    title: string; // e.g., "Arrays & Hashing"
    problems: mongoose.Types.ObjectId[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSectionSchema = new Schema({
  title: { type: String, required: true },
  problems: [{ type: Schema.Types.ObjectId, ref: 'CodingQuestion' }]
}, { _id: false });

const CodingCollectionSchema = new Schema<ICodingCollection>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  sections: [CollectionSectionSchema]
}, { timestamps: true });

export const CodingCollection = mongoose.model<ICodingCollection>('CodingCollection', CodingCollectionSchema);
