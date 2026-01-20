import { Book, type IBook } from "../models/book.model.js";
import type { BookInput } from "../validation/book.schema.js";

const createBook = async (data: BookInput): Promise<IBook> => {
  const existing = await Book.findOne({ filepath: data.filepath }).exec();
  if (existing) return existing;

  return await Book.create(data);
};

const insertManyBooks = async (books: BookInput[]): Promise<IBook[]> => {
  return await Book.insertMany(books, { ordered: false });
};

const findBookById = async (id: string): Promise<IBook | null> => {
  return Book.findById(id).exec();
};

const findBookByFilepath = async (filepath: string): Promise<IBook | null> => {
  return Book.findOne({ filepath }).exec();
};

const findPublicBooks = async (): Promise<IBook[]> => {
  return Book.find({ visibility: "public" }).exec();
};

const findPrivateBooks = async (userId: string): Promise<IBook[]> => {
  return Book.find({ visibility: "private", ownerId: userId }).exec();
};

export const bookRepository = {
  createBook,
  insertManyBooks,
  findBookById,
  findBookByFilepath,
  findPublicBooks,
  findPrivateBooks,
};
