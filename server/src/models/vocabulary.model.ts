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
      // Index uklonjen jer je prvi deo svih compound indeksa
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
    },
    context: { type: String, default: null, maxlength: 500, trim: true },
    position: {
      type: positionSchema,
      default: null,
    },
  },

  { timestamps: true },
);

// =================================================
// INDEKSI ZA OPTIMIZACIJU (PERFORMANSE)
// =================================================

// 1. UNIQUE (Integritet)
// Sprečava duplikate reči
vocabularySchema.index(
  { userId: 1, word: 1, language: 1 },
  { unique: true, name: "idx_unique_word" },
);

// 2. MAIN FEED (Samo paginacija)
// Koristi se kad nema filtera
vocabularySchema.index({ userId: 1, createdAt: -1 }, { name: "idx_feed" });

// 3. FILTER PO STATUSU
// Koristi se npr: ?status=learning
vocabularySchema.index(
  { userId: 1, status: 1, createdAt: -1 },
  { name: "idx_status_feed" },
);

// 4. FILTER PO JEZIKU
// Koristi se npr: ?language=en
vocabularySchema.index(
  { userId: 1, language: 1, createdAt: -1 },
  { name: "idx_lang_feed" },
);

// 5. FILTER PO KNJIZI
// Koristi se npr: ?bookId=123
vocabularySchema.index(
  { userId: 1, bookId: 1, createdAt: -1 },
  { name: "idx_book_feed" },
);

// 6. KOMBINACIJA STATUS + JEZIK (Ovo si tražio!)
// Koristi se npr: ?status=learning&language=en
// Bez ovog indeksa, baza bi koristila jedan od gornjih i filtrirala ostatak u memoriji.
vocabularySchema.index(
  { userId: 1, status: 1, language: 1, createdAt: -1 },
  { name: "idx_status_lang_feed" },
);

// 7. FULL TEXT SEARCH
// Za pretragu reči ili značenja
vocabularySchema.index(
  { word: "text", meaning: "text", context: "text", userId: 1 },
  { name: "idx_text_search" },
);

export const VocabularyEntry = mongoose.model<IVocabularyEntry>(
  "VocabularyEntry",
  vocabularySchema,
);
