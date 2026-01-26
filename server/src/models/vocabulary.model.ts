import mongoose, { Schema } from "mongoose";

export interface IVocabularyEntry {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  word: string;
  language: string;
  status: "new" | "learning" | "mastered";
  meaning?: string | null;
  bookId?: mongoose.Types.ObjectId | null;
  context?: string | null;
  position?: { startOffset: number; endOffset: number } | null;
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

const vocabularySchema = new Schema<IVocabularyEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      lowercase: true,
      minlength: 2,
      maxlength: 2,
      index: true,
    },
    status: {
      type: String,
      enum: ["new", "learning", "mastered"],
      default: "new",
      index: true,
    },
    meaning: {
      type: String,
      default: null,
      maxlength: 500,
      lowercase: true,
      trim: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      default: null,
      index: true,
    },
    context: { type: String, default: null, maxlength: 500, trim: true },
    position: {
      type: positionSchema,
      default: null,
    },
  },

  { timestamps: true },
);

// Ensure unique vocabulary words per user
vocabularySchema.index({ userId: 1, word: 1, language: 1 }, { unique: true });

// Text index for search functionality
vocabularySchema.index({ word: "text", meaning: "text", context: "text" });

export const VocabularyEntry = mongoose.model<IVocabularyEntry>(
  "VocabularyEntry",
  vocabularySchema,
);
