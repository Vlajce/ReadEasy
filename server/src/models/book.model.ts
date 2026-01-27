import mongoose, { Schema } from "mongoose";

export interface IBook {
  _id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  language: string;
  description?: string;

  subjects?: string[];

  filepath: string;
  coverImagePath?: string;

  wordCount?: number;

  visibility: "public" | "private";
  ownerId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    language: { type: String, required: true, trim: true, index: true },
    description: { type: String, maxlength: 2000 },

    //default jer ako knjiga nemaa subjects, aggregation nece pucati
    //nema null problema na frontu
    subjects: { type: [String], default: [], index: true },

    filepath: { type: String, required: true, trim: true, unique: true },
    coverImagePath: { type: String, trim: true },

    wordCount: { type: Number, min: 0 },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (): boolean {
        return this.visibility === "private";
      },
      index: true,
    },
  },
  { timestamps: true },
);

// Full text search index
bookSchema.index(
  {
    title: "text",
    author: "text",
  },
  { language_override: "dummy_language_field" },
);
// mora jer mongo ne podrzava stemmer za srpski

// Compound index for private library queries, performance index
bookSchema.index({ ownerId: 1, visibility: 1 });

//Sprečava duplikate (isti naslov i jezik) za istog korisnika, SAMO ako je privatna knjiga.
bookSchema.index(
  { ownerId: 1, title: 1, language: 1 },
  { unique: true, partialFilterExpression: { visibility: "private" } },
);

export const Book = mongoose.model<IBook>("Book", bookSchema);
