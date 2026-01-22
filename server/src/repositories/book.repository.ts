import { Book, type IBook } from "../models/book.model.js";
import type { BookInput, FindBooksQuery } from "../validation/book.schema.js";
import fs from "fs/promises";
import path from "path";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

const createBook = async (data: BookInput): Promise<IBook> => {
  const existing = await Book.findOne({ filepath: data.filepath }).exec();
  if (existing) return existing;

  return await Book.create(data);
};

const insertManyBooks = async (books: BookInput[]): Promise<IBook[]> => {
  return await Book.insertMany(books, { ordered: false });
};

const findPublicBooks = async (
  query: FindBooksQuery,
): Promise<PaginatedResult<IBook>> => {
  const pageNum = Math.max(1, Number(query.page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const filter: Record<string, unknown> = { visibility: "public" };
  if (query.language) filter.language = query.language.toLowerCase();

  if (query.search) {
    const escaped = String(query.search)
      .slice(0, 100)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: new RegExp(escaped, "i") },
      { author: new RegExp(escaped, "i") },
    ];
  }

  const sortField = query.sortBy || "wordCount";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

  const total = await Book.countDocuments(filter).exec();
  const totalPages = Math.ceil(total / limitNum);

  const effectivePage = totalPages > 0 ? Math.min(pageNum, totalPages) : 1;

  const data = await Book.find(filter)
    .select("-filepath -__v")
    .sort(sort)
    .skip((effectivePage - 1) * limitNum)
    .limit(limitNum)
    .lean()
    .exec();

  return {
    data,
    meta: {
      page: effectivePage,
      limit: limitNum,
      totalItems: total,
      totalPages: totalPages,
    },
  };
};

const findPublicBookById = async (id: string): Promise<IBook | null> => {
  return Book.findOne({ _id: id, visibility: "public" })
    .select("-filepath -__v")
    .lean()
    .exec();
};

const findPublicBookContent = async (id: string): Promise<string | null> => {
  const book = await Book.findById(id)
    .select("filepath visibility")
    .lean()
    .exec();
  if (!book || book.visibility !== "public") return null;

  try {
    const filepath = path.resolve("storage/", book.filepath);
    const content = await fs.readFile(filepath, "utf-8");
    return content;
  } catch (error) {
    console.error("Error reading book content:", error);
    return null;
  }
};

const findPrivateBooks = async (userId: string): Promise<IBook[]> => {
  return Book.find({ visibility: "private", ownerId: userId }).exec();
};

export const bookRepository = {
  createBook,
  insertManyBooks,
  findPublicBookById,
  findPublicBookContent,
  findPublicBooks,
  findPrivateBooks,
};
