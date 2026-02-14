import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  refreshTokens: string[];
  readingBooks?: IReadingBook[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReadingBook {
  id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  imageUrl?: string;
}

const readingBookSchema = new Schema<IReadingBook>(
  {
    id: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 25,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    readingBooks: {
      type: [readingBookSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// 1. UNIQUE USERNAME (Case-Insensitive) - cuvamo originalni username
userSchema.index(
  { username: 1 },
  {
    unique: true,
    name: "idx_username_unique",
    collation: { locale: "en", strength: 2 }, // 'marko' == 'Marko'
  },
);
userSchema.index({ email: 1 }, { unique: true, name: "idx_email_unique" });

export const User = mongoose.model<IUser>("User", userSchema);
