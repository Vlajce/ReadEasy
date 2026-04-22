import { Translation, type ITranslation } from "../models/translation.model.js";

type CreateTranslationData = Omit<
  ITranslation,
  "_id" | "createdAt" | "updatedAt" | "hitCount"
>;

const findByCacheKey = async (
  cacheKey: string,
): Promise<ITranslation | null> => {
  return Translation.findOneAndUpdate(
    { cacheKey },
    { $inc: { hitCount: 1 } },
    { new: true },
  )
    .lean()
    .exec();
};

const create = async (data: CreateTranslationData): Promise<ITranslation> => {
  const doc = await Translation.create(data);
  return doc.toObject();
};

export const translationRepository = {
  findByCacheKey,
  create,
};
