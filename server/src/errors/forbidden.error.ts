import { ErrorCodes, type ErrorCode } from "../utils/error.codes.js";
import { AppError } from "./app.error.js";

export class ForbiddenError extends AppError {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCodes.AUTH_FORBIDDEN,
  ) {
    super(message, 403, errorCode);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
