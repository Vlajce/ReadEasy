import type { ErrorCode } from "@/lib/error-codes";

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode: ErrorCode;

  constructor(message: string, statusCode: number, errorCode: ErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
