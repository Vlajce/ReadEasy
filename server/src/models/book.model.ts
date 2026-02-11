import mongoose, { Schema } from "mongoose";

export interface IBook {
  _id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  language: string;
  description?: string;

  subjects?: string[];

  filepath: string;
  coverImageUrl?: string;

  wordCount?: number;

  visibility: "public" | "private";
  ownerId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 2000 },

    subjects: { type: [String], default: [] },

    filepath: { type: String, required: true, trim: true, unique: true },
    coverImageUrl: { type: String, trim: true },

    wordCount: { type: Number, min: 0 },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (): boolean {
        return this.visibility === "private";
      },
    },
  },
  { timestamps: true },
);

// Full text search index
// dummy_language_field je tu da bi se izbegao problem sa stemmerom za srpski, koji mongo ne podrzava.
// Bez ovog, mongo bi ignorisao text index za knjige na srpskom, sto znaci da pretraga po naslovu i
// autoru ne bi radila kako treba. Ovim pristupom, text index ce se koristiti bez stemmera, ali ce
// pretraga i dalje raditi za srpski jezik.
bookSchema.index(
  { title: "text", author: "text" },
  {
    name: "idx_book_text_search",
    language_override: "dummy_language_field",
    weights: {
      title: 5,
      author: 2,
    },
  },
);

bookSchema.index(
  { visibility: 1, language: 1, createdAt: -1 },
  { name: "idx_book_public_feed" },
);

bookSchema.index(
  { ownerId: 1, createdAt: -1 },
  { name: "idx_book_private_feed" },
);

bookSchema.index(
  { filepath: 1 },
  { name: "idx_book_filepath_unique", unique: true },
);

bookSchema.index(
  { ownerId: 1, title: 1, language: 1 },
  {
    name: "idx_book_private_duplicate_check",
    unique: true,
    partialFilterExpression: { visibility: "private" },
  },
);

export const Book = mongoose.model<IBook>("Book", bookSchema);
