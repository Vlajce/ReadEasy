export const ErrorCodes = {
  // Auth
  AUTH_UNAUTHORIZED: "AUTH_001",
  AUTH_INVALID_TOKEN: "AUTH_002",
  AUTH_FORBIDDEN: "AUTH_003",

  // Validation
  VAL_FAILED: "VAL_001",
  VAL_BAD_REQUEST: "VAL_002",

  // Resources
  RES_NOT_FOUND: "RES_001",
  RES_CONFLICT: "RES_002",

  // SYSTEM
  SYS_INTERNAL_ERROR: "SYS_001",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
