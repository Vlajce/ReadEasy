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

const EXCLUDE_FIELDS = "-__v";

type CreateEntryData = Omit<
  IVocabularyEntry,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "reviewCount"
  | "lastReviewedAt"
  | "statusHistory"
>;

const createEntry = async (
  data: CreateEntryData,
): Promise<IVocabularyEntry> => {
  const doc = await VocabularyEntry.create(data);
  return doc.toObject();
};

// AI flow — find existing entry by unique constraint
const findEntry = async (
  userId: string,
  baseForm: string,
  translation: string,
  targetLanguage: string,
): Promise<IVocabularyEntry | null> => {
  return VocabularyEntry.findOne({
    userId,
    baseForm,
    translation,
    targetLanguage,
  })
    .select(EXCLUDE_FIELDS)
    .lean()
    .exec();
};

// AI flow — append context sentence if not already present
const appendContext = async (
  entryId: string,
  sentence: string,
): Promise<IVocabularyEntry | null> => {
  return VocabularyEntry.findOneAndUpdate(
    {
      _id: entryId,
      contexts: { $ne: sentence },
    },
    { $push: { contexts: sentence } },
    { returnDocument: "after" },
  )
    .select(EXCLUDE_FIELDS)
    .lean()
    .exec();
};

const findEntries = async (
  userId: string,
  query: FindVocabularyQueryInput,
): Promise<{
  data: IVocabularyEntry[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
}> => {
  const pageNum = Math.max(1, Number(query.page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const filter: Record<string, unknown> = { userId };

  if (query.bookId) filter.bookId = query.bookId;
  if (query.status) filter.status = query.status;
  if (query.language) filter.language = query.language;

  const hasSearch = !!query.search;
  let useTextSearch = false;

  if (hasSearch) {
    const searchTerm = query.search;

    if (searchTerm!.length <= 4) {
      const escaped = searchTerm!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.word = { $regex: `^${escaped}` };
    } else {
      filter.$text = { $search: searchTerm };
      useTextSearch = true;
    }
  }

  const totalItems = await VocabularyEntry.countDocuments(filter).exec();
  const totalPages = Math.ceil(totalItems / limitNum);
  const effectivePage = totalPages > 0 ? Math.min(pageNum, totalPages) : 1;

  let dataQuery = VocabularyEntry.find(filter).select(EXCLUDE_FIELDS);

  if (useTextSearch) {
    dataQuery = dataQuery.select({ score: { $meta: "textScore" } }).sort({
      score: { $meta: "textScore" },
    });
  } else {
    dataQuery = dataQuery.sort({ createdAt: -1 });
  }

  const data = await dataQuery
    .skip((effectivePage - 1) * limitNum)
    .limit(limitNum)
    .lean()
    .exec();

  return {
    data,
    meta: {
      page: effectivePage,
      limit: limitNum,
      totalItems,
      totalPages,
    },
  };
};

const findEntryById = async (
  id: string,
  userId: string,
): Promise<IVocabularyEntry | null> => {
  return VocabularyEntry.findOne({ _id: id, userId })
    .select(EXCLUDE_FIELDS)
    .lean()
    .exec();
};

const updateEntry = async (
  id: string,
  userId: string,
  data: UpdateVocabularyInput,
): Promise<IVocabularyEntry | null> => {
  return VocabularyEntry.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { returnDocument: "after", runValidators: true },
  )
    .select(EXCLUDE_FIELDS)
    .lean()
    .exec();
};

const deleteEntry = async (id: string, userId: string): Promise<boolean> => {
  const result = await VocabularyEntry.deleteOne({ _id: id, userId }).exec();
  return result.deletedCount === 1;
};

const findBookWords = async (
  userId: string,
  bookId: string,
): Promise<{ word: string; highlightColor: string }[]> => {
  return VocabularyEntry.find({ userId, bookId })
    .select("word highlightColor -_id")
    .lean()
    .exec();
};

const getOverviewStatsData = async (
  userId: string,
): Promise<{
  totalCount: Array<{ count: number }>;
  byStatus: Array<{ _id: string; count: number }>;
  thisWeekCount: Array<{ count: number }>;
  thisMonthCount: Array<{ count: number }>;
}> => {
  const userObjectId = new Types.ObjectId(userId);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [result] = await VocabularyEntry.aggregate([
    { $match: { userId: userObjectId } },
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        thisWeekCount: [
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          { $count: "count" },
        ],
        thisMonthCount: [
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $count: "count" },
        ],
      },
    },
  ]).exec();

  return (
    result || {
      totalCount: [],
      byStatus: [],
      thisWeekCount: [],
      thisMonthCount: [],
    }
  );
};

const getActivityStatsData = async (
  userId: string,
  days: number = 30,
): Promise<{
  wordsAdded: Array<{ _id: string; count: number }>;
  wordsReviewed: Array<{ _id: string; count: number }>;
}> => {
  const userObjectId = new Types.ObjectId(userId);
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [result] = await VocabularyEntry.aggregate([
    {
      $match: {
        userId: userObjectId,
        createdAt: { $gte: daysAgo },
      },
    },
    {
      $facet: {
        wordsAdded: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "UTC",
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        wordsReviewed: [
          {
            $match: {
              lastReviewedAt: { $exists: true, $ne: null },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$lastReviewedAt",
                  timezone: "UTC",
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]).exec();

  return result || { wordsAdded: [], wordsReviewed: [] };
};

const getLanguageStatsData = async (
  userId: string,
): Promise<
  Array<{
    _id: string;
    total: number;
    byStatus: Array<string>;
  }>
> => {
  const userObjectId = new Types.ObjectId(userId);

  return VocabularyEntry.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: "$language",
        total: { $sum: 1 },
        byStatus: { $push: "$status" },
      },
    },
    { $match: { total: { $gt: 0 } } },
    { $sort: { total: -1 } },
  ]).exec();
};

export const vocabularyRepository = {
  createEntry,
  findEntry,
  appendContext,
  findEntries,
  findEntryById,
  findBookWords,
  updateEntry,
  deleteEntry,
  getOverviewStatsData,
  getActivityStatsData,
  getLanguageStatsData,
};
