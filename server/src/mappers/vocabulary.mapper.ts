import type { IVocabularyEntry } from "../models/vocabulary.model.js";

type VocabularyMapperInput = Pick<
  IVocabularyEntry,
  | "_id"
  | "userId"
  | "bookId"
  | "word"
  | "language"
  | "status"
  | "bookSnapshot"
  | "meaning"
  | "context"
  | "position"
  | "createdAt"
  | "updatedAt"
>;

export const toVocabularyListDTO = (entry: VocabularyMapperInput) => ({
  id: entry._id.toString(),
  word: entry.word,
  language: entry.language,
  status: entry.status,
  bookSnapshot: entry.bookSnapshot,
  meaning: entry.meaning ?? null,
});

export const toVocabularyDetailDTO = (entry: VocabularyMapperInput) => ({
  id: entry._id.toString(),
  bookId: entry.bookId.toString(),
  word: entry.word,
  language: entry.language,
  status: entry.status,
  bookSnapshot: entry.bookSnapshot,
  meaning: entry.meaning ?? null,
  context: entry.context ?? null,
  position: entry.position ?? null,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
});
