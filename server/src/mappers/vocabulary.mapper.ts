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
  | "baseForm"
  | "translation"
  | "targetLanguage"
  | "language"
  | "partOfSpeech"
  | "contexts"
  | "status"
  | "highlightColor"
  | "bookSnapshot"
  | "createdAt"
  | "updatedAt"
>;

export const toVocabularyEntryDTO = (
  entry: VocabularyMapperInput,
): VocabularyEntryDTO => ({
  id: entry._id.toString(),
  word: entry.word,
  baseForm: entry.baseForm,
  translation: entry.translation,
  targetLanguage: entry.targetLanguage,
  language: entry.language,
  partOfSpeech: entry.partOfSpeech,
  contexts: entry.contexts,
  status: entry.status,
  highlightColor: entry.highlightColor,
  bookSnapshot: entry.bookSnapshot,
});

export const toVocabularyEntryDetailDTO = (
  entry: VocabularyMapperInput,
): VocabularyEntryDetailDTO => ({
  id: entry._id.toString(),
  bookId: entry.bookId.toString(),
  word: entry.word,
  baseForm: entry.baseForm,
  translation: entry.translation,
  targetLanguage: entry.targetLanguage,
  language: entry.language,
  partOfSpeech: entry.partOfSpeech,
  contexts: entry.contexts,
  status: entry.status,
  highlightColor: entry.highlightColor,
  bookSnapshot: entry.bookSnapshot,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
});
