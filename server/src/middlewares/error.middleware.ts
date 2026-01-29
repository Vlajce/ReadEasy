import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app.error.js";
import { sendError } from "../utils/response.handler.js";
import { ErrorCodes } from "../utils/error.codes.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.errorCode, err.statusCode);
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message || "Validation failer";
    return sendError(res, message, ErrorCodes.VAL_FAILED, 400);
  }

  console.error("UNEXPECTED ERROR:", err);
  return sendError(
    res,
    "Internal server error",
    ErrorCodes.SYS_INTERNAL_ERROR,
    500,
  );
};
