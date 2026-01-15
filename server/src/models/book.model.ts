import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  language: string;
  description?: string;
  filepath: string;
  coverImagePath?: string;
  wordCount?: number;
  isPublicDomain: boolean;
  ownerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true, index: true },
    language: { type: String, required: true, trim: true, index: true },
    description: { type: String, maxlength: 2000 },
    filepath: { type: String, required: true, trim: true, unique: true },
    coverImagePath: { type: String, trim: true },
    wordCount: { type: Number, min: 0 },
    isPublicDomain: { type: Boolean, default: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (): boolean {
        return !this.isPublicDomain;
      },
    },
  },
  { timestamps: true }
);

bookSchema.index({ isPublicDomain: 1, ownerId: 1 });

export const Book = mongoose.model<IBook>("Book", bookSchema);
