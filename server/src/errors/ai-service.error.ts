import { ErrorCodes, type ErrorCode } from "../utils/error.codes.js";
import { AppError } from "./app.error.js";

export class AiServiceError extends AppError {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCodes.SYS_EXTERNAL_SERVICE,
  ) {
    super(message, 502, errorCode);
    Object.setPrototypeOf(this, AiServiceError.prototype);
  }
}
