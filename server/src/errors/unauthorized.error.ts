import { ErrorCodes, type ErrorCode } from "../utils/error.codes.js";
import { AppError } from "./app.error.js";

export class UnauthorizedError extends AppError {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCodes.AUTH_UNAUTHORIZED,
  ) {
    super(message, 401, errorCode);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
