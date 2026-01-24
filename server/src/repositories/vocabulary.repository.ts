import { Vocabulary, type IVocabulary } from "../models/vocabulary.model.js";
import type {
  CreateVocabularyInput,
  UpdateVocabularyInput,
  FindVocabularyQueryInput,
} from "../validation/vocabulary.schema.js";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

const createVocabulary = async (
  userId: string,
  data: CreateVocabularyInput,
): Promise<IVocabulary> => {
  return Vocabulary.create({
    userId,
    word: data.word,
    meaning: data.meaning ?? null,
    bookId: data.bookId ? data.bookId : null,
    context: data.context ?? null,
    position: data.position ?? null,
    language: data.language ?? null,
    status: data.status,
    occurrenceCount: data.occurrenceCount,
  });
};

const findVocabulary = async (
  userId: string,
  query: FindVocabularyQueryInput,
): Promise<PaginatedResult<IVocabulary>> => {
  const pageNum = Math.max(1, Number(query.page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const filter: Record<string, unknown> = { userId };

  if (query.bookId) filter.bookId = query.bookId;
  if (query.status) filter.status = query.status;
  if (query.language) filter.language = query.language;

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const total = await Vocabulary.countDocuments(filter).exec();
  const totalPages = Math.ceil(total / limitNum);
  const effectivePage = totalPages > 0 ? Math.min(pageNum, totalPages) : 1;

  const data = await Vocabulary.find(filter)
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

const findVocabularyById = async (
  id: string,
  userId: string,
): Promise<IVocabulary | null> => {
  return Vocabulary.findOne({ _id: id, userId }).lean().exec();
};

const updateVocabulary = async (
  id: string,
  userId: string,
  data: UpdateVocabularyInput,
): Promise<IVocabulary | null> => {
  return Vocabulary.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true },
  )
    .lean()
    .exec();
};

const deleteVocabulary = async (
  id: string,
  userId: string,
): Promise<boolean> => {
  const result = await Vocabulary.deleteOne({ _id: id, userId }).exec();
  return result.deletedCount === 1;
};

export const vocabularyRepository = {
  createVocabulary,
  findVocabulary,
  findVocabularyById,
  updateVocabulary,
  deleteVocabulary,
};
