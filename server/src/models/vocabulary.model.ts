import mongoose, { Schema } from "mongoose";

export interface IVocabulary {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  word: string;
  meaning?: string | null;
  bookId?: mongoose.Types.ObjectId | null;
  context?: string | null;
  position?: { startOffset: number; endOffset: number } | null;
  language?: string | null;
  status: "new" | "learning" | "mastered";
  occurrenceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const positionSchema = new Schema(
  {
    startOffset: { type: Number, min: 0 },
    endOffset: { type: Number, min: 0 },
  },
  { _id: false },
);

const vocabularySchema = new Schema<IVocabulary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    word: { type: String, required: true, trim: true, lowercase: true },
    meaning: { type: String, default: null, maxlength: 500 },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      default: null,
      index: true,
    },
    context: { type: String, default: null, maxlength: 500 },
    position: {
      type: positionSchema,
      default: null,
    },
    language: { type: String, maxlength: 2, default: null },
    status: {
      type: String,
      enum: ["new", "learning", "mastered"],
      default: "new",
      index: true,
    },
    occurrenceCount: { type: Number, default: 1, min: 0 },
  },

  { timestamps: true },
);

// Ensure unique vocabulary words per user
vocabularySchema.index({ userId: 1, word: 1 }, { unique: true });

// Text index for search functionality
vocabularySchema.index({ word: "text", meaning: "text", context: "text" });

export const Vocabulary = mongoose.model<IVocabulary>(
  "Vocabulary",
  vocabularySchema,
);
