import type { Response } from "express";
import type { SuccessResponse, FailResponse } from "../types/api-response.js";
import type { ErrorCode } from "./error.codes.js";

export function sendSuccess<T>(
  res: Response<SuccessResponse<T>>,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response<FailResponse>,
  message: string,
  errorCode: ErrorCode,
  statusCode: number = 400,
): void {
  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errorCode,
  });
}
