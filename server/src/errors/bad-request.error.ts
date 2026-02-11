import { ErrorCodes, type ErrorCode } from "../utils/error.codes.js";
import { AppError } from "./app.error.js";

export class BadRequestError extends AppError {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCodes.VAL_BAD_REQUEST,
  ) {
    super(message, 400, errorCode);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
