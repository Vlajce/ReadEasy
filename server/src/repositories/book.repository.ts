import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { Book, type IBook } from "../models/book.model.js";
import type { BookInput, FindBooksQuery } from "../validation/book.schema.js";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

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

/**
 * Returns a readable stream for the public book content.
 * Throws { status: number, message: string } on error.
 */
const findPublicBookContentById = async (
  id: string,
): Promise<{ stream: NodeJS.ReadableStream; size: number }> => {
  const book = await Book.findOne({ _id: id, visibility: "public" }).exec();
  if (!book) {
    throw { status: 404, message: "Book not found" };
  }

  if (!book.filepath) {
    throw { status: 404, message: "Book content not found" };
  }

  const absolute = path.resolve(STORAGE_ROOT, book.filepath);
  const relative = path.relative(STORAGE_ROOT, absolute);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw { status: 400, message: "Invalid book filepath" };
  }

  try {
    const stats = await fsPromises.stat(absolute);
    if (!stats.isFile()) {
      throw { status: 404, message: "Book content not found" };
    }
    await fsPromises.access(absolute, fs.constants.R_OK);
    const stream = fs.createReadStream(absolute, { encoding: "utf8" });
    return { stream, size: stats.size };
  } catch (err) {
    console.error("Find public book content error:", err);
    throw { status: 404, message: "Book content not found" };
  }
};

const findPrivateBooks = async (userId: string): Promise<IBook[]> => {
  return Book.find({ visibility: "private", ownerId: userId }).exec();
};

const createPrivateBook = async (
  data: Pick<
    BookInput,
    "title" | "author" | "language" | "filepath" | "wordCount"
  > & { ownerId: string },
): Promise<IBook> => {
  return Book.create({
    ...data,
    visibility: "private",
  });
};

const countWordsInFile = async (filePath: string): Promise<number> => {
  const content = await fsPromises.readFile(filePath, "utf-8");
  const trimmed = content.replace(/\s+/g, " ").trim();
  if (!trimmed) return 0;
  return trimmed.split(" ").length;
};

const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fsPromises.unlink(filePath);
  } catch (err) {
    console.error("Failed to delete file:", filePath, err);
  }
};

export const bookRepository = {
  insertManyBooks,
  findPublicBookById,
  findPublicBooks,
  findPublicBookContentById,
  findPrivateBooks,
  createPrivateBook,
  countWordsInFile,
  deleteFile,
};
