import type { Request, Response } from "express";
import { translationService } from "../services/translation.service.js";
import { translationRequestSchema } from "../validation/vocabulary.schema.js";
import { asyncHandler } from "../utils/async.handler.js";
import { sendSuccess } from "../utils/response.handler.js";

const translate = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const parsed = translationRequestSchema.parse(req.body);

  const result = await translationService.translateWord({
    userId,
    word: parsed.word,
    sentence: parsed.sentence,
    bookId: parsed.bookId,
  });

  return sendSuccess(res, result, "Translation fetched successfully", 200);
});

export const translationController = { translate };
