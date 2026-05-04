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
  | "exampleSentence"
  | "status"
  | "highlightColor"
  | "bookSnapshot"
  | "reviewCount"
  | "correctCount"
  | "incorrectCount"
  | "consecutiveIncorrect"
  | "lastReviewedAt"
  | "statusHistory"
  | "createdAt"
  | "updatedAt"
>;

export const toVocabularyEntryDTO = (
  entry: VocabularyMapperInput,
): VocabularyEntryDTO => ({
  id: entry._id.toString(),
  bookId: entry.bookId.toString(),
  word: entry.word,
  baseForm: entry.baseForm,
  translation: entry.translation,
  targetLanguage: entry.targetLanguage,
  language: entry.language,
  partOfSpeech: entry.partOfSpeech,
  exampleSentence: entry.exampleSentence,
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
  exampleSentence: entry.exampleSentence,
  status: entry.status,
  highlightColor: entry.highlightColor,
  bookSnapshot: entry.bookSnapshot,
  reviewCount: entry.reviewCount,
  correctCount: entry.correctCount,
  incorrectCount: entry.incorrectCount,
  consecutiveIncorrect: entry.consecutiveIncorrect,
  lastReviewedAt: entry.lastReviewedAt
    ? entry.lastReviewedAt.toISOString()
    : null,
  statusHistory: (entry.statusHistory ?? []).map((h) => ({
    status: h.status,
    changedAt: h.changedAt.toISOString(),
  })),
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
});
