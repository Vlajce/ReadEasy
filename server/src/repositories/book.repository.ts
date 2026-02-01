import { Book, type IBook } from "../models/book.model.js";
import type { BookInput, FindBooksQuery } from "../validation/book.schema.js";
import { storageService } from "../services/storage.service.js";
import { NotFoundError } from "../errors/not.found.error.js";

const EXCLUDE_FIELDS = "-filepath -__v";

const insertManyBooks = async (books: BookInput[]): Promise<IBook[]> => {
  return await Book.insertMany(books, { ordered: false });
};

const findPublicBooks = async (
  query: FindBooksQuery,
): Promise<{
  data: IBook[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
}> => {
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

  const totalItems = await Book.countDocuments(filter).exec();
  const totalPages = Math.ceil(totalItems / limitNum);
  const effectivePage = totalPages > 0 ? Math.min(pageNum, totalPages) : 1;

  const data = await Book.find(filter)
    .select(EXCLUDE_FIELDS)
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
      totalItems,
      totalPages,
    },
  };
};

const findPublicBookById = async (id: string): Promise<IBook | null> => {
  return await Book.findOne({ _id: id, visibility: "public" })
    .select(EXCLUDE_FIELDS)
    .lean()
    .exec();
};

const findPublicBookContentById = async (
  id: string,
): Promise<{ stream: NodeJS.ReadableStream; size: number } | null> => {
  const book = await Book.findOne({ _id: id, visibility: "public" }).exec();
  if (!book || !book.filepath) return null;

  try {
    return await storageService.getFileStream(book.filepath);
  } catch (err: unknown) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
};

const findPrivateBooks = async (
  userId: string,
  query: FindBooksQuery,
): Promise<{
  data: IBook[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
}> => {
  const pageNum = Math.max(1, Number(query.page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const filter: Record<string, unknown> = {
    visibility: "private",
    ownerId: userId,
  };

  const sortField = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

  const totalItems = await Book.countDocuments(filter).exec();
  const totalPages = Math.ceil(totalItems / limitNum);
  const effectivePage = totalPages > 0 ? Math.min(pageNum, totalPages) : 1;

  const data = await Book.find(filter)
    .select(EXCLUDE_FIELDS)
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
      totalItems,
      totalPages,
    },
  };
};

const findPrivateBookById = async (
  id: string,
  userId: string,
): Promise<IBook | null> => {
  return await Book.findOne({
    _id: id,
    visibility: "private",
    ownerId: userId,
  })
    .select(EXCLUDE_FIELDS)
    .lean()
    .exec();
};

const findPrivateBookContentById = async (
  id: string,
  userId: string,
): Promise<{ stream: NodeJS.ReadableStream; size: number } | null> => {
  const book = await Book.findOne({
    _id: id,
    visibility: "private",
    ownerId: userId,
  }).exec();

  if (!book || !book.filepath) {
    return null;
  }

  try {
    return await storageService.getFileStream(book.filepath);
  } catch (err: unknown) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
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
    .select(EXCLUDE_FIELDS)
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
