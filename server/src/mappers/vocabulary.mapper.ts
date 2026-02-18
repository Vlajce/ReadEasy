import type { IVocabularyEntry } from "../models/vocabulary.model.js";
import type {
  VocabularyEntryDetailDTO,
  VocabularyEntryDTO,
} from "../types/vocabulary.js";

type VocabularyMapperInput = Pick<
  IVocabularyEntry,
  | "_id"
  | "userId"
  | "bookId"
  | "word"
  | "language"
  | "status"
  | "highlightColor"
  | "bookSnapshot"
  | "meaning"
  | "context"
  | "position"
  | "createdAt"
  | "updatedAt"
>;

export const toVocabularyEntryDTO = (
  entry: VocabularyMapperInput,
): VocabularyEntryDTO => ({
  id: entry._id.toString(),
  word: entry.word,
  language: entry.language,
  status: entry.status,
  highlightColor: entry.highlightColor,
  bookSnapshot: entry.bookSnapshot,
  meaning: entry.meaning ?? null,
});

export const toVocabularyEntryDetailDTO = (
  entry: VocabularyMapperInput,
): VocabularyEntryDetailDTO => ({
  id: entry._id.toString(),
  bookId: entry.bookId.toString(),
  word: entry.word,
  language: entry.language,
  status: entry.status,
  highlightColor: entry.highlightColor,
  bookSnapshot: entry.bookSnapshot,
  meaning: entry.meaning ?? null,
  context: entry.context ?? null,
  position: entry.position ?? null,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
});
