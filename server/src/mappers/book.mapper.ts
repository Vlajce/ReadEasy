import type { IBook } from "../models/book.model.js";
import type { BookListDTO, BookDetailDTO } from "../types/book.dto.js";

type BookMapperInput = Pick<
  IBook,
  | "_id"
  | "title"
  | "author"
  | "language"
  | "imageUrl"
  | "wordCount"
  | "description"
  | "subjects"
  | "ownerId"
  | "createdAt"
  | "updatedAt"
>;

export const toBookListDTO = (book: BookMapperInput): BookListDTO => ({
  id: book._id.toString(),
  title: book.title,
  author: book.author,
  language: book.language,
  imageUrl: book.imageUrl,
  wordCount: book.wordCount,
});

export const toBookDetailDTO = (book: BookMapperInput): BookDetailDTO => ({
  ...toBookListDTO(book),
  description: book.description,
  subjects: book.subjects || [],
});
