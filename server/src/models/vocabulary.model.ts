import mongoose, { Schema } from "mongoose";

export const HIGHLIGHT_COLORS = [
  "yellow",
  "green",
  "blue",
  "pink",
  "purple",
] as const;

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

export interface IVocabularyEntry {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  word: string;
  language: string;
  baseForm: string;
  translation: string;
  targetLanguage: string;
  partOfSpeech: string;
  contexts: string[];
  status: "new" | "learning" | "mastered";
  highlightColor: HighlightColor;
  bookSnapshot: {
    title: string;
    author: string;
  };
  reviewCount: number;
  lastReviewedAt?: Date | null;
  statusHistory?: Array<{
    status: "new" | "learning" | "mastered";
    changedAt: Date;
  }>;
  correctCount: number;
  incorrectCount: number;
  consecutiveIncorrect: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookSnapshotSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const statusHistoryItemSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["new", "learning", "mastered"],
      required: true,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false },
);

const vocabularySchema = new Schema<IVocabularyEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    language: {
      type: String,
      required: true,
      lowercase: true,
      minlength: 2,
      maxlength: 2,
    },
    baseForm: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    translation: {
      type: String,
      required: true,
      trim: true,
    },
    targetLanguage: {
      type: String,
      required: true,
      lowercase: true,
      minlength: 2,
      maxlength: 2,
    },
    partOfSpeech: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contexts: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["new", "learning", "mastered"],
      default: "new",
    },
    highlightColor: {
      type: String,
      enum: HIGHLIGHT_COLORS,
      default: "yellow",
    },
    bookSnapshot: {
      type: bookSnapshotSchema,
      required: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    statusHistory: {
      type: [statusHistoryItemSchema],
      default: [],
    },
    correctCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    consecutiveIncorrect: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  { timestamps: true },
);

vocabularySchema.index(
  { userId: 1, baseForm: 1, translation: 1, targetLanguage: 1 },
  { unique: true, name: "idx_unique_entry" },
);

vocabularySchema.index({ userId: 1, createdAt: -1 }, { name: "idx_feed" });

vocabularySchema.index(
  { userId: 1, bookId: 1, createdAt: -1 },
  { name: "idx_book_feed" },
);

vocabularySchema.index(
  { userId: 1, status: 1, language: 1, createdAt: -1 },
  { name: "idx_status_lang_feed" },
);

// Prefix search (brza pretraga po word)
vocabularySchema.index({ userId: 1, word: 1 }, { name: "idx_user_word" });

vocabularySchema.index(
  { word: "text", contexts: "text" },
  {
    name: "idx_text_search",
    weights: { word: 10, contexts: 1 },
    default_language: "english",
    language_override: "none",
  },
);

// Stats indexes
vocabularySchema.index(
  { userId: 1, reviewCount: 1 },
  { name: "idx_stats_reviewed" },
);

vocabularySchema.index(
  { userId: 1, lastReviewedAt: -1 },
  { name: "idx_stats_last_reviewed" },
);

// Exercises index
vocabularySchema.index(
  { userId: 1, language: 1, status: 1, lastReviewedAt: 1 },
  { name: "idx_exercises_feed" },
);

export const VocabularyEntry = mongoose.model<IVocabularyEntry>(
  "VocabularyEntry",
  vocabularySchema,
);
