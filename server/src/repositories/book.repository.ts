import { Book, type IBook } from "../models/book.model.js";
import type { BookInput, FindBooksQuery } from "../validation/book.schema.js";
import { storageService } from "../services/storage.service.js";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

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

  // Delegiramo Storage Servisu -> On brine o putanjama, pravima pristupa i streamovanju
  try {
    return await storageService.getFileStream(book.filepath);
  } catch (error) {
    console.error("Storage error for public book:", error);
    throw { status: 404, message: "Book content missing on disk" };
  }
};

const findPrivateBooks = async (userId: string): Promise<IBook[]> => {
  return Book.find({ visibility: "private", ownerId: userId })
    .select("-filepath -__v")
    .sort({ createdAt: -1 })
    .lean()
    .exec();
};

const findPrivateBookById = async (
  id: string,
  userId: string,
): Promise<IBook | null> => {
  return Book.findOne({ _id: id, visibility: "private", ownerId: userId })
    .select("-filepath -__v")
    .lean()
    .exec();
};

const findPrivateBookContentById = async (
  id: string,
  userId: string,
): Promise<{ stream: NodeJS.ReadableStream; size: number }> => {
  const book = await Book.findOne({
    _id: id,
    visibility: "private",
    ownerId: userId,
  }).exec();

  if (!book) {
    throw { status: 404, message: "Book not found" };
  }

  if (!book.filepath) {
    throw { status: 404, message: "Book content not found" };
  }

  try {
    return await storageService.getFileStream(book.filepath);
  } catch (error) {
    console.error("Storage error for private book:", error);
    throw { status: 404, message: "Book content missing on disk" };
  }
};

const createPrivateBook = async (
  data: Pick<
    BookInput,
    "title" | "author" | "language" | "filepath" | "wordCount"
  > & { ownerId: string },
): Promise<IBook> => {
  // Ovde samo upisujemo u bazu. Ako postoji duplikat, baza baca grešku koju kontroler hvata.
  return Book.create({
    ...data,
    visibility: "private",
  });
};

const updatePrivateBookMetadata = async (
  id: string,
  userId: string,
  updates: Partial<{
    title: string;
    author: string;
    language: string;
    description?: string;
    subjects?: string[];
  }>,
): Promise<IBook | null> => {
  return Book.findOneAndUpdate(
    { _id: id, visibility: "private", ownerId: userId },
    { $set: updates },
    { new: true, runValidators: true, context: "query" },
  )
    .select("-filepath -__v")
    .lean()
    .exec();
};

const deletePrivateBook = async (
  id: string,
  userId: string,
): Promise<IBook | null> => {
  return Book.findOneAndDelete({
    _id: id,
    visibility: "private",
    ownerId: userId,
  }).exec();
};

const countWordsInFile = async (filePath: string): Promise<number> => {
  return await storageService.countWordsStream(filePath);
};

const deleteFile = async (filePath: string): Promise<void> => {
  await storageService.deleteFile(filePath);
};

export const bookRepository = {
  insertManyBooks,
  findPublicBookById,
  findPublicBooks,
  findPublicBookContentById,
  findPrivateBooks,
  findPrivateBookById,
  findPrivateBookContentById,
  createPrivateBook,
  updatePrivateBookMetadata,
  deletePrivateBook,
  countWordsInFile,
  deleteFile,
};
