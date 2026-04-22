import { Book } from "../models/book.model.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { ConflictError } from "../errors/conflict.error.js";
import { isMongoDuplicateError } from "../utils/db.errors.js";
import { vocabularyRepository } from "../repositories/vocabulary.repository.js";
import crypto from "crypto";
import type { IVocabularyEntry } from "../models/vocabulary.model.js";
import type {
  CreateVocabularyInput,
  UpdateVocabularyInput,
  FindVocabularyQueryInput,
} from "../validation/vocabulary.schema.js";
import type {
  OverviewStats,
  ActivityStats,
  ActivityStatsItem,
  LanguageStats,
  LanguageStatsItem,
  StatsResponse,
} from "../types/vocabulary.js";
import { translationRepository } from "../repositories/translation.repository.js";
import type { ITranslation } from "../models/translation.model.js";
import { translationService } from "./translation.service.js";

// ─── CRUD ────────────────────────────────────────────────────────────────────

const getEntries = async (
  userId: string,
  query: FindVocabularyQueryInput,
): Promise<{
  data: IVocabularyEntry[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
}> => {
  return vocabularyRepository.findEntries(userId, query);
};

const getEntryById = async (
  id: string,
  userId: string,
): Promise<IVocabularyEntry> => {
  const entry = await vocabularyRepository.findEntryById(id, userId);
  if (!entry) throw new NotFoundError("Vocabulary entry not found");
  return entry;
};

const createEntry = async (
  userId: string,
  data: CreateVocabularyInput,
): Promise<IVocabularyEntry> => {
  const book = await Book.findById(data.bookId)
    .select("title author language")
    .lean()
    .exec();

  if (!book) throw new NotFoundError("Book not found");

  try {
    return await vocabularyRepository.createEntry({
      userId: userId as any,
      bookId: book._id,
      word: data.word,
      baseForm: data.baseForm,
      translation: data.translation,
      targetLanguage: data.targetLanguage,
      language: book.language,
      partOfSpeech: data.partOfSpeech,
      bookSnapshot: { title: book.title, author: book.author },
      contexts: data.contexts ?? [],
      status: data.status ?? "new",
      highlightColor: data.highlightColor ?? "yellow",
    });
  } catch (error) {
    if (isMongoDuplicateError(error)) {
      throw new ConflictError(
        "Vocabulary entry with this translation already exists",
      );
    }
    throw error;
  }
};

const updateEntry = async (
  id: string,
  userId: string,
  data: UpdateVocabularyInput,
): Promise<IVocabularyEntry> => {
  try {
    const updated = await vocabularyRepository.updateEntry(id, userId, data);
    if (!updated) throw new NotFoundError("Vocabulary entry not found");
    return updated;
  } catch (error) {
    if (isMongoDuplicateError(error)) {
      throw new ConflictError(
        "Another vocabulary entry with this word and language already exists",
      );
    }
    throw error;
  }
};

const deleteEntry = async (id: string, userId: string): Promise<void> => {
  const deleted = await vocabularyRepository.deleteEntry(id, userId);
  if (!deleted) throw new NotFoundError("Vocabulary entry not found");
};

const getBookWords = async (
  userId: string,
  bookId: string,
): Promise<{ word: string; highlightColor: string }[]> => {
  return vocabularyRepository.findBookWords(userId, bookId);
};

// ─── STATS ───────────────────────────────────────────────────────────────────

const getOverviewStats = async (userId: string): Promise<OverviewStats> => {
  const data = await vocabularyRepository.getOverviewStatsData(userId);

  const totalWords = data.totalCount[0]?.count || 0;
  const thisWeek = data.thisWeekCount[0]?.count || 0;
  const thisMonth = data.thisMonthCount[0]?.count || 0;

  const byStatus: Record<"new" | "learning" | "mastered", number> = {
    new: 0,
    learning: 0,
    mastered: 0,
  };

  data.byStatus.forEach((item) => {
    if (item._id && ["new", "learning", "mastered"].includes(item._id)) {
      byStatus[item._id as "new" | "learning" | "mastered"] = item.count;
    }
  });

  return {
    totalWords,
    byStatus,
    wordsAdded: {
      thisWeek,
      thisMonth,
    },
  };
};

const getActivityStats = async (
  userId: string,
  days: number = 30,
): Promise<ActivityStats> => {
  const data = await vocabularyRepository.getActivityStatsData(userId, days);

  const addedMap = new Map(
    data.wordsAdded.map((item) => [item._id, item.count]),
  );
  const reviewedMap = new Map(
    data.wordsReviewed.map((item) => [item._id, item.count]),
  );

  const activity: ActivityStatsItem[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const dateStr = date.toISOString().substring(0, 10);

    activity.push({
      date: dateStr,
      wordsAdded: addedMap.get(dateStr) || 0,
      wordsReviewed: reviewedMap.get(dateStr) || 0,
    });
  }

  return { activity };
};

const getLanguageStats = async (userId: string): Promise<LanguageStats> => {
  const data = await vocabularyRepository.getLanguageStatsData(userId);

  const languages: LanguageStatsItem[] = data.map((item) => {
    const new_count = item.byStatus.filter((s) => s === "new").length;
    const learning_count = item.byStatus.filter((s) => s === "learning").length;
    const mastered_count = item.byStatus.filter((s) => s === "mastered").length;

    return {
      language: item._id,
      total: item.total,
      byStatus: {
        new: new_count,
        learning: learning_count,
        mastered: mastered_count,
      },
    };
  });

  return { languages };
};

const getStats = async (
  userId: string,
  days: number = 30,
): Promise<StatsResponse> => {
  const [overview, activity, byLanguage] = await Promise.all([
    getOverviewStats(userId),
    getActivityStats(userId, days),
    getLanguageStats(userId),
  ]);

  return {
    overview,
    activity,
    byLanguage,
  };
};

// ─── AI FLOW ─────────────────────────────────────────────────────────────────

// TODO: translateAndSave — implemented after translation.service is ready

const translateAndSave = async (
  word: string,
  sentence: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<ITranslation> => {};

export const vocabularyService = {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getBookWords,
  getOverviewStats,
  getActivityStats,
  getLanguageStats,
  getStats,
};
