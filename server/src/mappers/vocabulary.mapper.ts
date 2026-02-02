import type { IVocabularyEntry } from "../models/vocabulary.model.js";

type VocabularyMapperInput = Pick<
  IVocabularyEntry,
  | "_id"
  | "userId"
  | "word"
  | "language"
  | "status"
  | "meaning"
  | "bookId"
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
  meaning: entry.meaning ?? null,
});

export const toVocabularyDetailDTO = (entry: VocabularyMapperInput) => ({
  id: entry._id.toString(),
  word: entry.word,
  language: entry.language,
  status: entry.status,
  meaning: entry.meaning ?? null,
  context: entry.context ?? null,
  bookId: entry.bookId ? entry.bookId.toString() : null,
  position: entry.position ?? null,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
});
