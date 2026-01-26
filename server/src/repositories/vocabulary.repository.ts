import { Types } from "mongoose";
import {
  VocabularyEntry,
  type IVocabularyEntry,
} from "../models/vocabulary.model.js";
import type {
  CreateVocabularyInput,
  UpdateVocabularyInput,
  FindVocabularyQueryInput,
} from "../validation/vocabulary.schema.js";
import type { VocabularyStats } from "../types/vocabulary.types.js";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

const createEntry = async (
  userId: string,
  data: CreateVocabularyInput,
): Promise<IVocabularyEntry> => {
  return VocabularyEntry.create({
    userId,
    word: data.word,
    meaning: data.meaning ?? null,
    bookId: data.bookId ? data.bookId : null,
    context: data.context ?? null,
    position: data.position ?? null,
    language: data.language,
    status: data.status,
  });
};

const findEntries = async (
  userId: string,
  query: FindVocabularyQueryInput,
): Promise<PaginatedResult<IVocabularyEntry>> => {
  const pageNum = Math.max(1, Number(query.page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const filter: Record<string, unknown> = { userId };

  if (query.bookId) filter.bookId = query.bookId;
  if (query.status) filter.status = query.status;
  if (query.language) filter.language = query.language;

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const total = await VocabularyEntry.countDocuments(filter).exec();
  const totalPages = Math.ceil(total / limitNum);
  const effectivePage = totalPages > 0 ? Math.min(pageNum, totalPages) : 1;

  const data = await VocabularyEntry.find(filter)
    .sort({ createdAt: -1 })
    .skip((effectivePage - 1) * limitNum)
    .limit(limitNum)
    .lean()
    .exec();

  return {
    data,
    meta: {
      page: effectivePage,
      limit: limitNum,
      totalItems: total,
      totalPages,
    },
  };
};

const findEntryById = async (
  id: string,
  userId: string,
): Promise<IVocabularyEntry | null> => {
  return VocabularyEntry.findOne({ _id: id, userId }).lean().exec();
};

const updateEntry = async (
  id: string,
  userId: string,
  data: UpdateVocabularyInput,
): Promise<IVocabularyEntry | null> => {
  return VocabularyEntry.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true },
  )
    .lean()
    .exec();
};

const deleteEntry = async (id: string, userId: string): Promise<boolean> => {
  const result = await VocabularyEntry.deleteOne({ _id: id, userId }).exec();
  return result.deletedCount === 1;
};

const getVocabularyStats = async (userId: string): Promise<VocabularyStats> => {
  const userObjectId = new Types.ObjectId(userId);

  const statusAgg = await VocabularyEntry.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const byStatus: VocabularyStats["byStatus"] = {
    new: 0,
    learning: 0,
    mastered: 0,
  };
  statusAgg.forEach((item) => {
    byStatus[item._id as "new" | "learning" | "mastered"] = item.count;
  });

  const languageAgg = await VocabularyEntry.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: "$language", count: { $sum: 1 } } },
  ]);

  const byLanguage: VocabularyStats["byLanguage"] = {};
  languageAgg.forEach((item) => {
    byLanguage[item._id] = item.count;
  });

  const dayAgg = await VocabularyEntry.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const byDay: VocabularyStats["byDay"] = {};
  dayAgg.forEach((item) => {
    byDay[item._id] = item.count;
  });
  return { byStatus, byLanguage, byDay };
};

export const vocabularyRepository = {
  createEntry,
  findEntries,
  findEntryById,
  updateEntry,
  deleteEntry,
  getVocabularyStats,
};
