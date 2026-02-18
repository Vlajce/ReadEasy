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
  status: "new" | "learning" | "mastered";
  highlightColor: HighlightColor;
  bookSnapshot: {
    title: string;
    author: string;
  };
  meaning?: string | null;
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
    meaning: {
      type: String,
      default: null,
      maxlength: 500,
      lowercase: true,
      trim: true,
    },
    context: { type: String, default: null, maxlength: 500, trim: true },
    position: {
      type: positionSchema,
      default: null,
    },
  },

  { timestamps: true },
);

vocabularySchema.index(
  { userId: 1, word: 1, language: 1 },
  { unique: true, name: "idx_unique_word" },
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

vocabularySchema.index(
  { userId: 1, language: 1, createdAt: -1 },
  { name: "idx_lang_feed" },
);

// Prefix search (brza pretraga po word)
vocabularySchema.index({ userId: 1, word: 1 }, { name: "idx_user_word" });

vocabularySchema.index(
  { word: "text", context: "text" },
  {
    name: "idx_text_search",
    weights: { word: 10, context: 1 },
    default_language: "english",
    language_override: "none",
  },
);

export const VocabularyEntry = mongoose.model<IVocabularyEntry>(
  "VocabularyEntry",
  vocabularySchema,
);
