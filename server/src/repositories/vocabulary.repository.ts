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
import type { VocabularyStatsDTO } from "../types/vocabulary.js";
import { Book } from "../models/book.model.js";
import { NotFoundError } from "../errors/not-found.error.js";

const EXCLUDE_FIELDS = "-__v";

const createEntry = async (
  userId: string,
  data: CreateVocabularyInput,
): Promise<IVocabularyEntry> => {
  const book = await Book.findById(data.bookId)
    .select("title author")
    .lean()
    .exec();

  if (!book) {
    throw new NotFoundError("Book not found");
  }

  return VocabularyEntry.create({
    userId,
    bookId: data.bookId,
    bookSnapshot: {
      title: book.title,
      author: book.author,
    },
    word: data.word,
    language: data.language,
    status: data.status,
    meaning: data.meaning ?? null,
    context: data.context ?? null,
    position: data.position ?? null,
  });
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
    { new: true, runValidators: true },
  )
    .select(EXCLUDE_FIELDS)
    .lean()
    .exec();
};

const deleteEntry = async (id: string, userId: string): Promise<boolean> => {
  const result = await VocabularyEntry.deleteOne({ _id: id, userId }).exec();
  return result.deletedCount === 1;
};

const getVocabularyStats = async (
  userId: string,
): Promise<VocabularyStatsDTO> => {
  const userObjectId = new Types.ObjectId(userId);

  // 1. JEDAN UPIT DO BAZE (Best Practice)
  // Koristimo Aggregation Framework sa $facet-om da paralelizujemo obradu na nivou baze
  const [result] = await VocabularyEntry.aggregate([
    // Koristi se index { userId: 1, createdAt: -1 } za brzo filtriranje
    { $match: { userId: userObjectId } },
    {
      $facet: {
        // Pipeline 1: Statusi
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        // Pipeline 2: Jezici
        byLanguage: [{ $group: { _id: "$language", count: { $sum: 1 } } }],
        // Pipeline 3: Aktivnost po danima
        byDay: [
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } }, // Sortiramo datume hronološki
        ],
      },
    },
  ]).exec();

  // Inicijalizacija default vrednosti
  const stats: VocabularyStatsDTO = {
    byStatus: { new: 0, learning: 0, mastered: 0 },
    byLanguage: {},
    byDay: {},
  };

  // Ako je "result" undefined (ekstremno retko) ili korisnik nema reči
  if (!result) return stats;

  // 2. MAPIRANJE REZULTATA (Transformacija niza u mape)
  result.byStatus.forEach((item: { _id: string; count: number }) => {
    if (["new", "learning", "mastered"].includes(item._id)) {
      stats.byStatus[item._id as "new" | "learning" | "mastered"] = item.count;
    }
  });

  result.byLanguage.forEach((item: { _id: string; count: number }) => {
    if (item._id) stats.byLanguage[item._id] = item.count;
  });

  result.byDay.forEach((item: { _id: string; count: number }) => {
    if (item._id) stats.byDay[item._id] = item.count;
  });

  return stats;
};

export const vocabularyRepository = {
  createEntry,
  findEntries,
  findEntryById,
  updateEntry,
  deleteEntry,
  getVocabularyStats,
};
