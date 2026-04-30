import type { Request, Response } from "express";
import { exerciseService } from "../services/exercise.service.js";
import {
  generateExercisesQuerySchema,
  submitExercisesSchema,
} from "../validation/exercise.schema.js";
import { asyncHandler } from "../utils/async.handler.js";
import { sendSuccess } from "../utils/response.handler.js";

const generateExercises = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const parsed = generateExercisesQuerySchema.parse(req.query);
  const exercises = await exerciseService.generateExercises(userId, parsed);

  return sendSuccess(res, exercises, "Exercises generated successfully", 200);
});

const submitExerciseResults = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const parsed = submitExercisesSchema.parse(req.body);
    await exerciseService.submitExercises(userId, parsed);

    return sendSuccess(
      res,
      null,
      "Exercise results submitted successfully",
      200,
    );
  },
);

export const exerciseController = {
  generateExercises,
  submitExerciseResults,
};
