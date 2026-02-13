import { Book, type IBook } from "../models/book.model.js";
import type { BookInput, FindBooksQuery } from "../validation/book.schema.js";
import { storageService } from "../services/storage.service.js";
import { NotFoundError } from "../errors/not-found.error.js";

const EXCLUDE_FIELDS = {
  filepath: 0,
  __v: 0,
};
type BookVisibility = "public" | "private";

interface BookFilter {
  visibility: BookVisibility;
  ownerId?: string;
}

const findBooks = async (
  filter: BookFilter,
  query: FindBooksQuery,
): Promise<{
  data: IBook[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
}> => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const mongoFilter: Record<string, unknown> = {
    visibility: filter.visibility,
  };

  if (filter.ownerId) {
    mongoFilter.ownerId = filter.ownerId;
  }

  if (query.language) {
    mongoFilter.language = query.language;
  }

  if (query.search) {
    mongoFilter.$text = { $search: query.search };
  }

  const useTextSearch = Boolean(mongoFilter.$text);

  let dataQuery = Book.find(mongoFilter).select(EXCLUDE_FIELDS);

  if (useTextSearch) {
    dataQuery = dataQuery
      .select({ ...EXCLUDE_FIELDS, score: { $meta: "textScore" } })
      .sort({
        score: { $meta: "textScore" },
        createdAt: -1,
      });
  } else {
    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    dataQuery = dataQuery.sort({
      [sortField]: sortOrder,
    });
  }

  const totalItems = await Book.countDocuments(mongoFilter).exec();
  const totalPages = Math.ceil(totalItems / limit);
  const effectivePage = totalPages > 0 ? Math.min(page, totalPages) : 1;

  const data = await dataQuery
    .skip((effectivePage - 1) * limit)
    .limit(limit)
    .lean()
    .exec();

  return {
    data,
    meta: {
      page: effectivePage,
      limit,
      totalItems,
      totalPages,
    },
  };
};

const findBookById = async (
  id: string,
  filter: BookFilter,
): Promise<IBook | null> => {
  const mongoFilter: Record<string, unknown> = {
    _id: id,
    visibility: filter.visibility,
  };

  if (filter.ownerId) {
    mongoFilter.ownerId = filter.ownerId;
  }

  return await Book.findOne(mongoFilter).select(EXCLUDE_FIELDS).lean().exec();
};

const findBookContentById = async (
  id: string,
  filter: BookFilter,
): Promise<{ stream: NodeJS.ReadableStream; size: number } | null> => {
  const mongoFilter: Record<string, unknown> = {
    _id: id,
    visibility: filter.visibility,
  };

  if (filter.ownerId) {
    mongoFilter.ownerId = filter.ownerId;
  }

  const book = await Book.findOne(mongoFilter).lean().exec();
  if (!book || !book.filepath) return null;

  try {
    return await storageService.getFileStream(book.filepath);
  } catch (err: unknown) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
};

const insertManyBooks = async (books: BookInput[]): Promise<IBook[]> => {
  return await Book.insertMany(books, { ordered: false });
};

const findPublicBooks = (query: FindBooksQuery) =>
  findBooks({ visibility: "public" }, query);

const findPrivateBooks = (userId: string, query: FindBooksQuery) =>
  findBooks({ visibility: "private", ownerId: userId }, query);

const findPublicBookById = (id: string) =>
  findBookById(id, { visibility: "public" });

const findPrivateBookById = (id: string, userId: string) =>
  findBookById(id, { visibility: "private", ownerId: userId });

const findPublicBookContentById = (id: string) =>
  findBookContentById(id, { visibility: "public" });

const findPrivateBookContentById = (id: string, userId: string) =>
  findBookContentById(id, { visibility: "private", ownerId: userId });

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

const findDistinctLanguages = async (): Promise<string[]> => {
  return await Book.find({ visibility: "public" }).distinct("language").exec();
};

const countWordsInFile = async (filePath: string): Promise<number> => {
  return await storageService.countWordsStream(filePath);
};

const deleteFile = async (filePath: string): Promise<void> => {
  await storageService.deleteFile(filePath);
};

export const bookRepository = {
  insertManyBooks,
  findPublicBooks,
  findPublicBookById,
  findPublicBookContentById,
  findPrivateBooks,
  findPrivateBookById,
  findPrivateBookContentById,
  createPrivateBook,
  updatePrivateBookMetadata,
  deletePrivateBook,
  findDistinctLanguages,
  countWordsInFile,
  deleteFile,
};
