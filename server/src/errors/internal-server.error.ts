import { ErrorCodes, type ErrorCode } from "../utils/error.codes.js";
import { AppError } from "./app.error.js";

export class InternalServerError extends AppError {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCodes.SYS_INTERNAL_ERROR,
  ) {
    super(message, 500, errorCode);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
