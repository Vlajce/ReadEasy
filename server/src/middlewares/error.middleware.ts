import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app.error.js";
import { sendError } from "../utils/response.handler.js";
import { ErrorCodes } from "../utils/error.codes.js";
import { isMongoDuplicateError } from "../utils/db.errors.js";

// Vadimo klase iz default importa
const { JsonWebTokenError, TokenExpiredError } = jwt;

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
    const message = err.issues[0]?.message || "Validation failed";
    return sendError(res, message, ErrorCodes.VAL_FAILED, 400);
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    return sendError(
      res,
      "Invalid or expired token",
      ErrorCodes.AUTH_INVALID_TOKEN,
      401,
    );
  }

  if (isMongoDuplicateError(err)) {
    return sendError(res, "Resource conflict", ErrorCodes.RES_CONFLICT, 409);
  }

  console.error("UNEXPECTED ERROR:", err);
  return sendError(
    res,
    "Internal server error",
    ErrorCodes.SYS_INTERNAL_ERROR,
    500,
  );
};
