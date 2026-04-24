import type { Request, Response } from "express";
import {
  createVocabularySchema,
  updateVocabularySchema,
  findVocabularyQuerySchema,
  activityStatsQuerySchema,
  saveVocabularySchema,
} from "../validation/vocabulary.schema.js";
import { asyncHandler } from "../utils/async.handler.js";
import { sendSuccess } from "../utils/response.handler.js";
import type {
  PaginatedVocabularyDTO,
  BookVocabularyWordDTO,
  StatsResponse,
} from "../types/vocabulary.js";
import {
  toVocabularyEntryDetailDTO,
  toVocabularyEntryDTO,
} from "../mappers/vocabulary.mapper.js";
import { vocabularyService } from "../services/vocabulary.service.js";

const getVocabularyEntries = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const query = findVocabularyQuerySchema.parse(req.query);
    const result = await vocabularyService.getEntries(userId, query);

    const paginatedDTO: PaginatedVocabularyDTO = {
      data: result.data.map(toVocabularyEntryDTO),
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
    const entry = await vocabularyService.getEntryById(id as string, userId);

    return sendSuccess(
      res,
      toVocabularyEntryDetailDTO(entry),
      "Vocabulary entry fetched successfully",
      200,
    );
  },
);

const createVocabularyEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const parsed = createVocabularySchema.parse(req.body);
    const entry = await vocabularyService.createEntry(userId, parsed);

    return sendSuccess(
      res,
      toVocabularyEntryDetailDTO(entry),
      "Vocabulary entry created successfully",
      201,
    );
  },
);

const saveVocabularyEntry = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const parsed = saveVocabularySchema.parse(req.body);
  const entry = await vocabularyService.saveVocabulary(userId, parsed);

  return sendSuccess(
    res,
    toVocabularyEntryDetailDTO(entry),
    "Vocabulary saved successfully",
    200,
  );
});

const updateVocabularyEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updates = updateVocabularySchema.parse(req.body);
    const updated = await vocabularyService.updateEntry(
      id as string,
      userId,
      updates,
    );

    return sendSuccess(
      res,
      toVocabularyEntryDetailDTO(updated),
      "Vocabulary entry updated successfully",
      200,
    );
  },
);

const deleteVocabularyEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    await vocabularyService.deleteEntry(id as string, userId);

    return sendSuccess(res, null, "Vocabulary entry deleted successfully", 200);
  },
);

const getBookWords = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { bookId } = req.params;
  const words = await vocabularyService.getBookWords(userId, bookId as string);

  const dto: BookVocabularyWordDTO[] = words.map((w) => ({
    word: w.word,
    highlightColor: w.highlightColor as BookVocabularyWordDTO["highlightColor"],
  }));

  return sendSuccess(
    res,
    dto,
    "Book vocabulary words fetched successfully",
    200,
  );
});

const getStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { days } = activityStatsQuerySchema.parse(req.query);
  const stats: StatsResponse = await vocabularyService.getStats(userId, days);

  return sendSuccess<StatsResponse>(
    res,
    stats,
    "Stats fetched successfully",
    200,
  );
});

export const vocabularyController = {
  getVocabularyEntries,
  getVocabularyEntryById,
  createVocabularyEntry,
  saveVocabularyEntry,
  updateVocabularyEntry,
  deleteVocabularyEntry,
  getBookWords,
  getStats,
};
