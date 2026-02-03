import type { Request, Response } from "express";
import { vocabularyRepository } from "../repositories/vocabulary.repository.js";
import {
  createVocabularySchema,
  updateVocabularySchema,
  findVocabularyQuerySchema,
} from "../validation/vocabulary.schema.js";
import { asyncHandler } from "../utils/async.handler.js";
import { sendSuccess } from "../utils/response.handler.js";
import { NotFoundError } from "../errors/not.found.error.js";
import { isMongoDuplicateError } from "../utils/db.errors.js";
import { ConflictError } from "../errors/conflict.error.js";
import type {
  PaginatedVocabularyDTO,
  VocabularyStatsDTO,
} from "../types/vocabulary.dto.js";
import {
  toVocabularyDetailDTO,
  toVocabularyListDTO,
} from "../mappers/vocabulary.mapper.js";

const getVocabularyEntries = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const query = findVocabularyQuerySchema.parse(req.query);

    const result = await vocabularyRepository.findEntries(userId, query);

    const paginatedDTO: PaginatedVocabularyDTO = {
      data: result.data.map(toVocabularyListDTO),
      meta: result.meta,
    };

    return sendSuccess<PaginatedVocabularyDTO>(
      res,
      paginatedDTO,
      "Vocabulary entries fetched successfully",
      200,
    );
  },
);

const getVocabularyEntryById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const entry = await vocabularyRepository.findEntryById(
      id as string,
      userId,
    );

    if (!entry) {
      throw new NotFoundError("Vocabulary entry not found");
    }

    return sendSuccess(
      res,
      toVocabularyDetailDTO(entry),
      "Vocabulary entry fetched successfully",
      200,
    );
  },
);

const createVocabularyEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const parsed = createVocabularySchema.parse(req.body);

    try {
      const entry = await vocabularyRepository.createEntry(userId, parsed);
      return sendSuccess(
        res,
        toVocabularyDetailDTO(entry),
        "Vocabulary entry created successfully",
        201,
      );
    } catch (error) {
      if (isMongoDuplicateError(error)) {
        throw new ConflictError(
          "Vocabulary entry with this word and language already exists",
        );
      }
      throw error;
    }
  },
);

const updateVocabularyEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updates = updateVocabularySchema.parse(req.body);

    try {
      const updated = await vocabularyRepository.updateEntry(
        id as string,
        userId,
        updates,
      );

      if (!updated) {
        throw new NotFoundError("Vocabulary entry not found");
      }

      return sendSuccess(
        res,
        toVocabularyDetailDTO(updated),
        "Vocabulary entry updated successfully",
        200,
      );
    } catch (error) {
      if (isMongoDuplicateError(error)) {
        throw new ConflictError(
          "Another vocabulary entry with this word and language already exists",
        );
      }
      throw error;
    }
  },
);

const deleteVocabularyEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const deleted = await vocabularyRepository.deleteEntry(
      id as string,
      userId,
    );

    if (!deleted) {
      throw new NotFoundError("Vocabulary entry not found");
    }

    return sendSuccess(res, null, "Vocabulary entry deleted successfully", 204);
  },
);

const vocabularyStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const stats: VocabularyStatsDTO =
    await vocabularyRepository.getVocabularyStats(userId!);

  return sendSuccess(res, stats, "Vocabulary stats fetched successfully", 200);
});

export const vocabularyController = {
  getVocabularyEntries,
  getVocabularyEntryById,
  createVocabularyEntry,
  updateVocabularyEntry,
  deleteVocabularyEntry,
  vocabularyStats,
};
