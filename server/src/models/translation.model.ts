import mongoose, { Schema } from "mongoose";

export interface ITranslation {
  _id: mongoose.Types.ObjectId;
  cacheKey: string;
  word: string;
  translation: string;
  baseForm: string;
  partOfSpeech: string;
  sourceLanguage: string;
  targetLanguage: string;
  hitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const translationSchema = new Schema<ITranslation>(
  {
    cacheKey: {
      type: String,
      required: true,
      unique: true,
    },
    word: {
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
    baseForm: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    partOfSpeech: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    sourceLanguage: {
      type: String,
      required: true,
      lowercase: true,
      minlength: 2,
      maxlength: 2,
    },
    targetLanguage: {
      type: String,
      required: true,
      lowercase: true,
      minlength: 2,
      maxlength: 2,
    },
    hitCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index: expire documents 30 days after creation
translationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30, // 30 days in seconds
    name: "idx_ttl_30_days",
  },
);

// Index for cache statistics queries
translationSchema.index(
  { sourceLanguage: 1, targetLanguage: 1, hitCount: -1 },
  { name: "idx_cache_stats" },
);

export const Translation = mongoose.model<ITranslation>(
  "Translation",
  translationSchema,
);
