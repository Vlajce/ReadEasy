import { Book, type IBook } from "../models/book.model.js";
import type { BookInput } from "../validation/book.schema.js";

// Nema race conditiona sve dok se skripta pokrece dok je ser
const createBook = async (data: BookInput): Promise<IBook> => {
  const existing = await Book.findOne({ filepath: data.filepath }).exec();
  if (existing) return existing;

  return await Book.create(data);
};

const findBookById = async (id: string): Promise<IBook | null> => {
  return Book.findById(id).exec();
};

const findBookByFilepath = async (filepath: string): Promise<IBook | null> => {
  return Book.findOne({ filepath }).exec();
};

const findPublicBooks = async (): Promise<IBook[]> => {
  return Book.find({ isPublicDomain: true }).exec();
};

const findPrivateBooks = async (userId: string): Promise<IBook[]> => {
  return Book.find({ isPublicDomain: false, ownerId: userId }).exec();
};

export const bookRepository = {
  createBook,
  findBookById,
  findBookByFilepath,
  findPublicBooks,
  findPrivateBooks,
};
