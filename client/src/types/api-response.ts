import type { ErrorCode } from "@/lib/error-codes";

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
};

export type FailResponse = {
  success: false;
  data: null;
  message: string;
  errorCode: ErrorCode;
};

export type ApiResponse<T> = SuccessResponse<T> | FailResponse;
