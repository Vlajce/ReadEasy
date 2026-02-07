import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  refreshToken: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
    refreshToken: {
      type: [String],
      select: false,
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
